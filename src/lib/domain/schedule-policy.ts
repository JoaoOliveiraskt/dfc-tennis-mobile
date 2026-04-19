type ClassTemporalState = "FUTURE" | "IN_PROGRESS" | "PAST";

function parseClassDateTime(dateISO: string, time: string): Date {
  const [year, month, day] = dateISO.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  return new Date(year, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0, 0);
}

function getClassTemporalState(
  dateISO: string,
  startTime: string,
  endTime: string,
  now = new Date(),
): ClassTemporalState {
  const startDateTime = parseClassDateTime(dateISO, startTime);
  const endDateTime = parseClassDateTime(dateISO, endTime);

  if (now.getTime() < startDateTime.getTime()) {
    return "FUTURE";
  }

  if (now.getTime() >= endDateTime.getTime()) {
    return "PAST";
  }

  return "IN_PROGRESS";
}

function isStudentBookingAllowed(
  dateISO: string,
  startTime: string,
  endTime: string,
  now = new Date(),
): boolean {
  return getClassTemporalState(dateISO, startTime, endTime, now) === "FUTURE";
}

export { getClassTemporalState, isStudentBookingAllowed, parseClassDateTime };
export type { ClassTemporalState };
