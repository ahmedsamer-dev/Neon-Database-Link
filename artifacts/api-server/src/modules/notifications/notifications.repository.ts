import { db, notificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

export type NotificationRow = typeof notificationsTable.$inferSelect;

export async function findAllNotifications(): Promise<NotificationRow[]> {
  return db
    .select()
    .from(notificationsTable)
    .orderBy(desc(notificationsTable.createdAt));
}

export async function markNotificationRead(id: number): Promise<void> {
  await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.id, id));
}
