/** Format RSS/API timestamps as the actual publication time (never fake "Just now"). */

function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function parsePubDate(raw: string | undefined): Date | null {
  if (!raw?.trim()) return null;
  const d = new Date(raw.trim());
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Human-readable publish time, e.g. "3:45 PM", "Yesterday · 9:12 AM", "Mon, May 20 · 2:00 PM" */
export function formatPublishedAt(dateInput: string | Date | undefined | null): string {
  const date =
    dateInput instanceof Date
      ? dateInput
      : typeof dateInput === "string"
        ? parsePubDate(dateInput)
        : null;
  if (!date) return "";

  const now = new Date();
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (sameCalendarDay(date, now)) return timeStr;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (sameCalendarDay(date, yesterday)) return `Yesterday · ${timeStr}`;

  const withinYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(withinYear ? {} : { year: "numeric" }),
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function toIsoOrNull(date: Date | null): string | undefined {
  return date ? date.toISOString() : undefined;
}
