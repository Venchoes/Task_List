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
                <li key={task.id} className="flex gap-2 items-center">
                    {/* ao clicar na tarefa, chama a função onTaskClick passada como props */}
                    {/* use flex-1 em vez de w-full para evitar que o botão ocupe/ sobreponha outros botões */}
                    <button type="button" onClick={() => onTaskClick(task.id)} className={`flex-1 bg-blue-300 text-left text-black p-2 rounded-md ${task.status === 'done' && 'line-through'}`}>
                        {task.title}
                    </button>
                    {/* botão para editar a tarefa */}
                    <button type="button" onClick={() => onSeeDetailsClick(task)} className="bg-yellow-200 p-2 rounded-md text-black">
                        <ChevronRightIcon className="h-6 w-6" />
                    </button>
                    <button type="button" onClick={() => onEraserClick(task.id)} className="bg-red-300 p-2 rounded-md text-black">
                        <EraserIcon />
                    </button>
                </li>
            ))}
        </ul>
    )
}

// exportando o componente Tasks
export default Tasks;