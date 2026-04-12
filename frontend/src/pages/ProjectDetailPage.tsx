import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProject } from '../api/projects';
import { deleteTask } from '../api/tasks';
import { type Task } from '../types';
import {
  ArrowLeft, Plus, Loader2, ClipboardList
} from 'lucide-react';
import TaskModal from '../components/TaskModal';
import TaskCard from '../components/TaskCard';
import ConfirmDialog from '../components/ConfirmDialog';

const STATUS_COLUMNS = [
  { key: 'todo', label: 'Todo' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

const STATUS_STYLES = {
  todo: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
};

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [deletingTask, setDeletingTask] = useState<Task | undefined>();
  const [statusFilter, setStatusFilter] = useState('');

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id!),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDeletingTask(undefined);
    },
  });

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleCloseModal = () => {
    setShowTaskModal(false);
    setEditingTask(undefined);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium">Failed to load project</p>
          <button
            onClick={() => navigate('/projects')}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const tasks: Task[] = project.tasks || [];
  const filteredTasks = statusFilter
    ? tasks.filter((t) => t.status === statusFilter)
    : tasks;

  const getTasksByStatus = (status: string) =>
    filteredTasks.filter((t) => t.status === status);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-1.5 text-sm text-slate-500
              hover:text-slate-700 transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-slate-500 text-sm mt-1">
                  {project.description}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700
                text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
            >
              <Plus size={16} />
              Add Task
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm text-slate-500">Filter:</span>
            <div className="flex gap-2">
              {[{ key: '', label: 'All' }, ...STATUS_COLUMNS].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setStatusFilter(s.key)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors
                    ${statusFilter === s.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="text-center py-20">
            <ClipboardList size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-600 font-medium">No tasks yet</h3>
            <p className="text-slate-400 text-sm mt-1">
              Add your first task to get started
            </p>
            <button
              onClick={() => setShowTaskModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700
                text-white text-sm font-medium rounded-lg transition-colors"
            >
              Add Task
            </button>
          </div>
        )}

        {/* Kanban columns */}
        {tasks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STATUS_COLUMNS.map((col) => {
              const colTasks = getTasksByStatus(col.key);
              return (
                <div key={col.key} className="flex flex-col gap-3">
                  {/* Column header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                        ${STATUS_STYLES[col.key as keyof typeof STATUS_STYLES]}`}>
                        {col.label}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {colTasks.length}
                      </span>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="flex flex-col gap-3">
                    {colTasks.length === 0 ? (
                      <div className="border-2 border-dashed border-slate-200 rounded-lg
                        p-6 text-center">
                        <p className="text-xs text-slate-400">No tasks</p>
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          projectId={id!}
                          onEdit={handleEditTask}
                          onDelete={setDeletingTask}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          projectId={id!}
          task={editingTask}
          onClose={handleCloseModal}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deletingTask}
        title="Delete Task"
        description={`Are you sure you want to delete "${deletingTask?.title}"? This cannot be undone.`}
        confirmLabel="Delete Task"
        loading={deleteTaskMutation.isPending}
        onConfirm={() =>
          deletingTask && deleteTaskMutation.mutate(deletingTask.id)
        }
        onCancel={() => setDeletingTask(undefined)}
      />
    </div>
  );
};

export default ProjectDetailPage;