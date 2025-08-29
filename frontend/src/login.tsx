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
      <div className="min-h-screen bg-[url('/montagne.jpg')] bg-cover bg-center flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h1 className="text-5xl font-extrabold mb-6 text-center text-gray-800">
            🔑 Connexion
          </h1>
          <input
            className="mb-3 px-4 py-3 rounded-xl text-black w-full"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="mb-3 px-4 py-3 rounded-xl text-black w-full"
            placeholder="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="bg-green-500 hover:bg-green-600 w-full py-3 rounded-xl text-xl font-bold shadow-lg mb-3 text-white"
            onClick={handleLogin}
          >
            🚀 Se connecter
          </button>
          <button
            className="underline text-lg w-full text-center"
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
      <div className="min-h-screen bg-[url('/montagne.jpg')] bg-cover bg-center flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h1 className="text-5xl font-extrabold mb-6 text-center text-gray-800">
            📝 Inscription
          </h1>
          <input
            className="mb-3 px-4 py-3 rounded-xl text-black w-full"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="mb-3 px-4 py-3 rounded-xl text-black w-full"
            placeholder="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 w-full py-3 rounded-xl text-xl font-bold shadow-lg mb-3 text-white"
            onClick={handleRegister}
          >
            🎉 Créer mon compte
          </button>
          <button
            className="underline text-lg w-full text-center"
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
    <div className="min-h-screen bg-[url('/montagnevert.jpg')] bg-cover bg-center p-6">
      <div className="flex justify-between items-center mb-6 bg-white/70 backdrop-blur-md p-4 rounded-xl shadow-lg">
        <h1 className="text-4xl font-extrabold text-gray-800">📋 Mes Tâches</h1>
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow"
          onClick={handleLogout}
        >
          🚪 Déconnexion
        </button>
      </div>

      {/* Formulaire ajout */}
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-xl shadow-lg mb-6">
        <input
          className="w-full mb-3 px-4 py-3 rounded-xl text-black shadow"
          placeholder="➕ Nouvelle tâche..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex gap-3 mb-3">
          <select
            className="px-3 py-2 rounded-xl text-black"
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as "low" | "medium" | "high")
            }
          >
            <option value="low">🟢 Pas urgent</option>
            <option value="medium">🟠 Urgent</option>
            <option value="high">🔴 Urgence max</option>
          </select>

          <input
            type="date"
            className="px-3 py-2 rounded-xl text-black"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <textarea
          className="w-full px-3 py-2 rounded-xl text-black mb-3"
          placeholder="💬 Ajouter un commentaire..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button
          className="bg-indigo-600 hover:bg-indigo-700 w-full py-3 rounded-xl text-xl font-bold shadow text-white"
          onClick={handleAddTask}
        >
          ➕ Ajouter la tâche
        </button>
      </div>

      {/* Liste des tâches */}
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`p-4 rounded-xl shadow-lg ${
              task.priority === "high"
                ? "bg-red-200 border-l-4 border-red-600"
                : task.priority === "medium"
                ? "bg-orange-200 border-l-4 border-orange-600"
                : "bg-green-200 border-l-4 border-green-600"
            }`}
          >
            <h3 className="text-lg font-semibold">{task.text}</h3>
            {task.comment && (
              <p className="text-sm text-gray-700 italic">{task.comment}</p>
            )}
            {task.dueDate && (
              <p className="text-xs text-gray-500">📅 {task.dueDate}</p>
            )}
            <button
              className="text-red-600 hover:text-red-800 float-right"
              onClick={() => handleDeleteTask(task.id)}
            >
              ❌ Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
