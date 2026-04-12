import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getProjects, deleteProject } from '../api/projects';
import { type Project } from '../types';
import { Plus, Folder, Trash2, ChevronRight, Loader2 } from 'lucide-react';
import CreateProjectModal from '../components/CreateProjectModal';
import ConfirmDialog from '../components/ConfirmDialog';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDeleteId(null);
    },
  });

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium">Failed to load projects</p>
          <p className="text-slate-400 text-sm mt-1">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Projects</h1>
            <p className="text-slate-500 text-sm mt-1">
              {projects?.length || 0} project{projects?.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700
              text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={16} />
            New Project
          </button>
        </div>

        {/* Empty state */}
        {projects?.length === 0 && (
          <div className="text-center py-20">
            <Folder size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-600 font-medium">No projects yet</h3>
            <p className="text-slate-400 text-sm mt-1">
              Create your first project to get started
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700
                text-white text-sm font-medium rounded-lg transition-colors"
            >
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
                className="bg-white rounded-xl border p-6 hover:shadow-md hover:border-blue-200
                  transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center
                      justify-center flex-shrink-0">
                      <Folder size={18} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate">
                        {project.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteClick(e, project.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400
                      hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {project.description && (
                  <p className="mt-3 text-sm text-slate-500 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {project.tasks?.length || 0} tasks
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-slate-300 group-hover:text-blue-500 transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateProjectModal onClose={() => setShowModal(false)} />
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