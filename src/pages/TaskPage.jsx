import { useSearchParams } from "react-router-dom";
import { Undo2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function TaskPage() 
{
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const title = searchParams.get("title");
  const description = searchParams.get("description");
  return <div className="w-screen h-screen bg-blue-200 flex justify-center p-6">

    <div className="w-[500px] space-y-7">
        <div className="flex justify-center relative mb-6">
          {/* use navigate('/') instead of navigate(-1) to avoid synthetic clicks hitting elements on the previous page */}
          <button onClick={() => navigate('/')} className="absolute left-0 top-0 bottom-0 px-2 py-2">
            <Undo2 />
          </button> 
        <h1 className="text-3xl text-black font-bold text-center">
          Task Details
        </h1>
        </div>

        <div className="space-y-4 p-6 bg-yellow-100 rounded-md shadow flex flex-col">
          <h2 className="text-xl text-black font-bold">{title}</h2>
          <p className="text-lg text-black font-mono">{description}</p>
        </div>
      </div>
    </div>;
}

export default TaskPage;