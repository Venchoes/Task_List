// src/components/AddTask.jsx
// componente para adicionar uma nova tarefa
import { useState } from "react";

function AddTask({ onAddTask }) 
{
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    return (
    <div className="space-y-4 p-6 bg-white rounded-md shadow flex flex-col">
        <input type="text" placeholder="Insert Task Title" className="text-left border border-slate-500 outline-slate-500 px-4 py-2 rounded-md" value={title} onChange={(event) => setTitle(event.target.value)} />
        <input type="text" placeholder="Insert Task Description" className="text-left border border-slate-500 outline-slate-500 px-4 py-2 rounded-md" value={description} onChange={(event) => setDescription(event.target.value)} />

        <button onClick={function() { if (!title.trim() || !description.trim()) return alert("Please fill in all fields."); onAddTask(title, description); setTitle(""); setDescription(""); }} className="bg-green-600 text-black px-4 py-2 rounded-md w-full font-medium">
            Add Task
        </button>
    </div>
    );
}

export default AddTask;
