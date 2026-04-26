import { Router, type IRouter } from "express";
import { requireAdmin } from "../../lib/admin";
import { formatNotification } from "../../lib/format";
import { listNotifications, markRead } from "./notifications.service";

const router: IRouter = Router();

router.get("/admin/notifications", requireAdmin, async (_req, res) => {
  const items = await listNotifications();
  res.json(items.map(formatNotification));
});

router.post("/admin/notifications/:id/read", requireAdmin, async (req, res) => {
  const result = await markRead(String(req.params.id));
  if (result.kind === "invalid_id") {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ ok: true });
});

export default router;
