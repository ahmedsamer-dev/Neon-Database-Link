import type { Request, Response, NextFunction } from "express";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";
const ADMIN_TOKEN = "peace-admin-token-2026";

export function checkCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function getToken(): string {
  return ADMIN_TOKEN;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token =
    (req.query["token"] as string | undefined) ??
    (req.body && (req.body as { token?: string }).token);
  if (token !== ADMIN_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
