import { findAllSettings, upsertSettingRow } from "./settings.repository";

/**
 * Default values returned for any setting not yet stored in the database.
 * These keep the storefront usable on a fresh install before an admin has
 * touched the settings screen.
 */
const DEFAULTS: Record<string, string> = {
  payment_phone: "01000000000",
  whatsapp_phone: "201000000000",
  store_name: "PEACE.",
  shipping_cost: "0",
};

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await findAllSettings();
  const result: Record<string, string> = { ...DEFAULTS };
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}

export type PublicSettings = {
  paymentPhone: string;
  whatsappPhone: string;
  storeName: string;
  shippingCost: number;
};

export async function getPublicSettings(): Promise<PublicSettings> {
  const settings = await getAllSettings();
  return {
    paymentPhone: settings.payment_phone,
    whatsappPhone: settings.whatsapp_phone,
    storeName: settings.store_name,
    shippingCost: Number(settings.shipping_cost ?? 0),
  };
}

export type SettingsUpdateInput = {
  payment_phone?: unknown;
  whatsapp_phone?: unknown;
  store_name?: unknown;
  shipping_cost?: unknown;
};

/**
 * Applies a partial settings update. Each field is optional; only provided
 * fields are written. shipping_cost is silently ignored if it isn't a
 * non-negative finite number, to avoid corrupting the storefront total.
 */
export async function updateSettings(
  input: SettingsUpdateInput,
): Promise<Record<string, string>> {
  if (input.payment_phone !== undefined) {
    await upsertSettingRow("payment_phone", String(input.payment_phone));
  }
  if (input.whatsapp_phone !== undefined) {
    await upsertSettingRow("whatsapp_phone", String(input.whatsapp_phone));
  }
  if (input.store_name !== undefined) {
    await upsertSettingRow("store_name", String(input.store_name));
  }
  if (input.shipping_cost !== undefined) {
    const val = Number(input.shipping_cost);
    if (!Number.isNaN(val) && val >= 0) {
      await upsertSettingRow("shipping_cost", val.toFixed(2));
    }
  }

  return getAllSettings();
}
