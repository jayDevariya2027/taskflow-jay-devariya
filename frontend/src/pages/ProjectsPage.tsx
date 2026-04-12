import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getProjects, deleteProject } from '../api/projects';
import { type Project } from '../types';
import { Plus, Folder, Trash2, Pencil, ChevronRight, Loader2, LayoutDashboard } from 'lucide-react';
import CreateProjectModal from '../components/CreateProjectModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { parseApiError } from '../lib/errors';

const ProjectsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      toast.success('Project deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDeleteId(null);
    },
    onError: (error: any) => {
      setDeleteId(null);
      toast.error(parseApiError(error));
    },
  });

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center
            justify-center mx-auto mb-4">
            <LayoutDashboard size={20} className="text-red-500" />
          </div>
          <p className="text-red-500 font-semibold">Failed to load projects</p>
          <p className="text-slate-400 text-sm mt-1">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Projects
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {projects?.length || 0} project{projects?.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => { setEditingProject(undefined); setShowModal(true); }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600
              hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg
              transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {/* Empty state */}
        {projects?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center
              justify-center mb-4">
              <Folder size={28} className="text-indigo-400" />
            </div>
            <h3 className="text-slate-700 font-semibold text-lg">
              No projects yet
            </h3>
            <p className="text-slate-400 text-sm mt-1 max-w-xs">
              Create your first project to start organizing your tasks
            </p>
            <button
              onClick={() => { setEditingProject(undefined); setShowModal(true); }}
              className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-indigo-600
                hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg
                transition-colors shadow-sm"
            >
              <Plus size={16} />
              Create Project
            </button>
          </div>
        )}

        {/* Projects grid */}
        {projects && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project: Project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="bg-white rounded-xl border border-slate-200 p-5
                  hover:shadow-md hover:border-indigo-200 transition-all
                  group cursor-pointer"
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center
                      justify-center flex-shrink-0">
                      <Folder size={17} className="text-indigo-500" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate text-sm">
                        {project.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions — visible on hover */}
                  {project?.owner_id === user?.id && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProject(project);
                          setShowModal(true);
                        }}
                        className="p-1.5 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, project.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                {project.description && (
                  <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                )}

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center
                  justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    {project.task_count || 0} task{Number(project.task_count) !== 1 ? 's' : ''}
                  </span>
                  {project.owner_id !== user?.id && (
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5
                      rounded-full font-medium">
                      by {project.owner_name}
                    </span>
                  )}
                  <ChevronRight
                    size={15}
                    className="text-slate-300 group-hover:text-indigo-500
                      transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateProjectModal project={editingProject} onClose={() => setShowModal(false)} />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Project"
        description="This will permanently delete the project and all its tasks. This action cannot be undone."
        confirmLabel="Delete Project"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default ProjectsPage;