import type { LocalizedString } from "../../types/content";
import { calendarDefinition } from "../../../integration-context.js";

export type AppointmentService = {
  id: string;
  icon: string;
  durationMinutes: number;
  name: LocalizedString;
  tag: LocalizedString;
};

export type BusinessInterval = {
  start: string;
  end: string;
};

export type BusinessDay = {
  dayOfWeek: number;
  label: LocalizedString;
  intervals: BusinessInterval[];
};

export type AppointmentBusinessDetails = {
  name: string;
  email: string;
  phone: string;
  phoneHref: string;
  addressLines: string[];
  directionsUrl: string;
};

export type AppointmentCalendarConfig = {
  maxServices: number;
  minDurationMinutes: number;
  maxDurationMinutes: number;
  durationIncrementMinutes: number;
  maxBookingWindowMonths: number;
  timeZone: string;
  business: AppointmentBusinessDetails;
  services: AppointmentService[];
  businessDays: BusinessDay[];
};

const originalFFConfig: AppointmentCalendarConfig = {
  maxServices: 6,
  minDurationMinutes: 15,
  maxDurationMinutes: 120,
  durationIncrementMinutes: 15,
  maxBookingWindowMonths: 2,
  timeZone: "Europe/Amsterdam",
  business: {
    name: "F&F Car Service Electronics",
    email: "verascipii@gmail.com",
    phone: "070 300 07 30",
    phoneHref: "+31703000730",
    addressLines: ["Populierendreef 990A", "2272 HX Voorburg", "Netherlands"],
    directionsUrl: "https://www.google.com/maps?q=Populierendreef+990A+Voorburg",
  },
  services: [
    { id: "apk", icon: "✓", durationMinutes: 45, name: { nl: "APK check", en: "MOT check" }, tag: { nl: "Keuring", en: "Inspection" } },
    { id: "general", icon: "◎", durationMinutes: 60, name: { nl: "General check", en: "General check" }, tag: { nl: "Controle", en: "Check-up" } },
    { id: "tires", icon: "◔", durationMinutes: 45, name: { nl: "Bandenwissel", en: "Tyre change" }, tag: { nl: "Banden", en: "Tyres" } },
    { id: "oil", icon: "◉", durationMinutes: 30, name: { nl: "Olie verversen", en: "Oil change" }, tag: { nl: "Onderhoud", en: "Maintenance" } },
    { id: "brakes", icon: "□", durationMinutes: 45, name: { nl: "Remmen check", en: "Brake check" }, tag: { nl: "Veiligheid", en: "Safety" } },
    { id: "diagnostic", icon: "⌁", durationMinutes: 60, name: { nl: "Diagnose", en: "Diagnostics" }, tag: { nl: "Elektronica", en: "Electronics" } },
  ],
  businessDays: [
    { dayOfWeek: 1, label: { nl: "Maandag", en: "Monday" }, intervals: [{ start: "08:00", end: "17:30" }] },
    { dayOfWeek: 2, label: { nl: "Dinsdag", en: "Tuesday" }, intervals: [{ start: "08:00", end: "17:30" }] },
    { dayOfWeek: 3, label: { nl: "Woensdag", en: "Wednesday" }, intervals: [{ start: "08:00", end: "17:30" }] },
    { dayOfWeek: 4, label: { nl: "Donderdag", en: "Thursday" }, intervals: [{ start: "08:00", end: "17:30" }] },
    { dayOfWeek: 5, label: { nl: "Vrijdag", en: "Friday" }, intervals: [{ start: "08:00", end: "17:30" }] },
  ],
};

// The FF source remains intact; the presentation registry supplies another business only in its own request scope.
export const appointmentCalendarConfig: AppointmentCalendarConfig = new Proxy(originalFFConfig, {
  get(target, property) { return calendarDefinition(target)[property]; },
});

export function getAppointmentService(serviceId: string, config = appointmentCalendarConfig) {
  return config.services.find((service) => service.id === serviceId) || null;
}

export function getBusinessDay(dayOfWeek: number, config = appointmentCalendarConfig) {
  return config.businessDays.find((day) => day.dayOfWeek === dayOfWeek) || null;
}
