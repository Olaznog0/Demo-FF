import type { Handler } from "@netlify/functions";
import { Resend } from "resend";
import { createCalendarClient, getEmailConfig, getGoogleCalendarConfig } from "./_shared/booking";
import { appointmentCalendarConfig, getAppointmentService } from "../../src/modules/appointmentCalendar/config";
import { withClient } from "../../integration-context.js";

function html(statusCode: number, title: string, message: string) {
  return {
    statusCode,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{font-family:Arial,sans-serif;margin:0;min-height:100vh;display:grid;place-items:center;background:#f7f8fc;color:#101828}.panel{max-width:560px;background:#fff;padding:32px;border-radius:16px;box-shadow:0 16px 40px rgba(15,23,42,.08)}h1{margin-top:0}</style></head><body><main class="panel"><h1>${title}</h1><p>${message}</p></main></body></html>`,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatEventDateTime(startsAt?: string | null, endsAt?: string | null) {
  if (!startsAt) return "-";
  const start = new Date(startsAt);
  const end = endsAt ? new Date(endsAt) : null;
  const date = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: appointmentCalendarConfig.timeZone,
  }).format(start);
  const startTime = new Intl.DateTimeFormat("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: appointmentCalendarConfig.timeZone,
  }).format(start);
  const endTime = end
    ? new Intl.DateTimeFormat("nl-NL", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: appointmentCalendarConfig.timeZone,
      }).format(end)
    : "";

  return endTime ? `${date}, ${startTime} - ${endTime}` : `${date}, ${startTime}`;
}

async function sendCancellationEmails({
  customerEmail,
  customerName,
  serviceName,
  when,
}: {
  customerEmail?: string;
  customerName?: string;
  serviceName: string;
  when: string;
}) {
  const { apiKey, from, adminEmail } = getEmailConfig();
  const resend = new Resend(apiKey);
  const business = appointmentCalendarConfig.business;
  const subject = "Afspraak geannuleerd";
  const customerText = [
    customerName ? `Beste ${customerName},` : "Beste klant,",
    "",
    `Uw afspraak voor ${serviceName} is geannuleerd.`,
    `Wanneer: ${when}`,
    "",
    `Wilt u opnieuw boeken? Ga naar de website of neem contact op met ${business.phone}.`,
    "",
    `${business.name}`,
    business.addressLines.join(", "),
    business.email,
    business.phone,
  ].join("\n");
  const adminText = [
    "Een afspraak is geannuleerd via de e-mail annuleerlink.",
    "",
    `Klant: ${customerName || "-"}`,
    `E-mail: ${customerEmail || "-"}`,
    `Dienst: ${serviceName}`,
    `Wanneer: ${when}`,
  ].join("\n");
  const customerHtml = `<!doctype html><html><body style="margin:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#222;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 12px;background:#f4f6fb;"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fff;"><tr><td style="padding:26px 34px 0;"><div style="font-size:26px;font-weight:800;color:#1f2937;">${escapeHtml(business.name)}</div><div style="height:5px;background:linear-gradient(90deg,#d4141d 0%,#d4141d 48%,#111b4d 48%,#111b4d 100%);margin-top:18px;"></div></td></tr><tr><td style="padding:34px;"><h1 style="margin:0 0 16px;font-size:32px;line-height:1.15;">Uw afspraak is geannuleerd</h1><p style="margin:0 0 24px;color:#555;line-height:1.6;">We hebben uw afspraak uit onze agenda verwijderd.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;"><tr><td style="background:#f0f0f0;padding:10px 18px;font-size:19px;color:#444;">Geannuleerde afspraak</td></tr><tr><td style="padding:18px;line-height:1.7;"><strong>Dienst:</strong> ${escapeHtml(serviceName)}<br /><strong>Wanneer:</strong> ${escapeHtml(when)}<br /><strong>Naam:</strong> ${escapeHtml(customerName || "-")}</td></tr><tr><td style="background:#f0f0f0;padding:10px 18px;font-size:19px;color:#444;">Contact</td></tr><tr><td style="padding:18px;line-height:1.6;">${escapeHtml(business.addressLines.join(", "))}<br /><a style="color:#d4141d;" href="mailto:${escapeHtml(business.email)}">${escapeHtml(business.email)}</a><br /><a style="color:#d4141d;" href="tel:${escapeHtml(business.phoneHref)}">${escapeHtml(business.phone)}</a></td></tr></table></td></tr></table></td></tr></table></body></html>`;

  const sends = [];
  if (customerEmail) {
    sends.push(
      resend.emails.send({
        from,
        to: customerEmail,
        subject,
        text: customerText,
        html: customerHtml,
      }),
    );
  }
  if (adminEmail) {
    sends.push(
      resend.emails.send({
        from,
        to: adminEmail,
        subject: `Afspraak geannuleerd: ${serviceName}`,
        text: adminText,
      }),
    );
  }

  const results = await Promise.allSettled(sends);
  const failures = results.filter((result) => result.status === "rejected");
  if (failures.length > 0) {
    console.warn("Cancellation email send failed.", failures);
  }
}

const originalHandler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return html(405, "Niet beschikbaar", "Deze link ondersteunt alleen annuleren via de knop in uw e-mail.");
  }

  const eventId = event.queryStringParameters?.eventId;
  const token = event.queryStringParameters?.token;

  if (!eventId || !token) {
    return html(400, "Ongeldige link", "De annuleerlink mist gegevens.");
  }

  try {
    const { calendarId } = getGoogleCalendarConfig();
    const calendar = createCalendarClient();
    const response = await calendar.events.get({ calendarId, eventId });
    const eventItem = response.data;
    const storedToken = eventItem.extendedProperties?.private?.cancellationToken;

    if (!storedToken || storedToken !== token) {
      return html(403, "Ongeldige link", "Deze annuleerlink is niet geldig voor deze afspraak.");
    }

    const privateProps = eventItem.extendedProperties?.private || {};
    const customerEmail = privateProps.customerEmail;
    const customerName = privateProps.customerName;
    const service = privateProps.serviceId ? getAppointmentService(privateProps.serviceId) : null;
    const serviceName = service?.name.nl || eventItem.summary?.replace("F&F booking: ", "") || "afspraak";
    const when = formatEventDateTime(eventItem.start?.dateTime || eventItem.start?.date, eventItem.end?.dateTime || eventItem.end?.date);

    await calendar.events.delete({ calendarId, eventId });

    await sendCancellationEmails({ customerEmail, customerName, serviceName, when });

    return html(200, "Afspraak geannuleerd", "Uw afspraak is direct uit de agenda verwijderd. We sturen ook een bevestiging naar de klant en de garage.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Annuleren is mislukt.";
    return html(500, "Annuleren mislukt", message);
  }
};
export const handler: Handler = withClient(originalHandler, "calendar");
