import { db, storeSettingsTable } from "@workspace/db";

export type StoreSettingRow = typeof storeSettingsTable.$inferSelect;

export async function findAllSettings(): Promise<StoreSettingRow[]> {
  return db.select().from(storeSettingsTable);
}

export async function upsertSettingRow(
  key: string,
  value: string,
): Promise<void> {
  await db
    .insert(storeSettingsTable)
    .values({ key, value })
    .onConflictDoUpdate({
      target: storeSettingsTable.key,
      set: { value, updatedAt: new Date() },
    });
}
