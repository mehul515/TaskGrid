"use client"
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Loader2, Edit, Trash2, ChevronDown, ChevronUp, Send, Circle, User, Calendar, MessageSquare, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function TaskDetailPage() {
  const { taskId } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    assigned_to: ''
  });
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentContent, setEditedCommentContent] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  useEffect(() => {
    const fetchUserAndTaskData = async () => {
      try {
        setLoading(true);

        // Get current user session
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!currentUser) {
          router.push('/login');
          return;
        }
        setUser(currentUser);

        // Fetch task details
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', taskId)
          .single();

        if (taskError) throw taskError;
        if (!taskData) throw new Error('Task not found');

        // Check if user has access to this task
        const { data: memberData, error: memberError } = await supabase
          .from('project_members')
          .select('*')
          .eq('project_id', taskData.project_id)
          .eq('user_id', currentUser.id)
          .single();

        if (memberError || !memberData) throw new Error('You do not have access to this task');

        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', taskData.project_id)
          .single();

        if (projectError) throw projectError;

        // Fetch project members for assignee dropdown
        const { data: membersData, error: membersError } = await supabase
          .from('project_members')
          .select('user_id, member_name')
          .eq('project_id', taskData.project_id);

        if (membersError) throw membersError;

        // Fetch comments
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('*')
          .eq('task_id', taskId)
          .order('created_at', { ascending: true });

        if (commentsError) throw commentsError;

        setTask(taskData);
        setProject(projectData);
        setMembers(membersData);
        setComments(commentsData);
        setFormData({
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          assigned_to: taskData.assigned_to
        });
      } catch (error) {
        console.error('Error fetching task data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndTaskData();
  }, [taskId, router]);

  const handleEditToggle = () => {
    setEditing(!editing);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleAssigneeChange = (value) => {
    setFormData(prev => ({ ...prev, assigned_to: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowSaveDialog(true);
  };

  const confirmSaveChanges = async () => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(formData)
        .eq('id', taskId);

      if (error) throw error;

      setTask(prev => ({ ...prev, ...formData }));
      setEditing(false);
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Error updating task:', error);
      setError(error.message);
      setShowSaveDialog(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      // Get fresh user data for comment
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('comments')
        .insert([{
          task_id: taskId,
          user_id: currentUser.id,
          commentor_name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0],
          content: newComment
        }])
        .select();

      if (error) throw error;

      setComments(prev => [...prev, data[0]]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError(error.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError(error.message);
    }
  };

  const handleEditComment = async () => {
    if (!editedCommentContent.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editedCommentContent })
        .eq('id', editingCommentId);

      if (error) throw error;

      setComments(prev =>
        prev.map(c =>
          c.id === editingCommentId ? { ...c, content: editedCommentContent } : c
        )
      );
      setEditingCommentId(null);
      setEditedCommentContent('');
    } catch (error) {
      console.error('Error editing comment:', error);
      setError(error.message);
    }
  };

  const handleDeleteTask = async () => {
    setIsDeleting(true);
    try {
      // First delete all comments associated with the task
      const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .eq('task_id', taskId);

      if (commentsError) throw commentsError;

      // Then delete the task itself
      const { error: taskError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (taskError) throw taskError;

      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(error.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-6 space-y-8 max-w-5xl mx-auto">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="space-y-2">
                <div className="h-9 w-64 bg-gray-900 rounded-md animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-900 rounded-md animate-pulse"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-9 w-24 bg-gray-900 rounded-md animate-pulse"></div>
                <div className="h-9 w-24 bg-gray-900 rounded-md animate-pulse"></div>
              </div>
            </div>

            {/* Metadata Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-900 rounded-xl animate-pulse"></div>
              ))}
            </div>

            {/* Description Skeleton */}
            <div className="space-y-3 p-5 rounded-lg border border-gray-800 bg-gray-900">
              <div className="h-5 w-24 bg-gray-800 rounded-md animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-800 rounded-md animate-pulse"></div>
                <div className="h-4 w-4/5 bg-gray-800 rounded-md animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-800 rounded-md animate-pulse"></div>
              </div>
            </div>

            {/* Comments Skeleton */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <div className="h-7 w-32 bg-gray-900 rounded-md animate-pulse"></div>
                <div className="h-6 w-16 bg-gray-900 rounded-md animate-pulse"></div>
              </div>

              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 rounded-lg border border-gray-800 bg-gray-900 animate-pulse">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-gray-800 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-gray-800 rounded-md"></div>
                        <div className="h-3 w-full bg-gray-800 rounded-md"></div>
                        <div className="h-3 w-4/5 bg-gray-800 rounded-md"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <div className="flex-1 h-10 bg-gray-900 rounded-md animate-pulse"></div>
                <div className="w-10 h-10 bg-gray-900 rounded-md animate-pulse"></div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <motion.div 
            className="flex flex-col items-center justify-center h-[calc(100vh-200px)] p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-md w-full bg-gray-900/70 border border-red-900/50 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-red-400" />
                <h2 className="text-xl font-bold text-red-400">Error loading task</h2>
              </div>
              <p className="text-gray-300 mb-6">{error}</p>
              <div className="flex gap-3">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="border-gray-700 hover:bg-gray-800/50 flex-1"
                >
                  Go Back
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 flex-1"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </motion.div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  if (!task || !user) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="text-white p-6">
            <p>Task not found</p>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  const assignedMember = members.find(m => m.user_id === task.assigned_to);
  const isLeader = user.id === project.user_id;
  const canEdit = user.id === task.created_by || isLeader;

  const getStatusColor = (status) => {
    switch(status) {
      case 'todo': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'in-progress': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'review': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'done': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'todo': return <Circle className="h-4 w-4 text-blue-400" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-amber-400" />;
      case 'review': return <AlertCircle className="h-4 w-4 text-purple-400" />;
      case 'done': return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      default: return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <motion.div 
          className="p-6 space-y-8 max-w-5xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <motion.h1 
                className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-300"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {task.title}
              </motion.h1>
              <motion.div
                className="flex items-center gap-3 text-sm"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <Link 
                  href={`/projects/${project?.id}`}
                  className="text-teal-400 hover:text-teal-300 transition-colors font-medium"
                >
                  {project?.name}
                </Link>
              </motion.div>
            </div>
            
            {canEdit && (
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex gap-2"
              >
                <Button
                  onClick={handleEditToggle}
                  variant={editing ? "destructive" : "outline"}
                  size="sm"
                  className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 border-none hover:text-white hover:cursor-pointer"
                >
                  <Edit className="h-4 w-4" />
                  {editing ? 'Cancel Editing' : 'Edit Task'}
                </Button>
                {isLeader && (
                  <Button
                    onClick={() => setShowDeleteDialog(true)}
                    variant="outline"
                    size="sm"
                    className="border-red-600 text-red-400 hover:bg-red-900/30 hover:text-red-300 bg- cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Task
                  </Button>
                )}
              </motion.div>
            )}
          </div>

          {/* Main Content */}
          {editing ? (
            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6 bg-gray-900/50 border border-gray-800 rounded-xl p-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Title</label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    className="bg-gray-800 border-gray-700 focus:border-cyan-400 focus:ring-cyan-400/20 text-gray-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Description</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    className="bg-gray-800 border-gray-700 focus:border-cyan-400 focus:ring-cyan-400/20 min-h-[150px] text-gray-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-400">Status</label>
                    <Select value={formData.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 hover:border-cyan-400/50 text-gray-300">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="todo" className="hover:bg-gray-700 text-gray-300">
                          <div className="flex items-center gap-2">
                            <Circle className="h-3 w-3 text-blue-400" />
                            To Do
                          </div>
                        </SelectItem>
                        <SelectItem value="in-progress" className="hover:bg-gray-700 text-gray-300">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-amber-400" />
                            In Progress
                          </div>
                        </SelectItem>
                        <SelectItem value="review" className="hover:bg-gray-700 text-gray-300">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-3 w-3 text-purple-400" />
                            In Review
                          </div>
                        </SelectItem>
                        <SelectItem value="done" className="hover:bg-gray-700 text-gray-300">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-emerald-400" />
                            Done
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-400">Assignee</label>
                    <Select value={formData.assigned_to} onValueChange={handleAssigneeChange}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 hover:border-cyan-400/50 text-gray-300">
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {members.map(member => (
                          <SelectItem 
                            key={member.user_id} 
                            value={member.user_id}
                            className="hover:bg-gray-700 text-gray-300"
                          >
                            {member.member_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleEditToggle}
                  className="border-gray-700 hover:bg-gray-700/50 text-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                >
                  Save Changes
                </Button>
              </div>
            </motion.form>
          ) : (
            <motion.div 
              className="space-y-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              {/* Task Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div 
                  className={`block group relative overflow-hidden bg-gray-900/50 hover:bg-gray-800/50 duration-300 max-w-xs bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700 hover:border-teal-500/50 transition-all h-full`}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Status</h3>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <span className="font-medium capitalize">{task.status.replace('-', ' ')}</span>
                  </div>
                </motion.div>

                <motion.div 
                  className="block group relative overflow-hidden bg-gray-900/50 hover:bg-gray-800/50 duration-300 max-w-xs bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700 hover:border-teal-500/50 transition-all h-full"
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Assignee</h3>
                  <p className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-amber-400" />
                    {assignedMember?.member_name || 'Unassigned'}
                  </p>
                </motion.div>

                <motion.div 
                  className="block group relative overflow-hidden bg-gray-900/50 hover:bg-gray-800/50 duration-300 max-w-xs bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700 hover:border-teal-500/50 transition-all h-full"
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Created</h3>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    {format(new Date(task.created_at), 'MMM d, yyyy')}
                  </p>
                </motion.div>
              </div>

              {/* Description */}
              <motion.div 
                className="p-5 rounded-lg border bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-teal-500/50"
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-sm font-medium text-gray-400 mb-3">Description</h3>
                <div className="prose prose-invert max-w-none">
                  <p className="whitespace-pre-line text-gray-200">
                    {task.description || 'No description provided'}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Comments Section */}
          <motion.div 
            className="space-y-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-300">
                Discussion
              </h2>
              <Badge variant="outline" className="border-gray-700 text-gray-400">
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </Badge>
            </div>

            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <motion.div 
                    key={comment.id}
                    className="group relative"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + (index * 0.05) }}
                  >
                    <div className="absolute -left-4 top-0 h-full w-0.5 bg-gradient-to-b from-cyan-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900/70 transition-colors">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-start gap-3">
                          <div className="bg-cyan-500/10 p-2 rounded-full">
                            <User className="h-4 w-4 text-cyan-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-cyan-300">{comment.commentor_name}</p>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            {editingCommentId === comment.id ? (
                              <div className="mt-2 space-y-2">
                                <Textarea
                                  value={editedCommentContent}
                                  onChange={(e) => setEditedCommentContent(e.target.value)}
                                  className="bg-gray-800 border-gray-700 focus:border-cyan-400 text-gray-300"
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    onClick={handleEditComment}
                                    className="bg-cyan-600 hover:bg-cyan-700"
                                  >
                                    Save
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => setEditingCommentId(null)}
                                    className="border-gray-700 hover:bg-gray-800/50 text-gray-300"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="mt-1 text-gray-300 whitespace-pre-line">
                                {comment.content}
                              </p>
                            )}
                          </div>
                        </div>
                        {(comment.user_id === user.id || canEdit) && editingCommentId !== comment.id && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {comment.user_id === user.id && (
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditedCommentContent(comment.content);
                                }}
                                className="text-gray-500 hover:text-cyan-400 transition-colors p-1 hover:cursor-pointer"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-gray-500 hover:text-red-400 transition-colors p-1 hover:cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  className="text-center py-12 rounded-lg border-2 border-dashed border-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <MessageSquare className="h-10 w-10 mx-auto text-gray-600" />
                  <h3 className="mt-3 text-gray-400 font-medium">No comments yet</h3>
                  <p className="text-gray-500 text-sm mt-1">Be the first to add a comment</p>
                </motion.div>
              )}
            </div>

            {/* Add Comment */}
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex-1 relative">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="pl-10 bg-gray-900 border-gray-800 focus:border-cyan-400 focus:ring-cyan-400/20 text-gray-300"
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <User className="h-4 w-4" />
                </div>
              </div>
              <Button 
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Save Changes Confirmation Dialog */}
        <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <AlertDialogContent className="bg-gray-900 border-gray-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-200">Confirm Changes</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Are you sure you want to save these changes to the task?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-700 hover:bg-gray-800 text-gray-300">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmSaveChanges}
                className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
              >
                Save Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Task Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-gray-900 border-gray-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-200">Delete Task</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Are you sure you want to delete this task? This action cannot be undone and will also delete all associated comments.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-700 hover:bg-gray-800 text-gray-300">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteTask}
                className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : 'Delete Task'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </AuthGuard>
  );
}