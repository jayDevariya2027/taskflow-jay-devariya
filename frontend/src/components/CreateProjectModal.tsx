import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProject, updateProject } from '../api/projects';
import { type Project } from '../types';
import { X, Loader2, Folder } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  project?: Project;
  onClose: () => void;
}

const CreateProjectModal = ({ project, onClose }: Props) => {
  const queryClient = useQueryClient();
  const isEditing = !!project;
  const [form, setForm] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (project) {
      setForm({ name: project.name, description: project.description || '' });
    }
  }, [project]);

  const mutation = useMutation({
    mutationFn: () => isEditing
      ? updateProject(project.id, { name: form.name, description: form.description || undefined })
      : createProject(form.name, form.description || undefined),
    onSuccess: () => {
      toast.success(isEditing ? 'Project updated successfully' : 'Project created successfully');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4
          border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center
              justify-center">
              <Folder size={16} className="text-indigo-600" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">
              {isEditing ? 'Edit Project' : 'Create Project'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600
              hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Modal body */}
        <div className="px-6 py-5">
          {mutation.isError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200
              text-red-600 text-sm">
              Failed to {isEditing ? 'edit' : 'create'} project. Please try again.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none
                  transition-colors
                  ${errors.name
                    ? 'border-red-400 focus:border-red-400 bg-red-50'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10'
                  }`}
                placeholder="My Awesome Project"
                autoFocus
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

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
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300
                  focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10
                  text-sm outline-none transition-colors resize-none"
                placeholder="What is this project about?"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
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
                  rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {mutation.isPending && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                {mutation.isPending ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Project')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;