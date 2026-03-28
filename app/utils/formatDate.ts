/**
 * Converts YYYY-MM-DD to DD.MM.YYYY
 */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}
