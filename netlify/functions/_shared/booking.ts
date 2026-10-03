import { randomUUID } from "node:crypto";
import { google } from "googleapis";
import { Resend } from "resend";
import { appointmentCalendarConfig, getAppointmentService } from "../../../src/modules/appointmentCalendar/config";
import {
  addMinutes,
  createSlotsForService,
  dateFromKey,
  isBookableBusinessDate,
  type AvailabilitySlot,
} from "../../../src/modules/appointmentCalendar/scheduling";
import type { Locale } from "../../../src/types/content";
import { secret } from "../../../integration-context.js";

const demoAvailabilityService = appointmentCalendarConfig.services[3] || appointmentCalendarConfig.services[0];

export const bookingSlots = demoAvailabilityService
  ? createSlotsForService(new Date(2026, 4, 20), demoAvailabilityService).map((slot) => slot.time)
  : [];

export function toLocalDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function dateFromLocalKey(dateKey: string) {
  return dateFromKey(dateKey);
}

export function disabledDemoSlots(date: Date | null) {
  if (!date) return [];
  const blocked: Record<number, string[]> = {
    1: ["09:00", "12:30"],
    2: ["10:30", "14:00"],
    3: ["08:30", "15:30"],
    4: ["11:00", "13:30"],
    5: ["09:30", "16:00"],
  };
  return blocked[date.getDay()] || [];
}

export type BookingCustomer = {
  name: string;
  email: string;
  phone?: string;
};

export type NormalizedBooking = {
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
  date: string;
  time: string;
  endTime: string;
  locale: string;
  customer: BookingCustomer;
};

type BusyInterval = {
  start?: string | null;
  end?: string | null;
};

export function getBaseUrl(eventUrl?: string) {
  const configured = process.env.BOOKING_BASE_URL || process.env.URL;
  if (configured) return configured.replace(/\/$/, "");
  if (!eventUrl) return "http://localhost:8888";
  const url = new URL(eventUrl);
  return `${url.protocol}//${url.host}`;
}

export function getGoogleCalendarConfig() {
  const calendarId = secret("GOOGLE_CALENDAR_ID");
  const clientEmail = secret("GOOGLE_CLIENT_EMAIL");
  const privateKey = secret("GOOGLE_PRIVATE_KEY")?.replace(/\\n/g, "\n");

  if (!calendarId || !clientEmail || !privateKey) {
    throw new Error("Calendar integration is not configured");
  }

  return { calendarId, clientEmail, privateKey };
}

export function createCalendarClient() {
  const { clientEmail, privateKey } = getGoogleCalendarConfig();
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  return google.calendar({ version: "v3", auth });
}

function getOffsetMs(timeZone: string, date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(Number(map.year), Number(map.month) - 1, Number(map.day), Number(map.hour), Number(map.minute), Number(map.second));
  return asUtc - date.getTime();
}

export function zonedTimeToDate(dateKey: string, time: string, timeZone = appointmentCalendarConfig.timeZone) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
  return new Date(utcGuess.getTime() - getOffsetMs(timeZone, utcGuess));
}

export function normalizeBookingPayload(payload: unknown): NormalizedBooking {
  const body = payload as {
    serviceId?: string;
    date?: string;
    time?: string;
    locale?: string;
    customer?: Partial<BookingCustomer>;
  };

  if (!body.serviceId || !body.date || !body.time || !body.customer?.name || !body.customer.email) {
    throw new Error("Service, date, time, name and email are required");
  }

  const service = getAppointmentService(body.serviceId);
  const date = dateFromKey(body.date);
  if (!service || !isBookableBusinessDate(date)) {
    throw new Error("Selected service or date is not available");
  }

  const allowedSlot = createSlotsForService(date, service).some((slot) => slot.time === body.time);
  if (!allowedSlot) {
    throw new Error("Selected time is not available for this service");
  }

  const locale = body.locale === "en-GB" ? "en-GB" : "nl-NL";

  return {
    serviceId: service.id,
    serviceName: service.name[locale === "en-GB" ? "en" : "nl"],
    durationMinutes: service.durationMinutes,
    date: body.date,
    time: body.time,
    endTime: addMinutes(body.time, service.durationMinutes),
    locale,
    customer: {
      name: body.customer.name,
      email: body.customer.email,
      phone: body.customer.phone || "",
    },
  };
}

function overlaps(slotStart: Date, slotEnd: Date, busy: BusyInterval) {
  if (!busy.start || !busy.end) return false;
  const busyStart = new Date(busy.start);
  const busyEnd = new Date(busy.end);
  return slotStart < busyEnd && slotEnd > busyStart;
}

export async function getAvailability(serviceId: string, dateKeyValue: string): Promise<AvailabilitySlot[]> {
  const service = getAppointmentService(serviceId);
  const date = dateFromKey(dateKeyValue);
  if (!service || !isBookableBusinessDate(date)) return [];

  const slots = createSlotsForService(date, service);
  const { calendarId } = getGoogleCalendarConfig();
  const calendar = createCalendarClient();
  const timeMin = zonedTimeToDate(dateKeyValue, "00:00").toISOString();
  const timeMax = zonedTimeToDate(dateKeyValue, "23:59").toISOString();
  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      timeZone: appointmentCalendarConfig.timeZone,
      items: [{ id: calendarId }],
    },
  });
  const calendarAvailability = response.data.calendars?.[calendarId];
  const calendarErrors = calendarAvailability?.errors || [];

  if (calendarErrors.length > 0) {
    const reasons = calendarErrors.map((error) => error.reason || error.domain || "unknown").join(", ");
    throw new Error(`Google Calendar availability failed for ${calendarId}: ${reasons}`);
  }

  const busy = calendarAvailability?.busy || [];

  return slots.map((slot) => {
    const slotStart = zonedTimeToDate(dateKeyValue, slot.time);
    const slotEnd = zonedTimeToDate(dateKeyValue, addMinutes(slot.time, service.durationMinutes));
    return {
      time: slot.time,
      available: !busy.some((interval) => overlaps(slotStart, slotEnd, interval)),
    };
  });
}

export async function assertSlotIsAvailable(booking: NormalizedBooking) {
  const slots = await getAvailability(booking.serviceId, booking.date);
  const slot = slots.find((item) => item.time === booking.time);
  if (!slot?.available) {
    throw new Error("Selected time is no longer available");
  }
}

export function createCancellationToken() {
  return randomUUID();
}

export function getEmailConfig() {
  const apiKey = secret("RESEND_API_KEY");
  const from = secret("BOOKING_FROM_EMAIL") || secret("CONTACT_FROM_EMAIL");
  const adminEmail = secret("BOOKING_ADMIN_EMAIL") || secret("CONTACT_TO_EMAIL");

  if (!apiKey || !from) {
    throw new Error("Email integration is not configured");
  }

  return { apiKey, from, adminEmail };
}

function formatDateTime(booking: Pick<NormalizedBooking, "date" | "time" | "locale">) {
  const date = dateFromKey(booking.date);
  const lang = booking.locale === "en-GB" ? "en-GB" : "nl-NL";
  const formattedDate = new Intl.DateTimeFormat(lang, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
  return `${formattedDate} om ${booking.time}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildBookingEmailHtml(booking: NormalizedBooking, cancelUrl: string) {
  const business = appointmentCalendarConfig.business;
  const isEnglish = booking.locale === "en-GB";
  const labels = {
    title: isEnglish ? "Good news - your appointment is booked" : "Goed nieuws - uw afspraak is geboekt",
    intro: isEnglish
      ? "Everything you need to know about your upcoming appointment is below."
      : "Alles wat u moet weten over uw afspraak staat hieronder.",
    glance: isEnglish ? "Your appointment at a glance" : "Uw afspraak in het kort",
    service: isEnglish ? "Service" : "Dienst",
    date: isEnglish ? "Date" : "Datum",
    time: isEnglish ? "Time" : "Tijd",
    duration: isEnglish ? "Duration" : "Duur",
    bookedFor: isEnglish ? "Booked for" : "Geboekt voor",
    plansChanged: isEnglish ? "Plans changed?" : "Plannen gewijzigd?",
    cancelText: isEnglish
      ? "If you cannot make it, cancel directly from this email so the garage can free the slot."
      : "Kunt u niet komen? Annuleer direct vanuit deze e-mail zodat de garage het tijdslot kan vrijgeven.",
    cancel: isEnglish ? "Cancel appointment" : "Afspraak annuleren",
    where: isEnglish ? "Where you're heading" : "Waar u naartoe gaat",
    contact: isEnglish ? "How to reach us" : "Contactgegevens",
    directions: isEnglish ? "Get directions" : "Route bekijken",
    reminder: isEnglish
      ? "You will receive a reminder 24 hours before your appointment."
      : "U ontvangt 24 uur voor uw afspraak een herinnering.",
  };

  const addressHtml = business.addressLines.map((line) => escapeHtml(line)).join("<br />");

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#222;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6fb;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border-radius:0;overflow:hidden;">
            <tr>
              <td style="padding:26px 34px 0;">
                <div style="font-size:26px;font-weight:800;color:#1f2937;">${escapeHtml(business.name)}</div>
                <div style="height:5px;background:linear-gradient(90deg,#d4141d 0%,#d4141d 48%,#111b4d 48%,#111b4d 100%);margin-top:18px;"></div>
              </td>
            </tr>
            <tr>
              <td style="padding:38px 34px 24px;text-align:center;">
                <h1 style="margin:0;font-size:34px;line-height:1.16;color:#333;font-weight:800;">${labels.title}</h1>
                <p style="margin:24px auto 0;max-width:520px;color:#555;font-size:16px;line-height:1.6;">${labels.intro}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 34px 34px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;">
                  <tr><td colspan="2" style="background:#f0f0f0;padding:10px 18px;font-size:19px;color:#444;">${labels.glance}</td></tr>
                  <tr>
                    <td style="padding:18px 18px 4px;width:34%;color:#555;">${labels.service}</td>
                    <td style="padding:18px 18px 4px;font-weight:700;">${escapeHtml(booking.serviceName)}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 18px;color:#555;">${labels.date}</td>
                    <td style="padding:4px 18px;">${escapeHtml(formatDateTime({ date: booking.date, time: booking.time, locale: booking.locale }))}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 18px;color:#555;">${labels.time}</td>
                    <td style="padding:4px 18px;">${escapeHtml(booking.time)} - ${escapeHtml(booking.endTime)}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 18px;color:#555;">${labels.duration}</td>
                    <td style="padding:4px 18px;">${booking.durationMinutes} min</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 18px 18px;color:#555;">${labels.bookedFor}</td>
                    <td style="padding:4px 18px 18px;">${escapeHtml(booking.customer.name)}</td>
                  </tr>
                  <tr><td colspan="2" style="background:#f0f0f0;padding:10px 18px;font-size:19px;color:#444;">${labels.plansChanged}</td></tr>
                  <tr>
                    <td colspan="2" style="padding:20px 18px;">
                      <p style="margin:0 0 16px;color:#555;line-height:1.55;">${labels.cancelText}</p>
                      <a href="${escapeHtml(cancelUrl)}" style="display:inline-block;background:#d4141d;color:#fff;text-decoration:none;padding:13px 28px;border-radius:6px;font-weight:700;">${labels.cancel}</a>
                    </td>
                  </tr>
                  <tr><td colspan="2" style="background:#f0f0f0;padding:10px 18px;font-size:19px;color:#444;">${labels.where}</td></tr>
                  <tr>
                    <td colspan="2" style="padding:18px;">
                      <div style="font-weight:700;color:#d4141d;">${escapeHtml(business.name)}</div>
                      <div style="line-height:1.5;color:#444;">${addressHtml}</div>
                      <a href="${escapeHtml(business.directionsUrl)}" style="color:#d4141d;">${labels.directions}</a>
                    </td>
                  </tr>
                  <tr><td colspan="2" style="background:#f0f0f0;padding:10px 18px;font-size:19px;color:#444;">${labels.contact}</td></tr>
                  <tr>
                    <td style="padding:18px;color:#555;">Email</td>
                    <td style="padding:18px;"><a href="mailto:${escapeHtml(business.email)}" style="color:#d4141d;">${escapeHtml(business.email)}</a></td>
                  </tr>
                  <tr>
                    <td style="padding:0 18px 18px;color:#555;">Phone</td>
                    <td style="padding:0 18px 18px;"><a href="tel:${escapeHtml(business.phoneHref)}" style="color:#d4141d;">${escapeHtml(business.phone)}</a></td>
                  </tr>
                </table>
                <p style="margin:18px 0 0;color:#6b7280;font-size:14px;line-height:1.5;">${labels.reminder}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function assertResendSuccess(result: Awaited<ReturnType<Resend["emails"]["send"]>>) {
  if (result.error) {
    throw new Error(`Resend email failed: ${result.error.message}`);
  }
}

export async function sendBookingConfirmation(booking: NormalizedBooking, cancelUrl: string) {
  const { apiKey, from, adminEmail } = getEmailConfig();
  const resend = new Resend(apiKey);
  const subject = booking.locale === "en-GB" ? "Your appointment confirmation" : "Bevestiging van uw afspraak";
  const text = [
    booking.locale === "en-GB" ? `Hi ${booking.customer.name},` : `Beste ${booking.customer.name},`,
    "",
    booking.locale === "en-GB"
      ? `Your appointment for ${booking.serviceName} is confirmed on ${formatDateTime(booking)}.`
      : `Uw afspraak voor ${booking.serviceName} is bevestigd op ${formatDateTime(booking)}.`,
    "",
    booking.locale === "en-GB" ? `Cancel directly: ${cancelUrl}` : `Direct annuleren: ${cancelUrl}`,
  ].join("\n");

  const result = await resend.emails.send({
    from,
    to: booking.customer.email,
    bcc: adminEmail || undefined,
    subject,
    text,
    html: buildBookingEmailHtml(booking, cancelUrl),
  });
  assertResendSuccess(result);
}

export async function sendBookingReminder(to: string, serviceName: string, startsAt: string, cancelUrl: string) {
  const { apiKey, from } = getEmailConfig();
  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to,
    subject: "Reminder voor uw afspraak",
    text: [`Herinnering: uw afspraak voor ${serviceName} staat gepland op ${startsAt}.`, "", `Annuleren: ${cancelUrl}`].join("\n"),
  });
  assertResendSuccess(result);
}

export function getCancelUrl(baseUrl: string, eventId: string, token: string) {
  const params = new URLSearchParams({ eventId, token });
  const { currentClient } = require("../../../integration-context.js");
  if (currentClient()?.id) params.set("client", currentClient().id);
  return `${baseUrl}/api/bookings/cancel?${params.toString()}`;
}
