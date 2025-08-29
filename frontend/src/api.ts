import axios from "axios";

const API = "https://task-app-ts.onrender.com";

// ✅ type des tâches (côté front)
export type Task = {
  id: number;
  text: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string | null;
  comment?: string | null;
};

// ✅ Auth
export const register = (email: string, password: string) =>
  axios.post(`${API}/auth/register`, { email, password });

export const login = (email: string, password: string) =>
  axios.post(`${API}/auth/login`, { email, password });

// ✅ Tâches
export const getTasks = (token: string) =>
  axios.get<Task[]>(`${API}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addTask = (
  task: { text: string; priority?: string; dueDate?: string; comment?: string },
  token: string
) =>
  axios.post<Task>(`${API}/tasks`, task, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteTask = (id: number, token: string) =>
  axios.delete(`${API}/tasks/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
