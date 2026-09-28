/** Best-effort push notification via ntfy.sh (free, no account needed).
 * Silently does nothing if NTFY_TOPIC isn't set, or if the request fails. */
export async function notify(title: string, message: string): Promise<void> {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return;
  try {
    await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
      method: 'POST',
      headers: { Title: title },
      body: message,
    });
  } catch {
    /* notifications are best-effort */
  }
}
