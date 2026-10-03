import { appointmentCalendarConfig, getBusinessDay, type AppointmentCalendarConfig, type AppointmentService } from "./config";

export type AvailabilitySlot = {
  time: string;
  available: boolean;
};

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number) {
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;
}

export function addMinutes(time: string, minutesToAdd: number) {
  return minutesToTime(timeToMinutes(time) + minutesToAdd);
}

export function dateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function dateFromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function isValidServiceDuration(service: AppointmentService, config = appointmentCalendarConfig) {
  return (
    service.durationMinutes >= config.minDurationMinutes &&
    service.durationMinutes <= config.maxDurationMinutes &&
    service.durationMinutes % config.durationIncrementMinutes === 0
  );
}

export function isWithinBookingWindow(date: Date, config = appointmentCalendarConfig) {
  const today = startOfToday();
  const maxDate = addMonths(today, config.maxBookingWindowMonths);
  maxDate.setHours(23, 59, 59, 999);
  return date > today && date <= maxDate;
}

export function isBookableBusinessDate(date: Date, config = appointmentCalendarConfig) {
  return isWithinBookingWindow(date, config) && Boolean(getBusinessDay(date.getDay(), config));
}

export function createMonthDays(monthAnchor: Date): Array<Date | null> {
  const today = startOfToday();
  const isCurrentMonth = monthAnchor.getFullYear() === today.getFullYear() && monthAnchor.getMonth() === today.getMonth();
  const firstOfMonth = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
  const firstVisibleDay = isCurrentMonth ? new Date(today) : firstOfMonth;

  if (isCurrentMonth) {
    const day = firstVisibleDay.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    firstVisibleDay.setDate(firstVisibleDay.getDate() + diffToMonday);
  }

  const leadingSpacers = firstVisibleDay.getDay() === 0 ? 6 : firstVisibleDay.getDay() - 1;
  const start = isCurrentMonth ? firstVisibleDay : firstOfMonth;
  const last = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0);
  const days: Array<Date | null> = Array.from({ length: isCurrentMonth ? 0 : leadingSpacers }, () => null);

  for (let cursor = new Date(start); cursor <= last; cursor.setDate(cursor.getDate() + 1)) {
    days.push(cursor.getMonth() === monthAnchor.getMonth() ? new Date(cursor) : null);
  }

  return days;
}

export function createSlotsForService(
  date: Date,
  service: AppointmentService,
  config: AppointmentCalendarConfig = appointmentCalendarConfig,
): AvailabilitySlot[] {
  const businessDay = getBusinessDay(date.getDay(), config);
  if (!businessDay || !isValidServiceDuration(service, config)) return [];

  return businessDay.intervals.flatMap((interval) => {
    const start = timeToMinutes(interval.start);
    const end = timeToMinutes(interval.end);
    const latestStart = end - service.durationMinutes;
    const slots: AvailabilitySlot[] = [];

    for (let cursor = start; cursor <= latestStart; cursor += service.durationMinutes) {
      slots.push({ time: minutesToTime(cursor), available: true });
    }

    if (latestStart >= start && !slots.some((slot) => slot.time === minutesToTime(latestStart))) {
      slots.push({ time: minutesToTime(latestStart), available: true });
    }

    return slots;
  });
}

export function formatBusinessHours(config: AppointmentCalendarConfig = appointmentCalendarConfig) {
  return config.businessDays
    .map((day) => `${day.label.nl} ${day.intervals.map((interval) => `${interval.start}-${interval.end}`).join(", ")}`)
    .join("; ");
}
