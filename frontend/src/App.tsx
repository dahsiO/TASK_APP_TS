import { useState, useEffect } from "react";
import {
  register,
  login,
  getTasks,
  addTask,
  deleteTask,
  type Task,
} from "./api";

export default function App() {
  const [page, setPage] = useState<"login" | "register" | "tasks">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
  const [dueDate, setDueDate] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (token) {
      getTasks(token).then((res) => setTasks(res.data));
      setPage("tasks");
    }
  }, [token]);

  const handleRegister = async () => {
    try {
      await register(email, password);
      alert("🎉 Compte créé ! Connecte-toi maintenant 😎");
      setPage("login");
    } catch {
      alert("⚠️ Erreur : cet email existe déjà !");
    }
  };

  const handleLogin = async () => {
    try {
      const res = await login(email, password);
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setPage("tasks");
    } catch {
      alert("❌ Email ou mot de passe incorrect !");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setPage("login");
  };

  const handleAddTask = async () => {
    if (!text.trim() || !token) return;
    const res = await addTask(
      { text, priority, dueDate, comment },
      token
    );
    setTasks([...tasks, res.data]);
    setText("");
    setPriority("low");
    setDueDate("");
    setComment("");
  };

  const handleDeleteTask = async (id: number) => {
    if (!token) return;
    await deleteTask(id, token);
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // =============== LOGIN PAGE ===============
  if (page === "login") {
    return (
      <div className="min-h-screen bg-login bg-cover bg-center flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
            🔑 Connexion
          </h1>
          <input
            className="mb-3 px-4 py-3 rounded-xl w-full border"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="mb-3 px-4 py-3 rounded-xl w-full border"
            placeholder="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="bg-green-500 hover:bg-green-600 w-full py-3 rounded-xl text-white font-bold mb-3"
            onClick={handleLogin}
          >
            🚀 Se connecter
          </button>
          <button
            className="underline w-full text-center text-gray-700"
            onClick={() => setPage("register")}
          >
            🆕 Pas encore de compte ?
          </button>
        </div>
      </div>
    );
  }

  // =============== REGISTER PAGE ===============
  if (page === "register") {
    return (
      <div className="min-h-screen bg-login bg-cover bg-center flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
            📝 Inscription
          </h1>
          <input
            className="mb-3 px-4 py-3 rounded-xl w-full border"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="mb-3 px-4 py-3 rounded-xl w-full border"
            placeholder="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 w-full py-3 rounded-xl text-white font-bold mb-3"
            onClick={handleRegister}
          >
            🎉 Créer mon compte
          </button>
          <button
            className="underline w-full text-center text-gray-700"
            onClick={() => setPage("login")}
          >
            🔙 J’ai déjà un compte
          </button>
        </div>
      </div>
    );
  }

  // =============== TASKS PAGE ===============
  return (
    <div className="min-h-screen bg-tasks bg-cover bg-center p-6">
      <div className="flex justify-between items-center mb-6 bg-white/70 backdrop-blur-md p-4 rounded-xl shadow">
        <h1 className="text-3xl font-extrabold text-gray-800">📋 Mes Tâches</h1>
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow"
          onClick={handleLogout}
        >
          🚪 Déconnexion
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl shadow mb-6">
        <div className="flex space-x-2 mb-3">
          <input
            className="flex-1 px-4 py-2 rounded-xl border"
            placeholder="➕ Nouvelle tâche..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold shadow"
            onClick={handleAddTask}
          >
            ➕
          </button>
        </div>

        <div className="flex space-x-2 mb-3">
          <select
            className="px-3 py-2 rounded-xl border"
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as "low" | "medium" | "high")
            }
          >
            <option value="low">🟢 Peu urgent</option>
            <option value="medium">🟠 Urgent</option>
            <option value="high">🔴 Très urgent</option>
          </select>
          <input
            type="datetime-local"
            className="px-3 py-2 rounded-xl border"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <textarea
          className="w-full px-3 py-2 rounded-xl border"
          placeholder="💬 Ajouter un commentaire..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <ul className="space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`flex flex-col bg-white/90 px-4 py-3 rounded-xl shadow border-l-8 ${
              task.priority === "high"
                ? "border-red-500"
                : task.priority === "medium"
                ? "border-orange-400"
                : "border-green-400"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">{task.text}</span>
              <button
                className="text-red-500 hover:text-red-700 text-2xl"
                onClick={() => handleDeleteTask(task.id)}
              >
                ❌
              </button>
            </div>
            {task.dueDate && (
              <p className="text-sm text-gray-600 mt-1">
                📅 {new Date(task.dueDate).toLocaleString()}
              </p>
            )}
            {task.comment && (
              <p className="text-sm text-gray-700 italic mt-1">
                💬 {task.comment}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
