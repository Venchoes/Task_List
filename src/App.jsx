import { useState, useEffect } from "react";
import Tasks from "./components/Tasks";
import AddTask from "./components/AddTask";
import { v4 } from 'uuid';
import { useAuth } from './contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { get, post } from "./services/api.js";

function App()
{
  // carregar do backend (API) para manter tarefas do usuário sincronizadas
  const _blacklistInitialTitles = [
    "estudar react",
    "ler um livro",
    "ir para a academia",
    "ir pra academia",
  ];

  // tasks carregadas a partir da API
  const [tasks, setTasks] = useState([]);

  // normalize helper
  function normalizeTaskFromServer(t) {
    return {
      id: t?.id ?? t?._id ?? v4(),
      title: (t?.title || "").toString(),
      description: (t?.description || "").toString(),
      status: t?.status ?? (t?.isCompleted ? 'done' : 'pending'),
      priority: t?.priority ?? 'normal',
      dueDate: t?.dueDate ?? null,
      user: t?.user ?? null,
    };
  }

  // carregar tarefas do backend ao montar
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await get('/tasks');
        if (!mounted) return;
        if (Array.isArray(data)) {
          const normalized = data.map(normalizeTaskFromServer).filter((task) => {
            const title = (task.title || "").toString().trim().toLowerCase();
            return !_blacklistInitialTitles.includes(title);
          });
          setTasks(normalized);
        } else {
          setTasks([]);
        }
      } catch (e) {
        console.error('Failed to load tasks from API', e);
      }
    }
    load();
    return () => { mounted = false };
  }, []);

  // persistir tarefas no localStorage (opcional fallback)
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

  //função para adicionar uma nova tarefa (envia para o backend)
  async function onAddTask(title, description)
  {
    try {
      const created = await post('/tasks', { title, description });
      // assume que o backend retorna a task criada
      const normalized = normalizeTaskFromServer(created);
      setTasks(prev => [...prev, normalized]);
    } catch (e) {
      console.error('Failed to create task', e);
      // fallback local
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