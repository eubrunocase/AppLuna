export function toLocalDateTimeString(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function nowLocalDateTimeString(): string {
  return toLocalDateTimeString(new Date());
}
