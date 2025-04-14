'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import {
  ArrowLeft,
  Pencil,
  Save,
  Plus,
  Trash2,
  Check,
  Tag,
  X,
  MessageSquare,
  User,
  Calendar,
  ChevronRight,
  MoreVertical,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';

const STATUSES = ['todo', 'in_progress', 'review', 'done'];
const STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'In Review',
  done: 'Done'
};

const STATUS_COLORS = {
  todo: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  review: 'bg-purple-500',
  done: 'bg-green-500'
};

const LABEL_COLOR = '#3b82f6';

export default function KanbanBoard() {
  const { id: projectId } = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    labels: [],
  });
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserName, setCurrentUserName] = useState('');
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo',
    assigned_to: null,
    labels: [],
  });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [newLabelInput, setNewLabelInput] = useState('');
  const [isAddingLabel, setIsAddingLabel] = useState(false);

  const getUserName = (userId) => {
    const member = members.find((m) => m.user_id === userId);
    return member?.member_name || 'Unassigned';
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: authUser } = await supabase.auth.getUser();
        const currentUserId = authUser?.user?.id;

        if (!currentUserId) {
          toast.error('You must be logged in to view this project.', {
            icon: <AlertCircle className="text-red-400" />
          });
          router.push('/projects');
          return;
        }

        setCurrentUserId(currentUserId);
        setCurrentUserName(authUser.user.user_metadata?.name || 'Anonymous');

        // Check membership
        const { data: memberData, error: memberError } = await supabase
          .from('project_members')
          .select('user_id, member_name')
          .eq('project_id', projectId);

        if (memberError || !memberData.some(m => m.user_id === currentUserId)) {
          toast.error('Access denied. You are not a member of this project.', {
            icon: <AlertCircle className="text-red-400" />
          });
          router.push('/projects');
          return;
        }

        setMembers(memberData);

        // Fetch project
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (projectError || !projectData) {
          toast.error('Failed to load project.', {
            icon: <AlertCircle className="text-red-400" />
          });
          router.push('/projects');
          return;
        }

        setProject(projectData);

        const { data: tasksData } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId);

        setTasks(tasksData || []);
      } catch (error) {
        toast.error(error.message, {
          icon: <AlertCircle className="text-red-400" />
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, router]);

  const fetchComments = async (taskId) => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at');
    if (!error) setComments(data || []);
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !selectedTask || !currentUserId) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          task_id: selectedTask.id,
          user_id: currentUserId,
          commentor_name: currentUserName,
          content: newComment.trim(),
        })
        .select();

      if (error) throw error;

      if (data?.[0]) {
        setComments((prev) => [...prev, data[0]]);
        setNewComment('');
        toast.success('Comment added', {
          icon: <CheckCircle className="text-teal-400" />
        });
      }
    } catch (error) {
      toast.error('Failed to add comment', {
        description: error.message,
        icon: <AlertCircle className="text-red-400" />
      });
    }
  };

  const handleEditComment = (id, content) => {
    setEditingCommentId(id);
    setEditingText(content);
  };

  const saveEditedComment = async () => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editingText })
        .eq('id', editingCommentId);

      if (error) throw error;

      setComments((prev) =>
        prev.map((c) =>
          c.id === editingCommentId ? { ...c, content: editingText } : c
        )
      );
      setEditingCommentId(null);
      setEditingText('');
      toast.success('Comment updated', {
        icon: <CheckCircle className="text-teal-400" />
      });
    } catch (error) {
      toast.error('Failed to update comment', {
        description: error.message,
        icon: <AlertCircle className="text-red-400" />
      });
    }
  };

  const handleDeleteComment = async (id) => {
    const confirm = window.confirm('Delete this comment?');
    if (!confirm) return;

    try {
      const { error } = await supabase.from('comments').delete().eq('id', id);
      if (error) throw error;

      setComments((prev) => prev.filter((c) => c.id !== id));
      toast.success('Comment deleted', {
        icon: <CheckCircle className="text-teal-400" />
      });
    } catch (error) {
      toast.error('Failed to delete comment', {
        description: error.message,
        icon: <AlertCircle className="text-red-400" />
      });
    }
  };

  const handleTaskClick = async (task) => {
    setSelectedTask(task);
    setEditForm({
      title: task.title,
      description: task.description,
      status: task.status,
      labels: task.labels || [],
    });
    setIsEditing(false);
    setIsDialogOpen(true);
    await fetchComments(task.id);
  };

  const handleSave = async () => {
    const { title, description, status, labels } = editForm;
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title,
          description,
          status,
          labels: labels.filter((l) => l.trim() !== ''),
        })
        .eq('id', selectedTask.id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Task updated', {
        icon: <CheckCircle className="text-teal-400" />
      });
      setTasks((prev) =>
        prev.map((task) =>
          task.id === selectedTask.id ? { ...task, ...data } : task
        )
      );
      setSelectedTask(data);
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update task', {
        description: error.message,
        icon: <AlertCircle className="text-red-400" />
      });
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('Task title is required', {
        icon: <AlertCircle className="text-red-400" />
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: newTask.title,
          description: newTask.description,
          status: newTask.status,
          assigned_to: newTask.assigned_to,
          project_id: projectId,
          created_by: currentUserId,
          labels: newTask.labels.filter((l) => l.trim() !== ''),
        })
        .select()
        .single();

      if (error) throw error;

      setTasks((prev) => [data, ...prev]);
      setNewTask({
        title: '',
        description: '',
        status: 'todo',
        assigned_to: null,
        labels: [],
      });
      setNewTaskOpen(false);
      toast.success('Task created', {
        icon: <CheckCircle className="text-teal-400" />
      });
    } catch (error) {
      toast.error('Failed to create task', {
        description: error.message,
        icon: <AlertCircle className="text-red-400" />
      });
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    const confirm = window.confirm('Are you sure you want to delete this task?');
    if (!confirm) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', selectedTask.id);

      if (error) throw error;

      toast.success('Task deleted', {
        icon: <CheckCircle className="text-teal-400" />
      });
      setTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
      setSelectedTask(null);
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete task', {
        description: error.message,
        icon: <AlertCircle className="text-red-400" />
      });
    }
  };

  const addLabel = (context) => {
    const label = newLabelInput.trim();
    if (!label) return;

    const setter = context === 'edit' ? setEditForm : setNewTask;
    setter((prev) => ({
      ...prev,
      labels: [...prev.labels, label],
    }));

    setNewLabelInput('');
    setIsAddingLabel(false);
  };

  const removeLabel = (labelToRemove, context) => {
    const setter = context === 'edit' ? setEditForm : setNewTask;
    setter((prev) => ({
      ...prev,
      labels: prev.labels.filter((l) => l !== labelToRemove),
    }));
  };

  const groupedTasks = STATUSES.reduce((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status);
    return acc;
  }, {});

  const userIsLeader = currentUserId === project?.user_id;
  const userHasEditAccess =
    currentUserId &&
    (project?.user_id === currentUserId ||
      selectedTask?.created_by === currentUserId);

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-6 max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-800 rounded w-1/3"></div>
              <div className="grid grid-cols-4 gap-4 mt-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="space-y-4">
                    <div className="h-6 bg-gray-800 rounded w-1/2"></div>
                    <div className="h-32 bg-gray-800 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <Link
                href="/projects"
                className="inline-flex items-center text-sm text-teal-400 hover:text-teal-300 transition-colors"
              >
                <ArrowLeft size={16} className="mr-1" />
                Back to Projects
              </Link>
              {project && (
                <div className="mt-2">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                    {project.name}
                  </h1>
                  <p className="text-gray-400">{project.description}</p>
                </div>
              )}
            </div>

            {userIsLeader && (
              <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
                <DialogTrigger asChild>
                  <Button className="flex gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                    <Plus size={16} /> New Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 rounded-xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-300">Create Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Title</Label>
                      <Input
                        placeholder="Task title"
                        value={newTask.title}
                        onChange={(e) =>
                          setNewTask({ ...newTask, title: e.target.value })
                        }
                        className="bg-gray-800 text-gray-300 border-gray-700 focus:border-teal-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Description</Label>
                      <Textarea
                        placeholder="Task description"
                        value={newTask.description}
                        onChange={(e) =>
                          setNewTask({ ...newTask, description: e.target.value })
                        }
                        className="bg-gray-800 border-gray-700 text-gray-300 focus:border-teal-500 min-h-[100px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-gray-300">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Status</Label>
                        <Select
                          value={newTask.status}
                          onValueChange={(value) =>
                            setNewTask({ ...newTask, status: value })
                          }
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700 focus:border-teal-500">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700 text-gray-300">
                            {STATUSES.map((status) => (
                              <SelectItem key={status} value={status} className="hover:bg-gray-700">
                                {STATUS_LABELS[status]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Assign to</Label>
                        <Select
                          value={newTask.assigned_to || ''}
                          onValueChange={(value) =>
                            setNewTask({
                              ...newTask,
                              assigned_to: value || null,
                            })
                          }
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700 focus:border-teal-500">
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700 text-gray-300">
                            <SelectItem value="none" className="hover:bg-gray-700">Unassigned</SelectItem>
                            {members.map((member) => (
                              <SelectItem
                                key={member.user_id}
                                value={member.user_id}
                                className="hover:bg-gray-700"
                              >
                                {member.member_name || 'Unnamed'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Labels</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {newTask.labels.map((label, index) => (
                          <Badge
                            key={index}
                            style={{ backgroundColor: LABEL_COLOR }}
                            className="text-white flex items-center gap-1"
                          >
                            {label}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeLabel(label, 'new');
                              }}
                            >
                              <X size={14} />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      {isAddingLabel ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add label"
                            value={newLabelInput}
                            onChange={(e) => setNewLabelInput(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === 'Enter' && addLabel('new')
                            }
                            className="bg-gray-800 border-gray-700 focus:border-teal-500 text-gray-300"
                          />
                          <Button 
                            onClick={() => addLabel('new')}
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                          >
                            Add
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsAddingLabel(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => setIsAddingLabel(true)}
                        >
                          <Plus size={16} /> Add Label
                        </Button>
                      )}
                    </div>
                    <Button 
                      onClick={handleCreateTask}
                      className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                    >
                      Create Task
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STATUSES.map((status) => (
              <div
                key={status}
                className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[status]}`}></div>
                  <h2 className="font-semibold">{STATUS_LABELS[status]}</h2>
                  <Badge className="ml-auto bg-gray-700 text-gray-300">
                    {groupedTasks[status]?.length || 0}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {groupedTasks[status].map((task) => (
                    <div
                      key={task.id}
                      className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-teal-500/50 transition cursor-pointer"
                      onClick={() => handleTaskClick(task)}
                    >
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                        {task.description}
                      </p>
                      {task.assigned_to && (
                        <p className="text-xs text-gray-500 mt-2">
                          Assigned to: {getUserName(task.assigned_to)}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.labels?.map((label, index) => (
                          <Badge
                            key={index}
                            style={{ backgroundColor: LABEL_COLOR }}
                            className="text-white text-xs"
                          >
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Task Detail Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="bg-gray-900 border-gray-700 rounded-xl max-w-2xl max-h-[90vh] overflow-y-auto">
              {selectedTask && (
                <>
                  <DialogHeader className="flex flex-row justify-between items-start gap-4 mt-5">
                    <div className="flex-1">
                      {isEditing ? (
                        <Input
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm({ ...editForm, title: e.target.value })
                          }
                          className="bg-gray-800 border-gray-700 focus:border-teal-500 text-lg font-semibold text-gray-300"
                        />
                      ) : (
                        <DialogTitle className="text-xl font-bold text-gray-300">{selectedTask.title}</DialogTitle>
                      )}
                    </div>
                    {userHasEditAccess && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="hover:bg-gray-600 bg-gray-700 cursor-pointer w-6 h-6">
                            <MoreVertical className="text-gray-300" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-800 border-gray-700 text-gray-300">
                          <DropdownMenuItem 
                            onClick={isEditing ? handleSave : () => setIsEditing(true)}
                            className="hover:bg-gray-700"
                          >
                            {isEditing ? (
                              <>
                                <Save className="mr-2 h-4 w-4" /> Save
                              </>
                            ) : (
                              <>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={handleDeleteTask}
                            className="text-red-400 hover:bg-red-900/20"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </DialogHeader>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                      <p className="text-sm text-gray-400">Status</p>
                      {isEditing ? (
                        <Select
                          value={editForm.status}
                          onValueChange={(value) =>
                            setEditForm({ ...editForm, status: value })
                          }
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700 focus:border-teal-500 mt-1 text-gray-300">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700 text-gray-300">
                            {STATUSES.map((status) => (
                              <SelectItem key={status} value={status} className="hover:bg-gray-700">
                                {STATUS_LABELS[status]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[selectedTask.status]}`}></div>
                          <p className='text-gray-300'>{STATUS_LABELS[selectedTask.status]}</p>
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                      <p className="text-sm text-gray-400">Assigned to</p>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-gray-500" />
                        <p className='text-gray-300'>{getUserName(selectedTask.assigned_to)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Description</p>
                      {isEditing ? (
                        <Textarea
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({ ...editForm, description: e.target.value })
                          }
                          className="bg-gray-800 border-gray-700 focus:border-teal-500 min-h-[100px] text-gray-300"
                        />
                      ) : (
                        <p className="text-gray-300">
                          {selectedTask.description || 'No description'}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-gray-400 mb-2">Labels</p>
                      <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                          <>
                            {editForm.labels.map((label, index) => (
                              <Badge
                                key={index}
                                style={{ backgroundColor: LABEL_COLOR }}
                                className="text-white flex items-center gap-1"
                              >
                                {label}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeLabel(label, 'edit');
                                  }}
                                >
                                  <X size={14} />
                                </button>
                              </Badge>
                            ))}
                            {isAddingLabel ? (
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Add label"
                                  value={newLabelInput}
                                  onChange={(e) => setNewLabelInput(e.target.value)}
                                  onKeyDown={(e) =>
                                    e.key === 'Enter' && addLabel('edit')
                                  }
                                  className="bg-gray-800 border-gray-700 focus:border-teal-500 h-8 text-gray-300" 
                                />
                                <Button 
                                  size="sm"
                                  onClick={() => addLabel('edit')}
                                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                                >
                                  Add
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setIsAddingLabel(false)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={() => setIsAddingLabel(true)}
                              >
                                <Plus size={14} /> Add Label
                              </Button>
                            )}
                          </>
                        ) : (
                          selectedTask.labels?.map((label, index) => (
                            <Badge
                              key={index}
                              style={{ backgroundColor: LABEL_COLOR }}
                              className="text-white"
                            >
                              {label}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-gray-700 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="h-5 w-5 text-teal-400" />
                      <h3 className="font-semibold text-gray-300">Comments</h3>
                    </div>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                      {comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 relative group"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-teal-400">
                                {comment.commentor_name}
                              </p>
                              {editingCommentId === comment.id ? (
                                <div className="mt-2 space-y-2">
                                  <Textarea
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    className="bg-gray-800 border-gray-700 focus:border-teal-500 text-gray-300"
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={saveEditedComment}
                                      className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingCommentId(null);
                                        setEditingText('');
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-gray-300 mt-1">{comment.content}</p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    {new Date(comment.created_at).toLocaleString()}
                                  </p>
                                </>
                              )}
                            </div>
                            {comment.user_id === currentUserId &&
                              editingCommentId !== comment.id && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6 cursor-pointer text-gray-300 bg-gray-700 hover:bg-gray-600"
                                    >
                                      <MoreVertical className="h-3 w-3 text-gray-300" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="bg-gray-800 border-gray-700 w-32">
                                    <DropdownMenuItem 
                                      onClick={() => handleEditComment(comment.id, comment.content)}
                                      className="text-gray-300 hover:bg-gray-700"
                                    >
                                      <Pencil className="mr-2 h-3 w-3" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="text-red-400 hover:bg-red-900/20"
                                    >
                                      <Trash2 className="mr-2 h-3 w-3" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Input
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === 'Enter' && handleCommentSubmit()
                        }
                        className="bg-gray-800 border-gray-700 focus:border-teal-500 text-gray-300"
                      />
                      <Button 
                        onClick={handleCommentSubmit}
                        className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}