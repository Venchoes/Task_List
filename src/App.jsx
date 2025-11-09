import { useState, useEffect } from "react";
import Tasks from "./components/Tasks";
import AddTask from "./components/AddTask";
import { v4 } from 'uuid';
import { useAuth } from './contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

function App()
{
  // carregar do localStorage, se houver, para manter tarefas do usuário entre rotas
  const _blacklistInitialTitles = [
    "estudar react",
    "ler um livro",
    "ir para a academia",
    "ir pra academia",
  ];

  // carregar do localStorage, migrando/normalizando formato antigo para o novo modelo
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem('tasks');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      function normalizeTask(t) {
        const title = (t?.title || "").toString();
        const description = (t?.description || "").toString();
        const status = t?.status ?? (t?.isCompleted ? "done" : "pending");
        return {
          id: t?.id ?? v4(),
          title,
          description,
          status,
          priority: t?.priority ?? "normal",
          dueDate: t?.dueDate ?? null,
          user: t?.user ?? null,
        };
      }

      // migrar e remover possíveis tasks de teste
      const normalized = parsed.map(normalizeTask).filter((task) => {
        const title = (task.title || "").toString().trim().toLowerCase();
        return !_blacklistInitialTitles.includes(title);
      });

      // Se algo foi removido/migrado, persistir a lista limpa
      if (normalized.length !== parsed.length) {
        try { localStorage.setItem('tasks', JSON.stringify(normalized)); } catch (e) { /* ignore */ }
      }

      return normalized;
    } catch {
      return [];
    }
  });

  // persistir tarefas no localStorage
  useEffect(() => {
    try { localStorage.setItem('tasks', JSON.stringify(tasks)); } catch (e) { /* ignore */ }
  }, [tasks]);

  //função para marcar uma tarefa como completa ou incompleta
  function onTaskClick(taskId) 
  {
    // alterna entre 'done' e 'pending'
    setTasks(prev => prev.map(task => task.id === taskId ? { ...task, status: task.status === 'done' ? 'pending' : 'done' } : task));
  }

  //função para apagar uma tarefa
  function onEraserClick(taskId)
  {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }

  //função para adicionar uma nova tarefa
  function onAddTask(title, description)
  {
    const newTask = {
      id: v4(),
      title: title,
      description: description,
      status: 'pending',
      priority: 'normal',
      dueDate: null,
      user: null,
    };
    setTasks(prev => [...prev, newTask]);
  }

  //retornando o componente Tasks e passando as tarefas como props
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="w-screen h-screen bg-blue-200 flex justify-center p-6">
      <div className="w-[500px] space-y-7">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl text-black font-bold text-center">Task List</h1>
          <button onClick={handleLogout} className="bg-red-400 text-white px-3 py-1 rounded">Logout</button>
        </div>
        <AddTask onAddTask={onAddTask} />
        <Tasks tasks={tasks} onTaskClick={onTaskClick} onEraserClick={onEraserClick} />
      </div>
    </div>
  );
}

export default App;