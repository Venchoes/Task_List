// src/components/Tasks.jsx
// componente para exibir a lista de tarefas
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { EraserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Tasks({ onEraserClick, onTaskClick, tasks }) 
{
    const navigate = useNavigate();

    function onSeeDetailsClick(task)
    {
        const query = new URLSearchParams();
        query.set('title', task.title);
        query.set('description', task.description);
        navigate(`/task?${query.toString()}`);
    }
    //recebendo as tarefas como props
    return (
        <ul className="space-y-4 p-6 bg-white rounded-md shadow">
            {tasks.map((task) => (
                <li key={task.id} className="flex gap-2">
                    {/* ao clicar na tarefa, chama a função onTaskClick passada como props */}
                    <button onClick={() => onTaskClick(task.id)} className={`bg-blue-300 text-left w-full text-black p-2 rounded-md ${task.isCompleted && 'line-through'}`}>
                        {task.title}
                    </button>
                    {/* botão para editar a tarefa */}
                    <button onClick={() => onSeeDetailsClick(task)} className="bg-yellow-200 p-2 rounded-md text-black">
                        <ChevronRightIcon className="h-6 w-6" />
                    </button>
                    <button onClick={() => onEraserClick(task.id)} className="bg-red-300 p-2 rounded-md text-black">
                        <EraserIcon />
                    </button>
                </li>
            ))}
        </ul>
    )
}

// exportando o componente Tasks
export default Tasks;