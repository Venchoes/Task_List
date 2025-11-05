import { useState, useEffect } from "react";
import Tasks from "./components/Tasks";
import AddTask from "./components/AddTask";
import { v4 } from 'uuid';
import { useAuth } from './contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

function App()
{
  // tarefas iniciais padrão
  const initialTasks = [
    {
      id: v4(),
      title: 'Estudar React',
      description: 'Ler a documentação oficial do React e fazer alguns tutoriais.',
      isCompleted: false,
    },
    {
      id: v4(),
      title: 'Ler um livro',
      description: 'Ler um livro de ficção científica.',
      isCompleted: false,
    },
    {
      id: v4(),
      title: 'Ir para a academia',
      description: 'Fazer exercícios de musculação e cardio.',
      isCompleted: false,
    }
  ];

  // carregar do localStorage, se houver, para manter tarefas do usuário entre rotas
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem('tasks');
      return raw ? JSON.parse(raw) : initialTasks;
    } catch {
      return initialTasks;
    }
  });

  // persistir tarefas no localStorage
  useEffect(() => {
    try { localStorage.setItem('tasks', JSON.stringify(tasks)); } catch (e) { /* ignore */ }
  }, [tasks]);

  //função para marcar uma tarefa como completa ou incompleta
  function onTaskClick(taskId) 
  {
    setTasks(prev => prev.map(task => task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task));
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
      isCompleted: false,
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