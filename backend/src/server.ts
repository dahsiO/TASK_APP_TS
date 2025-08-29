import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "supersecret"; // ⚠️ à mettre en variable d’env plus tard

// DB setup
let db: any;
(async () => {
  db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT
    );
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT,
      userId INTEGER
    );
  `);
})();

// Middleware auth
function authMiddleware(req: any, res: Response, next: NextFunction) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, SECRET) as { id: number };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Register
app.post("/auth/register", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    await db.run("INSERT INTO users (email, password) VALUES (?, ?)", [
      email,
      hashed,
    ]);
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: "User already exists" });
  }
});

// Login
app.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
  if (!user) return res.status(400).json({ error: "Invalid credentials" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// CRUD tâches (protégé)
app.get("/tasks", authMiddleware, async (req: any, res: Response) => {
  const tasks = await db.all("SELECT * FROM tasks WHERE userId = ?", [
    req.user.id,
  ]);
  res.json(tasks);
});

app.post("/tasks", authMiddleware, async (req: any, res: Response) => {
  const result = await db.run(
    "INSERT INTO tasks (text, userId) VALUES (?, ?)",
    [req.body.text, req.user.id]
  );
  res.json({ id: result.lastID, text: req.body.text });
});

app.delete("/tasks/:id", authMiddleware, async (req: any, res: Response) => {
  await db.run("DELETE FROM tasks WHERE id = ? AND userId = ?", [
    req.params.id,
    req.user.id,
  ]);
  res.json({ success: true });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
