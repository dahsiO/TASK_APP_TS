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
    const res = await addTask(text, token);
    setTasks([...tasks, res.data]);
    setText("");
  };

  const handleDeleteTask = async (id: number) => {
    if (!token) return;
    await deleteTask(id, token);
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // =============== LOGIN PAGE ===============
  if (page === "login") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-400 to-purple-500 text-white">
        <h1 className="text-5xl font-extrabold mb-6">🔑 Connexion</h1>
        <input
          className="mb-3 px-4 py-3 rounded-xl text-black w-72"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="mb-3 px-4 py-3 rounded-xl text-black w-72"
          placeholder="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl text-xl font-bold shadow-lg mb-3"
          onClick={handleLogin}
        >
          🚀 Se connecter
        </button>
        <button
          className="underline text-lg"
          onClick={() => setPage("register")}
        >
          🆕 Pas encore de compte ?
        </button>
      </div>
    );
  }

  // =============== REGISTER PAGE ===============
  if (page === "register") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-yellow-400 to-pink-500 text-white">
        <h1 className="text-5xl font-extrabold mb-6">📝 Inscription</h1>
        <input
          className="mb-3 px-4 py-3 rounded-xl text-black w-72"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="mb-3 px-4 py-3 rounded-xl text-black w-72"
          placeholder="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl text-xl font-bold shadow-lg mb-3"
          onClick={handleRegister}
        >
          🎉 Créer mon compte
        </button>
        <button
          className="underline text-lg"
          onClick={() => setPage("login")}
        >
          🔙 J’ai déjà un compte
        </button>
      </div>
    );
  }

  // =============== TASKS PAGE ===============
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-300 to-blue-400 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-white">📋 Mes Tâches</h1>
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow"
          onClick={handleLogout}
        >
          🚪 Déconnexion
        </button>
      </div>

      <div className="flex space-x-2 mb-6">
        <input
          className="flex-1 px-4 py-3 rounded-xl text-black shadow"
          placeholder="➕ Nouvelle tâche..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-xl font-bold shadow"
          onClick={handleAddTask}
        >
          ➕ Ajouter
        </button>
      </div>

      <ul className="space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex justify-between items-center bg-white px-4 py-3 rounded-xl shadow-lg"
          >
            <span className="text-lg">{task.text}</span>
            <button
              className="text-red-500 hover:text-red-700 text-2xl"
              onClick={() => handleDeleteTask(task.id)}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
