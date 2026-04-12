import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProject } from '../api/projects';
import { X, Loader2 } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const CreateProjectModal = ({ onClose }: Props) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () => createProject(form.name, form.description || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onClose();
    },
  });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Project name is required';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Create Project
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100
              rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {mutation.isError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            Failed to create project. Please try again.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors
                ${errors.name
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-slate-300 focus:border-blue-500'
                }`}
              placeholder="My Awesome Project"
              autoFocus
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description{' '}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500
                text-sm outline-none transition-colors resize-none"
              placeholder="What is this project about?"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-slate-300 hover:bg-slate-50
                text-slate-700 text-sm font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                text-white text-sm font-medium rounded-lg transition-colors
                flex items-center justify-center gap-2"
            >
              {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
              {mutation.isPending ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;