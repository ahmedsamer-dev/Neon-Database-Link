import { Router, type IRouter } from "express";
import { requireAdmin } from "../../lib/admin";
import {
  getAllSettings,
  getPublicSettings,
  updateSettings,
} from "./settings.service";

const router: IRouter = Router();

// Public endpoint — used by the order confirmation and checkout pages
router.get("/settings", async (_req, res) => {
  const settings = await getPublicSettings();
  res.json(settings);
});

// Admin: read full settings (raw key/value pairs)
router.get("/admin/settings", requireAdmin, async (_req, res) => {
  const settings = await getAllSettings();
  res.json(settings);
});

// Admin: update settings
router.put("/admin/settings", requireAdmin, async (req, res) => {
  const updated = await updateSettings(req.body ?? {});
  res.json(updated);
});

export default router;
