import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProject } from '../api/projects';
import { deleteTask } from '../api/tasks';
import { type Task } from '../types';
import { ArrowLeft, Plus, Loader2, ClipboardList } from 'lucide-react';
import TaskModal from '../components/TaskModal';
import TaskCard from '../components/TaskCard';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from 'sonner';
import { parseApiError } from '../lib/errors';
import { useAuth } from '../context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
const STATUS_COLUMNS = [
  { key: 'todo', label: 'Todo' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

const STATUS_STYLES = {
  todo: { badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  in_progress: { badge: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  done: { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
};

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [deletingTask, setDeletingTask] = useState<Task | undefined>();
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id!),
  });

  const isOwner = project?.owner_id === user?.id;

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDeletingTask(undefined);
    },
    onError: (error: any) => {
      setDeletingTask(undefined);
      toast.error(parseApiError(error));
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
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-500 font-semibold">Failed to load project</p>
          <button
            onClick={() => navigate('/projects')}
            className="mt-4 text-sm text-indigo-600 hover:underline"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const tasks: Task[] = project.tasks || [];

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = statusFilter ? t.status === statusFilter : true;
    const matchesAssignee = assigneeFilter !== 'all' ? t.assignee_id === assigneeFilter : true;
    return matchesStatus && matchesAssignee;
  });

  const getTasksByStatus = (status: string) =>
    filteredTasks.filter((t) => t.status === status);

  const assignees = tasks
    .filter((t) => t.assignee_id && t.assignee_name)
    .reduce((acc: { id: string; name: string }[], t) => {
      if (!acc.find((a) => a.id === t.assignee_id)) {
        acc.push({ id: t.assignee_id!, name: t.assignee_name! });
      }
      return acc;
    }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Back link */}
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-1.5 text-sm text-slate-500
            hover:text-slate-700 transition-colors mb-5"
        >
          <ArrowLeft size={15} />
          Back to Projects
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-slate-500 text-sm mt-1 leading-relaxed line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          {isOwner && (
            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600
                hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg
                transition-colors shadow-sm flex-shrink-0"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Add Task</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-6 sm:gap-8 mb-6 text-sm">
          {/* Status filter */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-slate-500 font-medium flex-shrink-0">Status:</span>
            <div className="flex gap-2">
              {[{ key: '', label: 'All' }, ...STATUS_COLUMNS].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setStatusFilter(s.key)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium border
                    transition-all whitespace-nowrap
                    ${statusFilter === s.key
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/30'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Assignee filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium flex-shrink-0">Assignee:</span>
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {assignees.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Empty states */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <ClipboardList size={24} className="text-slate-400" />
            </div>
            <h3 className="text-slate-700 font-semibold">No tasks yet</h3>
            <p className="text-slate-400 text-sm mt-1">Get started by creating a new task.</p>
            {isOwner && (
              <button
                onClick={() => setShowTaskModal(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm inline-flex items-center gap-2"
              >
                <Plus size={16} /> Add your first task
              </button>
            )}
          </div>
        )}

        {tasks.length > 0 && filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center
              justify-center mb-4">
              <ClipboardList size={24} className="text-slate-400" />
            </div>
            <h3 className="text-slate-700 font-semibold">No matching tasks</h3>
            <p className="text-slate-400 text-sm mt-1">
              Try changing your filters
            </p>
            <button
              onClick={() => { setStatusFilter(''); setAssigneeFilter('all'); }}
              className="mt-4 text-sm text-indigo-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Kanban columns */}
        {tasks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {STATUS_COLUMNS.map((col) => {
              const colTasks = getTasksByStatus(col.key);
              
              if (colTasks.length === 0) {
                return null;
              }

              const styles = STATUS_STYLES[col.key as keyof typeof STATUS_STYLES];

              return (
                <div key={col.key} className="flex flex-col gap-3">
                  {/* Column header */}
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs
                      font-semibold px-2.5 py-1 rounded-full ${styles.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                      {col.label}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Task list */}
                  <div className="flex flex-col gap-3">
                    {colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        projectId={id!}
                        isOwner={isOwner}
                        onEdit={handleEditTask}
                        onDelete={setDeletingTask}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showTaskModal && (
        <TaskModal
          projectId={id!}
          task={editingTask}
          onClose={handleCloseModal}
        />
      )}

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