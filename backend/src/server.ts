// backend/src/server.ts
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Pool } from "pg";

const app = express();
app.use(cors());
app.use(express.json());

// ====================
// 📦 Config Database
// ====================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://taskdata_user:UyIdo2aCzbn4YlsQrMrH8AXzgOorgbkH@dpg-d2ov4njipnbc73a9g2e0-a.frankfurt-postgres.render.com/taskdata",
  ssl: {
    rejectUnauthorized: false, // Render nécessite SSL
  },
});

// ====================
// 🔑 JWT Secret
// ====================
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// ====================
// 🛠 Init DB Tables
// ====================
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      text TEXT,
      priority TEXT,
      dueDate TEXT,
      comment TEXT,
      userId INTEGER REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}
initDB();

// ====================
// 🔐 Middleware Auth
// ====================
function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
}

// ====================
// 🚀 ROUTES
// ====================

// Register
app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (email, password) VALUES ($1, $2)", [
      email,
      hashed,
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Email déjà utilisé" });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  const user = result.rows[0];
  if (!user) return res.status(400).json({ error: "Utilisateur non trouvé" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Mot de passe incorrect" });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// Get tasks
app.get("/tasks", authMiddleware, async (req: any, res) => {
  const result = await pool.query("SELECT * FROM tasks WHERE userId=$1", [
    req.user.id,
  ]);
  res.json(result.rows);
});

// Add task
app.post("/tasks", authMiddleware, async (req: any, res) => {
  const { text, priority, dueDate, comment } = req.body;
  const result = await pool.query(
    "INSERT INTO tasks (text, priority, dueDate, comment, userId) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [text, priority, dueDate, comment, req.user.id]
  );
  res.json(result.rows[0]);
});

// Delete task
app.delete("/tasks/:id", authMiddleware, async (req: any, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM tasks WHERE id=$1 AND userId=$2", [
    id,
    req.user.id,
  ]);
  res.json({ success: true });
});

// ====================
// 🌍 Start Server
// ====================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
