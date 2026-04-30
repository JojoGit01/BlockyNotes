export const nowIso = () => new Date().toISOString();

const dayMs = 24 * 60 * 60 * 1000;

export const toDateKey = (value: Date | string = new Date()) => {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const fromDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const addDays = (date: Date, amount: number) => new Date(date.getTime() + amount * dayMs);

export const startOfWeek = (date: Date) => {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return addDays(new Date(date.getFullYear(), date.getMonth(), date.getDate()), mondayOffset);
};

export const getWeekDays = (dateKey: string) => {
  const monday = startOfWeek(fromDateKey(dateKey));
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
};
