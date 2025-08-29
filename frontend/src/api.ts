import axios from "axios";

const API = "http://localhost:4000";

// ✅ type des tâches
export type Task = {
  id: number;
  text: string;
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

export const addTask = (text: string, token: string) =>
  axios.post<Task>(`${API}/tasks`, { text }, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteTask = (id: number, token: string) =>
  axios.delete(`${API}/tasks/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
