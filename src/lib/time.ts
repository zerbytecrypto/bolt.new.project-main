import type { Conversation } from '@/types/chat';

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function formatActivityLabel(
  conversation: Pick<Conversation, 'activity_status' | 'last_active_at'>
): string {
  if (conversation.activity_status === 'active') return 'Active now';
  if (conversation.activity_status === 'offline') return 'Offline';
  const elapsed = Math.max(0, Date.now() - new Date(conversation.last_active_at).getTime());
  if (elapsed < HOUR_MS) return `Active ${Math.max(1, Math.floor(elapsed / MINUTE_MS))}m ago`;
  if (elapsed < DAY_MS) return `Active ${Math.floor(elapsed / HOUR_MS)}h ago`;
  return `Active ${Math.floor(elapsed / DAY_MS)}d ago`;
}

export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (date.toDateString() === new Date().toDateString()) return time;
  const day = date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  return `${day}, ${time}`;
}

export function minutesSince(iso: string): number {
  return Math.round((Date.now() - new Date(iso).getTime()) / MINUTE_MS);
}
