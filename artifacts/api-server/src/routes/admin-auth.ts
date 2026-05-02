import { Router } from "express";
import { db } from "@workspace/db";
import { adminUsersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

const JWT_SECRET = process.env.SESSION_SECRET || "anssam-admin-secret-2026";

function hashPassword(password: string): string {
  return crypto.createHmac("sha256", JWT_SECRET).update(password).digest("hex");
}

function createToken(userId: number, username: string): string {
  const payload = { userId, username, iat: Date.now(), exp: Date.now() + 7 * 24 * 60 * 60 * 1000 };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", JWT_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyToken(token: string): { userId: number; username: string } | null {
  try {
    const [data, sig] = token.split(".");
    const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(data).digest("base64url");
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    return { userId: payload.userId, username: payload.username };
  } catch {
    return null;
  }
}

// POST /api/admin/auth/login
router.post("/admin/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required" });

    const [user] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.username, username));

    // If no admin user exists, create the first one
    if (!user) {
      const hash = hashPassword(password);
      const [newUser] = await db.insert(adminUsersTable).values({
        username,
        passwordHash: hash,
        role: "superadmin",
      }).returning();
      const token = createToken(newUser.id, newUser.username);
      return res.json({ token, user: { id: newUser.id, username: newUser.username, role: newUser.role } });
    }

    if (user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    await db.update(adminUsersTable).set({ lastLogin: new Date() }).where(eq(adminUsersTable.id, user.id));
    const token = createToken(user.id, user.username);
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    req.log.error(err, "Login error");
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/admin/auth/me
router.get("/admin/auth/me", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  const payload = verifyToken(auth.slice(7));
  if (!payload) return res.status(401).json({ error: "Invalid token" });
  res.json({ user: payload });
});

export default router;
