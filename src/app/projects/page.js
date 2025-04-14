'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, CheckCircle, AlertCircle, ChevronRight, Calendar, Users, Tag, Flag } from 'lucide-react';
import Link from 'next/link';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    deadline: '',
    tags: '',
    status: 'active',
  });

  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const { data: session } = await supabase.auth.getSession();
        const uid = session.session?.user?.id;
        const name = session.session?.user?.user_metadata?.name || session.session?.user?.email;
        setUserId(uid);
        setUserName(name);

        // Fetch all projects where user is a member
        const { data: membershipData, error: membershipError } = await supabase
          .from('project_members')
          .select('project_id')
          .eq('user_id', uid);

        if (membershipError) throw membershipError;

        const projectIds = membershipData.map((m) => m.project_id);

        if (projectIds.length === 0) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .in('id', projectIds)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setProjects(data);
      } catch (error) {
        toast.error('Failed to fetch projects', {
          description: error.message,
          icon: <AlertCircle className="text-red-400" />,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const createProject = async () => {
    if (!form.name.trim()) {
      toast.error('Project name is required', {
        icon: <AlertCircle className="text-red-400" />,
      });
      return;
    }

    try {
      const session = await supabase.auth.getSession();
      const user = session.data?.session?.user;

      const { data: newProject, error } = await supabase
        .from('projects')
        .insert({
          name: form.name,
          description: form.description,
          user_id: userId,
          leader_name: userName,
          deadline: form.deadline || null,
          tags: form.tags ? form.tags.split(',').map(tag => tag.trim()) : [],
          status: form.status,
        })
        .select()
        .single();

      if (error) throw error;

      // Add the creator to project_members table as leader
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: newProject.id,
          user_id: user.id,
          role: 'leader',
          member_name: userName,
          member_email: user.email,
        });

      if (memberError) throw memberError;

      toast.success('Project created successfully', {
        icon: <CheckCircle className="text-teal-400" />,
      });

      setProjects((prev) => [newProject, ...prev]);
      setForm({ name: '', description: '', deadline: '', tags: '', status: 'active' });
      setOpen(false);
    } catch (error) {
      toast.error('Failed to create project', {
        description: error.message,
        icon: <AlertCircle className="text-red-400" />,
      });
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                Your Projects
              </h1>
              <p className="text-gray-400">Manage and organize your team's work</p>
            </div>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="flex gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                  <Plus size={18} /> New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 text-white rounded-xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Project Name</label>
                    <Input
                      placeholder="e.g. Website Redesign"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="bg-gray-800 border-gray-700 focus:border-teal-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Description</label>
                    <Textarea
                      placeholder="Briefly describe your project..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="bg-gray-800 border-gray-700 focus:border-teal-500 min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Deadline
                      </label>
                      <Input
                        type="date"
                        value={form.deadline}
                        onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                        className="bg-gray-800 border-gray-700 focus:border-teal-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <Tag className="h-4 w-4" /> Status
                      </label>
                      <select
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-teal-500 focus:ring-teal-500"
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                      >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Flag className="h-4 w-4" /> Tags
                    </label>
                    <Input
                      placeholder="design, development, marketing"
                      value={form.tags}
                      onChange={(e) => setForm({ ...form, tags: e.target.value })}
                      className="bg-gray-800 border-gray-700 focus:border-teal-500"
                    />
                    <p className="text-xs text-gray-500">Separate tags with commas</p>
                  </div>

                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                    onClick={createProject}
                  >
                    Create Project
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-800/50 rounded-xl p-6 h-48 animate-pulse"></div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-gray-800/50 p-8 rounded-xl border border-dashed border-gray-700 text-center">
              <div className="bg-teal-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="h-6 w-6 text-teal-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
              <p className="text-gray-400 mb-4">Get started by creating your first project</p>
              <Button
                onClick={() => setOpen(true)}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-[0_0_15px_rgba(20,184,166,0.3)]"
              >
                <Plus className="h-4 w-4 mr-2" /> Create Project
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 hover:border-teal-500/50 transition-all cursor-pointer h-full p-6 group">
                    <div className="flex justify-between items-start">
                      <h2 className="font-semibold text-lg group-hover:text-teal-400 transition-colors">
                        {project.name}
                      </h2>
                      {project.deadline && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          new Date(project.deadline) < new Date() 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {new Date(project.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                      {project.description || 'No description'}
                    </p>
                    
                    <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-xs text-gray-500">
                          Leader: <span className="text-white">{project.leader_name || 'N/A'}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                          {project.status === 'active' ? 'Active' : 
                           project.status === 'completed' ? 'Completed' : 'Archived'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Created: {new Date(project.created_at).toLocaleDateString()}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-teal-400 transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}