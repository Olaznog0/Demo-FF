import { schedule, type Handler } from "@netlify/functions";
import { createCalendarClient, getBaseUrl, getCancelUrl, getGoogleCalendarConfig, sendBookingReminder } from "./_shared/booking";
import { appointmentCalendarConfig } from "../../src/modules/appointmentCalendar/config";

const reminderHandler: Handler = async () => {
  const { calendarId } = getGoogleCalendarConfig();
  const calendar = createCalendarClient();
  const now = new Date();
  const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const response = await calendar.events.list({
    calendarId,
    timeMin: windowStart.toISOString(),
    timeMax: windowEnd.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    privateExtendedProperty: ["module=appointment-calendar", "reminderSent=false"],
  });

  const events = response.data.items || [];
  await Promise.all(
    events.map(async (eventItem) => {
      const privateProps = eventItem.extendedProperties?.private || {};
      const customerEmail = privateProps.customerEmail;
      const cancellationToken = privateProps.cancellationToken;
      const startsAt = eventItem.start?.dateTime || eventItem.start?.date || "";

      if (!eventItem.id || !customerEmail || !cancellationToken || !startsAt) return;

      const cancelUrl = getCancelUrl(getBaseUrl(), eventItem.id, cancellationToken);
      await sendBookingReminder(customerEmail, eventItem.summary || "uw afspraak", startsAt, cancelUrl);
      await calendar.events.patch({
        calendarId,
        eventId: eventItem.id,
        requestBody: {
          extendedProperties: {
            private: {
              ...privateProps,
              reminderSent: "true",
            },
          },
        },
      });
    }),
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, reminded: events.length, timeZone: appointmentCalendarConfig.timeZone }),
  };
};

export const handler = schedule("@hourly", reminderHandler);
