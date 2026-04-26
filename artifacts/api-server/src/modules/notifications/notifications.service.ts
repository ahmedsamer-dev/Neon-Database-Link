import {
  findAllNotifications,
  markNotificationRead,
  type NotificationRow,
} from "./notifications.repository";

export async function listNotifications(): Promise<NotificationRow[]> {
  return findAllNotifications();
}

export type MarkReadResult = { kind: "ok" } | { kind: "invalid_id" };

export async function markRead(rawId: string): Promise<MarkReadResult> {
  const id = Number(rawId);
  if (Number.isNaN(id)) {
    return { kind: "invalid_id" };
  }
  await markNotificationRead(id);
  return { kind: "ok" };
}
