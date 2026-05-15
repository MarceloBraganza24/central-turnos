export function isValidEmail(email: string) {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export function isValidArgentinaWhatsapp(phone: string) {
  const normalized = normalizePhone(phone);
  return normalized.startsWith("549") && normalized.length >= 12;
}

export function isPastDate(date: string) {
  const today = new Date().toISOString().split("T")[0];
  return date < today;
}

export function timesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
) {
  return startA < endB && startB < endA;
}