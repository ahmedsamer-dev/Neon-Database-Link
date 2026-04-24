import { pool } from "@workspace/db";
import { logger } from "./lib/logger.js";

const CANCELLED_ORDER_TTL_HOURS = 24;

export async function cleanupCancelledOrders(): Promise<void> {
  try {
    const result = await pool.query(
      `DELETE FROM orders
       WHERE order_status = 'Cancelled'
         AND created_at < NOW() - INTERVAL '${CANCELLED_ORDER_TTL_HOURS} hours'
       RETURNING id`
    );
    if (result.rowCount && result.rowCount > 0) {
      logger.info(
        { count: result.rowCount },
        `Cleanup: deleted ${result.rowCount} cancelled order(s) older than ${CANCELLED_ORDER_TTL_HOURS}h`
      );
    }
  } catch (err) {
    logger.error({ err }, "Cleanup: failed to delete cancelled orders");
  }
}

export function startCleanupJob(): void {
  const INTERVAL_MS = 60 * 60 * 1000;

  cleanupCancelledOrders();

  setInterval(cleanupCancelledOrders, INTERVAL_MS);

  logger.info(
    { intervalHours: 1, ttlHours: CANCELLED_ORDER_TTL_HOURS },
    "Cleanup job started: cancelled orders older than 24h will be auto-deleted"
  );
}
