import { Router, type IRouter } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../lib/admin";
import { formatNotification } from "../lib/format";

const router: IRouter = Router();

router.get("/admin/notifications", requireAdmin, async (_req, res) => {
  const items = await db
    .select()
    .from(notificationsTable)
    .orderBy(desc(notificationsTable.createdAt));
  res.json(items.map(formatNotification));
});

router.post("/admin/notifications/:id/read", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.id, id));
  res.json({ ok: true });
});

export default router;
