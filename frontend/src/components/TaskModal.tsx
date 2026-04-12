import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createTask, updateTask } from '../api/tasks';
import { getUsers } from '../api/users';
import { type Task, type Member } from '../types';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { parseApiError } from '../lib/errors';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
interface Props {
  projectId: string;
  task?: Task;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const inputClass = 'w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-sm outline-none transition-colors bg-white';

const TaskModal = ({ projectId, task, onClose }: Props) => {
  const queryClient = useQueryClient();
  const isEditing = !!task;

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee_id: '',
    due_date: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: users = [] } = useQuery<Member[]>({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        assignee_id: task.assignee_id || '',
        due_date: task.due_date
          ? new Date(task.due_date).toISOString().split('T')[0]
          : '',
      });
    }
  }, [task]);

  const mutation = useMutation({
    mutationFn: () => {
      const data = {
        title: form.title,
        description: form.description || undefined,
        status: form.status,
        priority: form.priority,
        assignee_id: form.assignee_id === '' ? '' : form.assignee_id,
        due_date: form.due_date || undefined,
      };
      return isEditing
        ? updateTask(task.id, data)
        : createTask(projectId, data);
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Task updated successfully' : 'Task created successfully');
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(parseApiError(error));
    },
  });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg
        max-h-[90vh] flex flex-col">

        {/* Header — sticky */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4
          border-b border-slate-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-800">
            {isEditing ? 'Edit Task' : 'Create Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600
              hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="px-6 py-5 overflow-y-auto flex-1">

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none
                  transition-colors
                  ${errors.title
                    ? 'border-red-400 focus:border-red-400 bg-red-50'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10'
                  }`}
                placeholder="Task title"
                autoFocus
              />
              {errors.title && (
                <p className="mt-1.5 text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description{' '}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className={`${inputClass} resize-none`}
                placeholder="Add a description..."
                rows={3}
              />
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Status
                </label>
                <Select value={form.status} onValueChange={(val) => setForm({ ...form, status: val })}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Priority
                </label>
                <Select value={form.priority} onValueChange={(val) => setForm({ ...form, priority: val })}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Assignee{' '}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <Select 
                value={form.assignee_id || "unassigned"} 
                onValueChange={(val) => setForm({ ...form, assignee_id: val === "unassigned" ? "" : val })}
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="Select Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Due Date{' '}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) =>
                  setForm({ ...form, due_date: e.target.value })
                }
                className={inputClass}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 border border-slate-300
                  hover:bg-slate-50 text-slate-700 text-sm font-medium
                  rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700
                  disabled:bg-indigo-400 text-white text-sm font-semibold
                  rounded-lg transition-colors flex items-center
                  justify-center gap-2"
              >
                {mutation.isPending && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                {mutation.isPending
                  ? 'Saving...'
                  : isEditing
                  ? 'Save Changes'
                  : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;