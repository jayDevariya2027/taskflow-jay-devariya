import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTask } from '../api/tasks';
import { type Task } from '../types';
import { Pencil, Trash2, Calendar, User } from 'lucide-react';

interface Props {
  task: Task;
  projectId: string;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const PRIORITY_STYLES = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-yellow-50 text-yellow-700',
  high: 'bg-red-50 text-red-600',
};

const STATUS_OPTIONS = ['todo', 'in_progress', 'done'] as const;

const TaskCard = ({ task, projectId, onEdit, onDelete }: Props) => {
  const queryClient = useQueryClient();
  const [optimisticStatus, setOptimisticStatus] = useState(task.status);

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateTask(task.id, { status }),
    onMutate: (status) => {
      // Optimistic update
      setOptimisticStatus(status as typeof task.status);
    },
    onError: () => {
      // Revert on error
      setOptimisticStatus(task.status);
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
    <div className="bg-white rounded-lg border p-4 hover:shadow-sm transition-shadow group">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-slate-800 flex-1">
          {task.title}
        </h4>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50
              rounded-lg transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50
              rounded-lg transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {/* Priority badge */}
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
          ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>

        {/* Status selector — optimistic */}
        <select
          value={optimisticStatus}
          onChange={handleStatusChange}
          onClick={(e) => e.stopPropagation()}
          className="text-xs border border-slate-200 rounded-lg px-2 py-0.5
            outline-none bg-white text-slate-600 transition-colors"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex items-center gap-3">
        {/* Assignee */}
        {task.assignee_name && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <User size={11} />
            <span>{task.assignee_name}</span>
          </div>
        )}

        {/* Due date */}
        {task.due_date && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar size={11} />
            <span>{new Date(task.due_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;