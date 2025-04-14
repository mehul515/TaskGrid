"use client"
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  MessageSquare,
  User,
  Calendar,
  Zap,
  Layers,
  BarChart2,
  Circle,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activity, setActivity] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [error, setError] = useState(null);

  const fetchDashboardData = async (user) => {
    try {
      setError(null);
      setLoading(true);

      // Fetch user's projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('project_members')
        .select('project_id, projects(*)')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false })
        .limit(5);

      if (projectsError) throw projectsError;

      // Fetch user's tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      // Fetch recent activity
      const taskIds = tasksData?.map(task => task.id) || [];
      let activityData = [];
      if (taskIds.length > 0) {
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('*')
          .in('task_id', taskIds)
          .order('created_at', { ascending: false })
          .limit(5);
        if (commentsError) throw commentsError;
        activityData = commentsData;
      }

      // Fetch pending invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('project_invitation')
        .select('*, projects(name)')
        .eq('email', user.email)
        .eq('status', 'pending');

      if (invitationsError) throw invitationsError;

      setProjects(projectsData?.map(p => p.projects) || []);
      setTasks(tasksData || []);
      setActivity(activityData || []);
      setInvitations(invitationsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getUserSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      return user;
    };

    getUserSession().then(user => {
      if (user) fetchDashboardData(user);
      else router.push('/auth/login');
    });
  }, [router]);

  // Data for charts
  const assignedTasks = tasks.filter(t => t.assigned_to === user?.id);
  const createdTasks = tasks.filter(t => t.created_by === user?.id);
  
  const taskStatusData = [
    { name: 'To Do', value: assignedTasks.filter(t => t.status === 'todo').length, color: '#3b82f6' },
    { name: 'In Progress', value: assignedTasks.filter(t => t.status === 'in-progress').length, color: '#f59e0b' },
    { name: 'In Review', value: assignedTasks.filter(t => t.status === 'review').length, color: '#8b5cf6' },
    { name: 'Done', value: assignedTasks.filter(t => t.status === 'done').length, color: '#10b981' }
  ];

  const projectDeadlines = projects
    .filter(p => p.deadline)
    .map(p => ({
      name: p.name,
      daysLeft: Math.ceil((new Date(p.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5);

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="text-white p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-gray-800 rounded-xl w-1/3"></div>
              <div className="h-4 bg-gray-800 rounded w-1/2"></div>
              <div className="grid grid-cols-4 gap-4 mt-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-28 bg-gray-800 rounded-xl"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="h-80 bg-gray-800 rounded-xl"></div>
                <div className="h-80 bg-gray-800 rounded-xl"></div>
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
          <div className="text-white p-6">
            <div className="bg-red-900/20 border border-red-700 p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-red-400" />
                <h2 className="text-xl font-bold text-red-400">Error loading dashboard</h2>
              </div>
              <p className="text-red-300 mt-3">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                Retry
              </button>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="text-white p-6 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-gray-400">Welcome back! Here's what's happening with your projects.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 p-5 rounded-xl border border-blue-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-300">Active Projects</p>
                  <p className="text-2xl font-bold mt-1">{projects.length}</p>
                </div>
                <div className="bg-blue-700/30 p-3 rounded-lg">
                  <Layers className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 p-5 rounded-xl border border-purple-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-300">Tasks Assigned</p>
                  <p className="text-2xl font-bold mt-1">{assignedTasks.length}</p>
                </div>
                <div className="bg-purple-700/30 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 p-5 rounded-xl border border-green-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-300">Tasks Created</p>
                  <p className="text-2xl font-bold mt-1">{createdTasks.length}</p>
                </div>
                <div className="bg-green-700/30 p-3 rounded-lg">
                  <Zap className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/40 p-5 rounded-xl border border-amber-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-300">Pending Invites</p>
                  <p className="text-2xl font-bold mt-1">{invitations.length}</p>
                </div>
                <div className="bg-amber-700/30 p-3 rounded-lg">
                  <User className="h-6 w-6 text-amber-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Projects Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Recent Projects</h2>
              <Link 
                href="/projects" 
                className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                View all projects <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {projects.slice(0, 3).map(project => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-xl border border-gray-700 hover:border-teal-500/50 transition-all cursor-pointer h-full">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        {project.deadline && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            new Date(project.deadline) < new Date() ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {new Date(project.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-2 line-clamp-2">{project.description}</p>
                      <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between items-center">
                        <span className="text-xs text-gray-500">Leader: {project.leader_name}</span>
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                          {tasks.filter(t => t.project_id === project.id).length} tasks
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800/50 p-8 rounded-xl border border-dashed border-gray-700 text-center">
                <div className="bg-teal-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Layers className="h-6 w-6 text-teal-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
                <p className="text-gray-400 mb-4">Get started by creating your first project</p>
                <Link
                  href="/projects/new"
                  className="inline-flex items-center justify-center bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 hover:border-teal-500/50 text-teal-400 px-4 py-2 rounded-lg transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" /> Create Project
                </Link>
              </div>
            )}
          </div>

          {/* Your Tasks Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Your Tasks</h2>
              <Link 
                href="/tasks" 
                className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                View all tasks <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {assignedTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { status: 'todo', label: 'To Do', icon: <Circle className="h-4 w-4 text-blue-400" /> },
                  { status: 'in-progress', label: 'In Progress', icon: <Clock className="h-4 w-4 text-yellow-400" /> },
                  { status: 'review', label: 'In Review', icon: <BarChart2 className="h-4 w-4 text-purple-400" /> },
                  { status: 'done', label: 'Done', icon: <CheckCircle className="h-4 w-4 text-green-400" /> },
                ].map((statusItem) => {
                  const filteredTasks = assignedTasks.filter(t => t.status === statusItem.status);
                  return (
                    <div key={statusItem.status} className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-xl border border-gray-700 h-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {statusItem.icon}
                          <h3 className="font-medium">{statusItem.label}</h3>
                        </div>
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                          {filteredTasks.length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {filteredTasks.slice(0, 3).map(task => (
                          <Link key={task.id} href={`/tasks/${task.id}`}>
                            <div className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition cursor-pointer border border-gray-700">
                              <p className="text-sm font-medium line-clamp-1">{task.title}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-gray-400">
                                  {projects.find(p => p.id === task.project_id)?.name || 'No Project'}
                                </p>
                                {task.due_date && (
                                  <span className="text-xs text-gray-500">
                                    {new Date(task.due_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                        {filteredTasks.length > 3 && (
                          <Link href={`/tasks?status=${statusItem.status}`}>
                            <p className="text-sm text-teal-400 hover:text-teal-300 mt-2 flex items-center gap-1">
                              +{filteredTasks.length - 3} more <ChevronRight className="h-3 w-3" />
                            </p>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-800/50 p-8 rounded-xl border border-dashed border-gray-700 text-center">
                <div className="bg-teal-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-teal-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No tasks assigned</h3>
                <p className="text-gray-400 mb-4">You currently don't have any tasks assigned to you</p>
                <Link
                  href="/tasks/new"
                  className="inline-flex items-center justify-center bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 hover:border-teal-500/50 text-teal-400 px-4 py-2 rounded-lg transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" /> Create Task
                </Link>
              </div>
            )}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Status Pie Chart */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-xl border border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Task Status Distribution</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem' }}
                      itemStyle={{ color: '#E5E7EB' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2 flex-wrap">
                {taskStatusData.map((status, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: status.color }} />
                    <span className="text-xs text-gray-400">{status.name}: {status.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines Bar Chart */}
            {projectDeadlines.length > 0 && (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-xl border border-gray-700">
                <h2 className="text-lg font-semibold mb-4">Upcoming Project Deadlines</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={projectDeadlines}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                      <XAxis type="number" stroke="#6B7280" />
                      <YAxis dataKey="name" type="category" stroke="#6B7280" width={80} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem' }}
                        itemStyle={{ color: '#E5E7EB' }}
                        formatter={(value) => [`${value} days`, 'Days Left']}
                      />
                      <Bar dataKey="daysLeft" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Recent Activity</h2>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-xl border border-gray-700">
              {activity.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-10 w-10 mx-auto text-gray-500" />
                  <p className="text-gray-400 mt-2">No recent activity</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {activity.map(item => (
                    <li key={item.id} className="border-b border-gray-700 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="bg-teal-500/10 p-2 rounded-full">
                          <MessageSquare className="h-5 w-5 text-teal-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="text-sm">
                              <span className="font-semibold">{item.commentor_name}</span> commented
                            </p>
                            <span className="text-gray-500 text-xs">
                              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mt-1 line-clamp-2 bg-gray-700/50 p-2 rounded">
                            {item.content}
                          </p>
                          <Link 
                            href={`/tasks/${item.task_id}`}
                            className="text-teal-400 text-xs hover:text-teal-300 mt-1 inline-flex items-center gap-1"
                          >
                            View Task <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}