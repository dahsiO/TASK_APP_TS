import express, { Request, Response } from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ============================
// CONFIG
// ============================
const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

app.use(cors());
app.use(express.json());

// ============================
// DATABASE
// ============================
let db: any;

(async () => {
  db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });

  // Table Users
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT
    )
  `);

  // Table Tasks
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      priority TEXT DEFAULT 'low',
      dueDate TEXT,
      comment TEXT,
      userId INTEGER,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `);
})();

// ============================
// MIDDLEWARE AUTH
// ============================
function auth(req: any, res: Response, next: any) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Token manquant" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: "Token invalide" });
  }
}

// ============================
// AUTH ROUTES
// ============================

// Register
app.post("/auth/register", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.run("INSERT INTO users (email, password) VALUES (?, ?)", [
      email,
      hashed,
    ]);
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: "Email déjà utilisé" });
  }
});

// Login
app.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);

  if (!user) return res.status(400).json({ error: "Utilisateur non trouvé" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Mot de passe incorrect" });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// ============================
// TASKS ROUTES
// ============================

// Get all tasks for user
app.get("/tasks", auth, async (req: any, res: Response) => {
  const tasks = await db.all("SELECT * FROM tasks WHERE userId = ?", [
    req.user.id,
  ]);
  res.json(tasks);
});

// Add task
app.post("/tasks", auth, async (req: any, res: Response) => {
  const { text, priority, dueDate, comment } = req.body;

  const result = await db.run(
    "INSERT INTO tasks (text, userId, priority, dueDate, comment) VALUES (?, ?, ?, ?, ?)",
    [text, req.user.id, priority || "low", dueDate || null, comment || null]
  );

  res.json({
    id: result.lastID,
    text,
    priority: priority || "low",
    dueDate: dueDate || null,
    comment: comment || null,
  });
});


// Delete task
app.delete("/tasks/:id", auth, async (req: any, res: Response) => {
  const { id } = req.params;
  await db.run("DELETE FROM tasks WHERE id = ? AND userId = ?", [
    id,
    req.user.id,
  ]);
  res.json({ success: true });
});

// ============================
// START SERVER
// ============================
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
