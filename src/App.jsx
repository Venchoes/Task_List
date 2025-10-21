import { useState } from "react";
import Tasks from "./components/Tasks";
import AddTask from "./components/AddTask";
import { v4 } from 'uuid';

function App()
{
  //criando um estado para armazenar as tarefas
  const [tasks, setTasks] = useState([
    {
      id: v4(),
      title: 'Estudar React',
      description: 'Ler a documentação oficial do React e fazer alguns tutoriais.',
      completed: false,
    },
    {
      id: v4(),
      title: 'Ler um livro',
      description: 'Ler um livro de ficção científica.',
      completed: false,
    },
    {
      id: v4(),
      title: 'Ir para a academia',
      description: 'Fazer exercícios de musculação e cardio.',
      completed: false,
    }
  ])

  //função para marcar uma tarefa como completa ou incompleta
  function onTaskClick(taskId) 
  {
    const newTasks = tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, isCompleted: !task.isCompleted };
      }
      return task;
    });
    setTasks(newTasks);
  }

  //função para apagar uma tarefa
  function onEraserClick(taskId)
  {
    setTasks(tasks.filter(task => task.id !== taskId));
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
    setTasks([...tasks, newTask]);
  }

  //retornando o componente Tasks e passando as tarefas como props
  return (
    <div className="w-screen h-screen bg-blue-200 flex justify-center p-6">
      <div className="w-[500px] space-y-7">
        <h1 className="text-3xl text-black font-bold text-center">
          Task List
        </h1>
        <AddTask onAddTask={onAddTask} />
        <Tasks tasks={tasks} onTaskClick={onTaskClick} onEraserClick={onEraserClick} />
      </div>
    </div>
  );
}

export default App;