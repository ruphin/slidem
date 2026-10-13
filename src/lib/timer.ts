/** Formats elapsed milliseconds as `mm:ss`, or `h:mm:ss` once an hour has passed. */
export function formatElapsed(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${hours ? `${pad(hours)}:` : ""}${pad(minutes)}:${pad(seconds)}`;
}
