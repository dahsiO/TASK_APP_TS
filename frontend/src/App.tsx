import { useState, useEffect } from "react";
import { login, register, getTasks, addTask, deleteTask, type Task } from "./api";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [text, setText] = useState("");

  const handleLogin = async () => {
    const res = await login(email, password);
    setToken(res.data.token);
  };

  const handleRegister = async () => {
    await register(email, password);
    alert("Compte créé, connecte-toi !");
  };

  useEffect(() => {
    if (token) {
      getTasks(token).then((res) => setTasks(res.data));
    }
  }, [token]);

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

  if (!token) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Connexion / Inscription</h2>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Se connecter</button>
        <button onClick={handleRegister}>Créer un compte</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📋 Mes tâches</h1>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Nouvelle tâche..."
      />
      <button onClick={handleAddTask}>Ajouter</button>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.text}{" "}
            <button onClick={() => handleDeleteTask(task.id)}>❌ Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
