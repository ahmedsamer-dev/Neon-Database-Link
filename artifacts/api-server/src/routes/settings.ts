import { Router, type IRouter } from "express";
import { db, storeSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../lib/admin";

const router: IRouter = Router();

const DEFAULTS: Record<string, string> = {
  payment_phone: "01000000000",
  whatsapp_phone: "201000000000",
  store_name: "PEACE.",
};

async function getSetting(key: string): Promise<string> {
  const [row] = await db
    .select()
    .from(storeSettingsTable)
    .where(eq(storeSettingsTable.key, key));
  return row?.value ?? DEFAULTS[key] ?? "";
}

async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await db.select().from(storeSettingsTable);
  const result = { ...DEFAULTS };
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}

async function upsertSetting(key: string, value: string): Promise<void> {
  await db
    .insert(storeSettingsTable)
    .values({ key, value })
    .onConflictDoUpdate({
      target: storeSettingsTable.key,
      set: { value, updatedAt: new Date() },
    });
}

// Public endpoint - order confirmation uses this
router.get("/settings", async (_req, res) => {
  const settings = await getAllSettings();
  res.json({
    paymentPhone: settings.payment_phone,
    whatsappPhone: settings.whatsapp_phone,
    storeName: settings.store_name,
  });
});

// Admin get settings
router.get("/admin/settings", requireAdmin, async (_req, res) => {
  const settings = await getAllSettings();
  res.json(settings);
});

// Admin update settings
router.put("/admin/settings", requireAdmin, async (req, res) => {
  const { payment_phone, whatsapp_phone, store_name } = req.body;

  if (payment_phone !== undefined) await upsertSetting("payment_phone", String(payment_phone));
  if (whatsapp_phone !== undefined) await upsertSetting("whatsapp_phone", String(whatsapp_phone));
  if (store_name !== undefined) await upsertSetting("store_name", String(store_name));

  const updated = await getAllSettings();
  res.json(updated);
});

export default router;
