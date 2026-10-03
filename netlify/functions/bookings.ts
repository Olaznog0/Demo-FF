import type { Handler } from "@netlify/functions";
import {
  assertSlotIsAvailable,
  createCalendarClient,
  createCancellationToken,
  getAvailability,
  getBaseUrl,
  getCancelUrl,
  getGoogleCalendarConfig,
  normalizeBookingPayload,
  sendBookingConfirmation,
} from "./_shared/booking";
import { appointmentCalendarConfig } from "../../src/modules/appointmentCalendar/config";
import { json } from "./_shared/http";
import { withClient } from "../../integration-context.js";

function bookingErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return "Booking failed";

  if (error.message === "Not Found") {
    return [
      "Google Calendar event creation failed: calendar not found or the service account does not have write access.",
      "Check GOOGLE_CALENDAR_ID and share that calendar with GOOGLE_CLIENT_EMAIL using 'Make changes to events'.",
    ].join(" ");
  }

  return error.message;
}

const originalHandler: Handler = async (event) => {
  if (event.httpMethod === "GET") {
    const serviceId = event.queryStringParameters?.serviceId;
    const date = event.queryStringParameters?.date;

    if (!serviceId || !date) {
      return json(400, { error: "Service and date are required" });
    }

    try {
      const slots = await getAvailability(serviceId, date);
      return json(200, { ok: true, slots });
    } catch (error) {
      return json(500, { error: error instanceof Error ? error.message : "Availability failed" });
    }
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    const booking = normalizeBookingPayload(JSON.parse(event.body || "{}"));
    await assertSlotIsAvailable(booking);

    const { calendarId } = getGoogleCalendarConfig();
    const calendar = createCalendarClient();
    const cancellationToken = createCancellationToken();

    const response = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `${appointmentCalendarConfig.business.name} booking: ${booking.serviceName}`,
        description: [
          `Customer: ${booking.customer.name}`,
          `Email: ${booking.customer.email}`,
          `Phone: ${booking.customer.phone || "-"}`,
          "",
          "Website booking created from the appointment calendar module.",
        ].join("\n"),
        start: { dateTime: `${booking.date}T${booking.time}:00`, timeZone: appointmentCalendarConfig.timeZone },
        end: { dateTime: `${booking.date}T${booking.endTime}:00`, timeZone: appointmentCalendarConfig.timeZone },
        extendedProperties: {
          private: {
            module: "appointment-calendar",
            serviceId: booking.serviceId,
            durationMinutes: String(booking.durationMinutes),
            customerName: booking.customer.name,
            customerEmail: booking.customer.email,
            customerPhone: booking.customer.phone || "",
            cancellationToken,
            reminderSent: "false",
          },
        },
      },
    });

    const eventId = response.data.id;
    if (!eventId) {
      return json(500, { error: "Calendar event was not created" });
    }

    const cancelUrl = getCancelUrl(getBaseUrl(event.rawUrl), eventId, cancellationToken);
    try {
      await sendBookingConfirmation(booking, cancelUrl);
    } catch (emailError) {
      await calendar.events.delete({ calendarId, eventId }).catch(() => undefined);
      throw emailError;
    }

    return json(200, { ok: true, eventId });
  } catch (error) {
    const message = bookingErrorMessage(error);
    const status = message.includes("required") || message.includes("not available") ? 400 : 500;
    return json(status, { error: message });
  }
};
export const handler: Handler = withClient(originalHandler, "calendar");
