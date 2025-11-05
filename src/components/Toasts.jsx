// src/components/Toasts.jsx
import { useToast } from '../contexts/ToastContext';

export default function Toasts() {
  const { toasts, remove } = useToast();
  return (
    <div className="fixed right-4 top-4 space-y-2 z-50">
      {toasts.map(t => (
        <div key={t.id} className={`px-4 py-2 rounded shadow-md text-black ${t.type === 'error' ? 'bg-red-200' : t.type === 'success' ? 'bg-green-200' : 'bg-slate-200'}`}>
          <div className="flex items-center gap-2">
            <div className="flex-1 text-sm">{t.message}</div>
            <button className="text-xs underline" onClick={() => remove(t.id)}>OK</button>
          </div>
        </div>
      ))}
    </div>
  );
}
