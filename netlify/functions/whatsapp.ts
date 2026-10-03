import type { Handler } from "@netlify/functions";
import { google } from "googleapis";
import { bookingSlots, dateFromLocalKey, disabledDemoSlots, toLocalDateKey } from "./_shared/booking";
import { json } from "./_shared/http";
import { withClient, secret } from "../../integration-context.js";

type WhatsAppWebhook = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{
          from: string;
          id: string;
          text?: { body?: string };
          type?: string;
        }>;
      };
    }>;
  }>;
};

type FAQAnswer = {
  keywords: string[];
  answer: string;
};

const faqAnswers: FAQAnswer[] = [
  {
    keywords: ["apk", "mot", "inspection", "keuring", "check"],
    answer:
      "An APK/MOT or general check duration depends on the planning and the car condition, but we can usually give a clear time estimate before we start.",
  },
  {
    keywords: ["extra", "cost", "kosten", "price", "prijs", "werk"],
    answer:
      "We always aim to discuss extra work and pricing before carrying anything out, so there are no surprises.",
  },
  {
    keywords: ["brand", "merk", "model", "auto", "car"],
    answer:
      "We can help with maintenance and common repairs for many car brands. Send your car model and issue, and we will advise the best next step.",
  },
  {
    keywords: ["wait", "wachten", "while", "blijven"],
    answer:
      "For short checks it may be possible to wait, but it depends on the job and planning. We recommend confirming before your appointment.",
  },
  {
    keywords: ["bring", "meenemen", "appointment", "afspraak"],
    answer:
      "Please bring your license plate details, contact information, and a short description of the service or issue.",
  },
  {
    keywords: ["address", "adres", "route", "parking", "parkeren"],
    answer:
      "We are at Populierendreef 990A, 2272 HX Voorburg. Parking is usually available on the street nearby.",
  },
  {
    keywords: ["hours", "opening", "open", "tijd"],
    answer: "Opening hours are Monday to Friday 08:00 - 17:30. Saturday and Sunday are closed.",
  },
];

const humanKeywords = ["human", "person", "agent", "medewerker", "mens", "iemand", "call me", "bel mij", "bellen"];
const availabilityKeywords = [
  "available",
  "availability",
  "slot",
  "calendar",
  "date",
  "day",
  "morgen",
  "vandaag",
  "afspraak",
  "beschikbaar",
  "planning",
  "boek",
  "book",
];

function normalize(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function wantsHuman(text: string) {
  const normalized = normalize(text);
  return humanKeywords.some((keyword) => normalized.includes(keyword));
}

function wantsAvailability(text: string) {
  const normalized = normalize(text);
  return availabilityKeywords.some((keyword) => normalized.includes(keyword)) || Boolean(parseRequestedDate(text));
}

function matchFAQ(text: string) {
  const normalized = normalize(text);
  return faqAnswers.find((item) => item.keywords.some((keyword) => normalized.includes(keyword)));
}

function parseRequestedDate(text: string) {
  const normalized = normalize(text);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (normalized.includes("today") || normalized.includes("vandaag")) {
    return toLocalDateKey(today);
  }

  if (normalized.includes("tomorrow") || normalized.includes("morgen")) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return toLocalDateKey(tomorrow);
  }

  const isoMatch = normalized.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;
  }

  const shortMatch = normalized.match(/\b(\d{1,2})[-/](\d{1,2})(?:[-/](20\d{2}))?\b/);
  if (!shortMatch) return null;

  const day = Number(shortMatch[1]);
  const month = Number(shortMatch[2]);
  const year = shortMatch[3] ? Number(shortMatch[3]) : today.getFullYear();
  const candidate = new Date(year, month - 1, day);

  if (!shortMatch[3] && candidate < today) {
    candidate.setFullYear(candidate.getFullYear() + 1);
  }

  return toLocalDateKey(candidate);
}

function extractMessages(payload: WhatsAppWebhook) {
  return (
    payload.entry?.flatMap((entry) =>
      entry.changes?.flatMap((change) =>
        change.value?.messages?.map((message) => ({
          from: message.from,
          body: message.text?.body || "",
        })) || [],
      ) || [],
    ) || []
  );
}

async function sendWhatsAppMessage(to: string, body: string) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const graphVersion = process.env.WHATSAPP_GRAPH_API_VERSION || "v21.0";

  if (!accessToken || !phoneNumberId) {
    console.warn("WhatsApp reply skipped because Cloud API env vars are missing.");
    return;
  }

  const response = await fetch(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { preview_url: false, body },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`WhatsApp send failed: ${errorBody}`);
  }
}

async function getBusySlots(dateKey: string) {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!calendarId || !clientEmail || !privateKey) {
    return disabledDemoSlots(dateFromLocalKey(dateKey));
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/calendar.freebusy"],
  });
  const calendar = google.calendar({ version: "v3", auth });
  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: `${dateKey}T00:00:00+01:00`,
      timeMax: `${dateKey}T23:59:59+01:00`,
      timeZone: "Europe/Amsterdam",
      items: [{ id: calendarId }],
    },
  });

  const busy = response.data.calendars?.[calendarId]?.busy || [];
  return bookingSlots.filter((slot) =>
    busy.some((range) => {
      if (!range.start || !range.end) return false;
      const slotStart = `${dateKey}T${slot}:00`;
      return slotStart >= range.start.slice(0, 19) && slotStart < range.end.slice(0, 19);
    }),
  );
}

async function availabilityReply(text: string) {
  const dateKey = parseRequestedDate(text) || toLocalDateKey(new Date());
  const busySlots = await getBusySlots(dateKey);
  const available = bookingSlots.filter((slot) => !busySlots.includes(slot)).slice(0, 4);

  if (available.length === 0) {
    return `I do not see open demo slots for ${dateKey}. I can ask a human from the garage to check alternatives for you.`;
  }

  return [
    `For ${dateKey}, these options look available:`,
    available.map((slot) => `- ${slot}`).join("\n"),
    "",
    "Reply with your preferred time, or type 'human' if you want someone from the garage to help directly.",
  ].join("\n");
}

function humanReply() {
  const phone = process.env.WHATSAPP_HUMAN_PHONE || "070 300 07 30";
  return `No problem. I will hand this over to a human. You can also call the garage directly on ${phone}.`;
}

function fallbackReply() {
  return [
    "Thanks for your message. I can help with:",
    "- Opening hours, address and parking",
    "- APK/MOT, diagnostics, repairs and service questions",
    "- Available appointment dates and suggested time slots",
    "",
    "Ask a question, send a date like 2026-05-20, or type 'human' to talk to someone.",
  ].join("\n");
}

async function notifyHuman(from: string, text: string) {
  const notifyNumber = process.env.WHATSAPP_HUMAN_NOTIFY_NUMBER;
  if (!notifyNumber) return;

  await sendWhatsAppMessage(
    notifyNumber,
    [`Human handoff requested.`, `Customer WhatsApp: ${from}`, "", `Message: ${text}`].join("\n"),
  );
}

async function createReply(text: string) {
  if (wantsHuman(text)) return humanReply();
  if (wantsAvailability(text)) return availabilityReply(text);
  const faq = matchFAQ(text);
  if (faq) return faq.answer;
  return fallbackReply();
}

const originalHandler: Handler = async (event) => {
  if (event.httpMethod === "GET") {
    const params = event.queryStringParameters || {};
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (params["hub.mode"] === "subscribe" && params["hub.verify_token"] === verifyToken) {
      return {
        statusCode: 200,
        body: params["hub.challenge"] || "",
      };
    }

    return json(403, { error: "Webhook verification failed" });
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const payload = JSON.parse(event.body || "{}") as WhatsAppWebhook;
  const messages = extractMessages(payload).filter((message) => message.body);

  await Promise.all(
    messages.map(async (message) => {
      const reply = await createReply(message.body);
      await sendWhatsAppMessage(message.from, reply);
      if (wantsHuman(message.body)) {
        await notifyHuman(message.from, message.body);
      }
    }),
  );

  return json(200, { ok: true });
};
export const handler: Handler = withClient(originalHandler, "whatsapp");
