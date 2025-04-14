'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, CheckCircle, Folder, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TasksPage() {
  const [userId, setUserId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projectsMap, setProjectsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const session = await supabase.auth.getSession();
      const uid = session.data?.session?.user?.id;
      setUserId(uid);

      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', uid)
        .not('status', 'eq', 'done')
        .order('created_at', { ascending: false });

      if (taskError) {
        console.error('Failed to fetch tasks:', taskError.message);
        setLoading(false);
        return;
      }

      setTasks(taskData);

      const projectIds = [...new Set(taskData.map(task => task.project_id))];
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name')
        .in('id', projectIds);

      if (projectsError) {
        console.error('Failed to fetch projects:', projectsError.message);
      } else {
        const map = {};
        projects.forEach(p => map[p.id] = p.name);
        setProjectsMap(map);
      }

      setLoading(false);
    };

    fetchTasks();
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Skeleton loader component
  const TaskSkeleton = () => (
    <div className="bg-gray-900/80 p-5 rounded-xl border border-gray-800 h-full">
      <div className="animate-pulse space-y-3">
        <div className="flex justify-between">
          <div className="h-5 bg-gray-800 rounded w-3/4"></div>
          <div className="h-5 bg-gray-800 rounded w-16"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-800 rounded w-full"></div>
          <div className="h-4 bg-gray-800 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6 text-gray-100 bg-gray-950 min-h-screen">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">
              Your Tasks
            </h1>
          </motion.div>

          {loading ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {[...Array(6)].map((_, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                >
                  <TaskSkeleton />
                </motion.div>
              ))}
            </motion.div>
          ) : tasks.length === 0 ? (
            <motion.div
              className="bg-gradient-to-br from-gray-900 to-gray-900/50 p-8 rounded-xl border border-gray-800 max-w-2xl mx-auto text-center"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 p-4 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-teal-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">All caught up!</h3>
              <p className="text-gray-400 mb-6">
                You have no pending tasks. Enjoy your free time or explore new projects.
              </p>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-medium transition-all"
              >
                Browse Projects
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  variants={fadeInUp}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={`/tasks/${task.id}`}
                    className="block group relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-900/80 hover:from-gray-800/70 hover:to-gray-800/50 duration-300 p-5 rounded-xl border border-gray-800 hover:border-teal-500/30 transition-all cursor-pointer h-full"
                  >
                    <div className="absolute inset-0 transition-opacity duration-300"></div>
                    <div className="relative z-10 space-y-3">
                      <div className="flex justify-between items-start">
                        <h2 className="text-lg font-semibold text-white line-clamp-2">
                          {task.title}
                        </h2>
                        <Badge
                          className={`capitalize ${task.status === 'in-progress'
                            ? 'bg-teal-500/20 text-teal-400 border-teal-500/30'
                            : task.status === 'todo'
                              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                              : 'bg-gray-700 text-gray-300 border-gray-600'
                            }`}
                        >
                          {task.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-400 space-y-2">
                        <div className="flex items-center gap-2">
                          <Folder className="w-4 h-4 opacity-70" />
                          <span className="text-teal-300">{projectsMap[task.project_id] || 'Unknown Project'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 opacity-70" />
                          <span className={task.due_date ? 'text-cyan-300' : 'text-gray-500'}>
                            {task.due_date || 'No deadline'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}