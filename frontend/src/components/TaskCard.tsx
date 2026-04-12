import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTask } from '../api/tasks';
import { type Task } from '../types';
import { Pencil, Trash2, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import { parseApiError } from '../lib/errors';

interface Props {
  task: Task;
  projectId: string;
  isOwner: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const PRIORITY_STYLES = {
  low: 'bg-slate-100 text-slate-500',
  medium: 'bg-amber-50 text-amber-600 border border-amber-200',
  high: 'bg-red-50 text-red-600 border border-red-200',
};

const STATUS_OPTIONS = [
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const TaskCard = ({ task, projectId, isOwner, onEdit, onDelete }: Props) => {
  const queryClient = useQueryClient();
  const [optimisticStatus, setOptimisticStatus] = useState(task.status);

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateTask(task.id, { status }),
    onMutate: (status) => {
      setOptimisticStatus(status as typeof task.status);
    },
    onError: (error: any) => {
      setOptimisticStatus(task.status);
      toast.error(parseApiError(error));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  }); 

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    statusMutation.mutate(e.target.value);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4
      hover:shadow-sm hover:border-indigo-200 transition-all group
      flex flex-col min-h-[140px]">

      {/* Top — title + actions */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-800 leading-snug flex-1">
          {task.title}
        </h4>
        {isOwner && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100
            transition-opacity flex-shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-slate-400 hover:text-indigo-500
                hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={() => onDelete(task)}
              className="p-1.5 text-slate-400 hover:text-red-500
                hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Description — fixed height so cards stay same size */}
      <div className="mt-2 flex-1">
        {task.description ? (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        ) : (
          <p className="text-xs text-slate-300 italic">No description</p>
        )}
      </div>

      {/* Bottom — priority + status */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center
        justify-between gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
          ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>

        {isOwner ? (
          <select
            value={optimisticStatus}
            onChange={handleStatusChange}
            onClick={(e) => e.stopPropagation()}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1
              outline-none bg-slate-50 text-slate-600 hover:border-indigo-300
              transition-colors max-w-[110px]"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-xs border border-slate-200 rounded-lg px-2 py-1
            bg-slate-50 text-slate-600">
            {STATUS_OPTIONS.find(s => s.value === optimisticStatus)?.label}
          </span>
        )}
      </div>

      {/* Meta — assignee + due date */}
      {(task.assignee_name || task.due_date) && (
        <div className="mt-2 flex items-center gap-3">
          {task.assignee_name && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <User size={11} />
              <span className="truncate max-w-[80px]">{task.assignee_name}</span>
            </div>
          )}
          {task.due_date && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Calendar size={11} />
              <span>{new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;