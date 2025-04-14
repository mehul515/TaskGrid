'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { MoreVertical, Trash2, Edit, Layout, Users, Calendar, Tag, Flag, ChevronRight, User, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AuthGuard from '@/components/AuthGuard'
import DashboardLayout from '@/components/layout/DashboardLayout'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProjectDetailPage() {
    const { id: projectId } = useParams()
    const router = useRouter()
    const [project, setProject] = useState(null)
    const [members, setMembers] = useState([])
    const [authUserId, setAuthUserId] = useState(null)
    const [inviteEmail, setInviteEmail] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        status: '',
        tags: [],
        deadline: ''
    })
    const [loading, setLoading] = useState(true)
    const [removeMemberDialog, setRemoveMemberDialog] = useState({
        open: false,
        memberId: null,
        memberName: ''
    })
    const [isRemovingMember, setIsRemovingMember] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const { data: authUser } = await supabase.auth.getUser()
                const currentUserId = authUser?.user?.id
                setAuthUserId(currentUserId)

                // Fetch members with their roles
                const { data: memberData, error: memberError } = await supabase
                    .from('project_members')
                    .select(`
                        *,
                        profiles:user_id (user_id, name, email)
                    `)
                    .eq('project_id', projectId)

                if (memberError) throw memberError

                const isMember = memberData.some(member => member.user_id === currentUserId)

                if (!isMember) {
                    toast.error('Access denied. You are not a member of this project.', {
                        icon: <AlertCircle className="text-red-400" />
                    })
                    router.push('/projects')
                    return
                }

                setMembers(memberData)

                const { data: projectData, error: projectError } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('id', projectId)
                    .single()

                if (projectError) throw projectError

                setProject(projectData)

                if (projectData) {
                    setEditForm({
                        name: projectData.name,
                        description: projectData.description,
                        status: projectData.status,
                        tags: projectData.tags || [],
                        deadline: projectData.deadline || ''
                    })
                }
            } catch (error) {
                toast.error(error.message, {
                    icon: <AlertCircle className="text-red-400" />
                })
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [projectId, router])

    const handleRemoveMember = async () => {
        if (!removeMemberDialog.memberId) return

        setIsRemovingMember(true)
        try {
            // Start a transaction
            const { error } = await supabase.rpc('remove_project_member', {
                member_id: removeMemberDialog.memberId,
                project_id: projectId,
                leader_id: authUserId
            })

            if (error) throw error

            // Refresh members list
            const { data: memberData, error: memberError } = await supabase
                .from('project_members')
                .select(`
                    *,
                    profiles:user_id (user_id, name, email)
                `)
                .eq('project_id', projectId)

            if (memberError) throw memberError

            setMembers(memberData)

            toast.success('Member removed successfully', {
                icon: <CheckCircle className="text-teal-400" />
            })
        } catch (error) {
            toast.error(error.message, {
                icon: <AlertCircle className="text-red-400" />
            })
        } finally {
            setIsRemovingMember(false)
            setRemoveMemberDialog({
                open: false,
                memberId: null,
                memberName: ''
            })
        }
    }

    const handleInvite = async () => {
        if (!inviteEmail.trim()) {
            toast.error('Please enter an email address', {
                icon: <AlertCircle className="text-red-400" />
            })
            return
        }

        try {
            const { data: user, error } = await supabase
                .from('profiles')
                .select('user_id, name, email')
                .eq('email', inviteEmail)
                .single()

            if (error || !user) throw new Error('User not found')

            const { data: existingInvite, error: inviteCheckError } = await supabase
                .from('project_invitation')
                .select('*')
                .eq('project_id', projectId)
                .eq('email', inviteEmail)
                .in('status', ['pending', 'accepted'])
                .maybeSingle()

            if (inviteCheckError) throw inviteCheckError

            if (existingInvite) {
                toast.info('An invitation has already been sent to this email.', {
                    icon: <AlertCircle className="text-blue-400" />
                })
                return
            }

            const { data: authUser } = await supabase.auth.getUser()

            const { error: inviteError } = await supabase.from('project_invitation').insert({
                project_id: projectId,
                email: inviteEmail,
                invited_by: authUser.user.id,
                status: 'pending'
            })

            if (inviteError) throw inviteError

            toast.success('Invitation sent successfully!', {
                icon: <CheckCircle className="text-teal-400" />
            })
            setDialogOpen(false)
            setInviteEmail('')
        } catch (error) {
            toast.error(error.message, {
                icon: <AlertCircle className="text-red-400" />
            })
        }
    }

    const handleDeleteProject = async () => {
        setIsDeleting(true)
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId)

            if (error) throw error

            toast.success('Project deleted successfully', {
                icon: <CheckCircle className="text-teal-400" />
            })
            router.push('/projects')
        } catch (error) {
            console.log(error)
            toast.error(error.message, {
                icon: <AlertCircle className="text-red-400" />
            })
        } finally {
            setIsDeleting(false)
            setDeleteDialogOpen(false)
        }
    }

    const handleNavigateToBoard = () => {
        router.push(`/projects/${projectId}/board`)
    }

    const handleEditProject = async () => {
        try {
            const { error } = await supabase
                .from('projects')
                .update(editForm)
                .eq('id', projectId)

            if (error) throw error

            toast.success('Project updated successfully', {
                icon: <CheckCircle className="text-teal-400" />
            })
            setProject(prev => ({ ...prev, ...editForm }))
            setEditDialogOpen(false)
        } catch (error) {
            toast.error(error.message, {
                icon: <AlertCircle className="text-red-400" />
            })
        }
    }

    const handleTagsChange = (e) => {
        const tags = e.target.value.split(',').map(tag => tag.trim())
        setEditForm(prev => ({ ...prev, tags }))
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-teal-500/10 text-teal-400 border-teal-500/20'
            case 'on-hold':
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            case 'completed':
                return 'bg-green-500/10 text-green-400 border-green-500/20'
            case 'archived':
                return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
            default:
                return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
        }
    }

    if (loading) {
        return (
            <AuthGuard>
                <DashboardLayout>
                    <div className="p-6 max-w-4xl mx-auto space-y-8">
                        {/* Project Header Skeleton */}
                        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-4 w-full">
                                    <Skeleton className="h-8 w-1/3 bg-gray-700" />
                                    <Skeleton className="h-4 w-2/3 bg-gray-700" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-6 w-16 bg-gray-700" />
                                        <Skeleton className="h-6 w-16 bg-gray-700" />
                                    </div>
                                </div>
                                <Skeleton className="h-8 w-8 bg-gray-700" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                                        <Skeleton className="h-4 w-1/2 bg-gray-700 mb-2" />
                                        <Skeleton className="h-5 w-3/4 bg-gray-700" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Team Members Skeleton */}
                        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <Skeleton className="h-6 w-1/4 bg-gray-700" />
                                <Skeleton className="h-8 w-24 bg-gray-700" />
                            </div>
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
                                            <Skeleton className="h-4 w-32 bg-gray-700" />
                                        </div>
                                        <Skeleton className="h-4 w-4 bg-gray-700" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </DashboardLayout>
            </AuthGuard>
        )
    }

    if (!project) {
        return (
            <AuthGuard>
                <DashboardLayout>
                    <div className="p-6 max-w-4xl mx-auto text-center">
                        <p className="text-gray-400">Project not found</p>
                    </div>
                </DashboardLayout>
            </AuthGuard>
        )
    }

    const isLeader = authUserId === project.user_id

    return (
        <AuthGuard>
            <DashboardLayout>
                <div className="p-6 max-w-4xl mx-auto space-y-8">
                    {/* Project Header */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                                    {project.name}
                                </h1>
                                <p className="text-gray-400 mt-2">{project.description}</p>

                                <div className="flex flex-wrap gap-2 mt-4">
                                    {project.tags?.map((tag, index) => (
                                        <Badge
                                            key={index}
                                            variant="outline"
                                            className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-teal-500/20 text-teal-300"
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="hover:bg-gray-700">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-gray-800 border-gray-700">
                                    <DropdownMenuItem
                                        onClick={handleNavigateToBoard}
                                        className="hover:bg-gray-700 focus:bg-gray-700"
                                    >
                                        <Layout className="mr-2 h-4 w-4" />
                                        Go to Board
                                    </DropdownMenuItem>
                                    {isLeader && (
                                        <>
                                            <DropdownMenuItem
                                                onClick={() => setEditDialogOpen(true)}
                                                className="hover:bg-gray-700 focus:bg-gray-700"
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Project
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setDeleteDialogOpen(true)}
                                                className="text-red-400 hover:bg-red-900/20 focus:bg-red-900/20"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Project
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-lg border border-gray-700 shadow-sm">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Flag className="h-4 w-4" />
                                    <span className="text-xs font-medium">Status</span>
                                </div>
                                <Badge
                                    className={`mt-2 ${getStatusColor(project.status)}`}
                                >
                                    {project.status}
                                </Badge>
                            </div>
                            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-lg border border-gray-700 shadow-sm">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <User className="h-4 w-4" />
                                    <span className="text-xs font-medium">Leader</span>
                                </div>
                                <p className="mt-2 text-white">{project.leader_name}</p>
                            </div>
                            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-lg border border-gray-700 shadow-sm">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-xs font-medium">Created</span>
                                </div>
                                <p className="mt-2 text-white">
                                    {format(new Date(project.created_at), 'MMM dd, yyyy')}
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-lg border border-gray-700 shadow-sm">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-xs font-medium">Deadline</span>
                                </div>
                                <p className="mt-2 text-white">
                                    {project.deadline ? format(new Date(project.deadline), 'MMM dd, yyyy') : 'No deadline'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Edit Project Dialog */}
                    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                        <DialogContent className="bg-gray-900 border-gray-700 rounded-xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                                    Edit Project
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="flex items-center gap-2 text-gray-300">
                                        <Edit className="h-4 w-4 text-teal-400" />
                                        <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                                            Project Name
                                        </span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="bg-gray-800 border-gray-700 text-white focus:border-teal-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="flex items-center gap-2 text-gray-300">
                                        <Edit className="h-4 w-4 text-teal-400" />
                                        <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                                            Description
                                        </span>
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        className="bg-gray-800 border-gray-700 text-white focus:border-teal-500 min-h-[100px]"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="status" className="flex items-center gap-2 text-gray-300">
                                            <Flag className="h-4 w-4 text-teal-400" />
                                            <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                                                Status
                                            </span>
                                        </Label>
                                        <Select
                                            value={editForm.status}
                                            onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                                        >
                                            <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-teal-500">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                                <SelectItem value="active" className="hover:bg-gray-700">Active</SelectItem>
                                                <SelectItem value="on-hold" className="hover:bg-gray-700">On Hold</SelectItem>
                                                <SelectItem value="completed" className="hover:bg-gray-700">Completed</SelectItem>
                                                <SelectItem value="archived" className="hover:bg-gray-700">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="deadline" className="flex items-center gap-2 text-gray-300">
                                            <Calendar className="h-4 w-4 text-teal-400" />
                                            <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                                                Deadline
                                            </span>
                                        </Label>
                                        <Input
                                            id="deadline"
                                            type="date"
                                            value={editForm.deadline ? editForm.deadline.split('T')[0] : ''}
                                            onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                                            className="bg-gray-800 border-gray-700 text-white focus:border-teal-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tags" className="flex items-center gap-2 text-gray-300">
                                        <Tag className="h-4 w-4 text-teal-400" />
                                        <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                                            Tags
                                        </span>
                                    </Label>
                                    <Input
                                        id="tags"
                                        value={editForm.tags.join(', ')}
                                        onChange={handleTagsChange}
                                        className="bg-gray-800 border-gray-700 text-white focus:border-teal-500"
                                        placeholder="design, development, marketing"
                                    />
                                    <p className="text-xs text-gray-500">Separate tags with commas</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleEditProject}
                                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                                >
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Delete Project Dialog */}
                    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <AlertDialogContent className="bg-gray-900 border-gray-700">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-red-400">Delete Project</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                    Are you sure you want to delete this project? This action cannot be undone and all project data will be permanently removed.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="border-gray-700 hover:bg-gray-800">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeleteProject}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete Project'
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Team Members Section */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Users className="h-5 w-5 text-teal-400" />
                                <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                                    Team Members
                                </span>
                            </h2>
                            {isLeader && (
                                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            size="sm"
                                            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                                        >
                                            + Invite Member
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-gray-900 border-gray-700 rounded-xl">
                                        <DialogHeader>
                                            <DialogTitle className="text-lg font-bold bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                                                Invite by Email
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-gray-300">
                                                    <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                                                        Email Address
                                                    </span>
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={inviteEmail}
                                                    onChange={(e) => setInviteEmail(e.target.value)}
                                                    className="bg-gray-800 border-gray-700 text-white focus:border-teal-500"
                                                    placeholder="user@example.com"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleInvite}
                                                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                                            >
                                                Send Invitation
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>

                        {members.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="h-10 w-10 mx-auto text-gray-500" />
                                <p className="text-gray-400 mt-2">No team members yet</p>
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {members.map((m) => (
                                    <li
                                    key={m.user_id}
                                    className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/50 transition"
                                  >
                                  
                                        <div className="flex items-center gap-3">
                                            <div className="bg-teal-500/10 p-2 rounded-full">
                                                <User className="h-4 w-4 text-teal-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-white">{m.profiles?.name || m.member_name}</p>
                                                    {m.user_id === project.user_id ? (
                                                        <Badge variant="outline" className="text-xs bg-teal-500/10 border-teal-500/20 text-teal-400">
                                                            Leader
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-xs bg-purple-500/10 border-purple-500/20 text-purple-400">
                                                            {m.profiles?.role || 'Member'}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">{m.profiles?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isLeader && m.user_id !== project.user_id && (
                                                <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-500 border-red-500 hover:bg-red-500/10 ml-auto"
                                                onClick={() =>
                                                  setRemoveMemberDialog({
                                                    open: true,
                                                    memberId: m.user_id,
                                                    memberName: m.profiles?.name || m.member_name,
                                                  })
                                                }
                                              >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Remove
                                              </Button>
                                              
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Remove Member Dialog */}
                    <AlertDialog open={removeMemberDialog.open} onOpenChange={(open) => setRemoveMemberDialog(prev => ({ ...prev, open }))}>
                        <AlertDialogContent className="bg-gray-900 border-gray-700">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-red-400">Remove Team Member</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                    Are you sure you want to remove {removeMemberDialog.memberName} from this project?
                                    This will:
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        <li>Delete all their comments</li>
                                        <li>Remove any pending invitations</li>
                                        <li>Reassign their tasks to you (project leader)</li>
                                    </ul>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="border-gray-700 hover:bg-gray-800">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleRemoveMember}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={isRemovingMember}
                                >
                                    {isRemovingMember ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Removing...
                                        </>
                                    ) : (
                                        'Remove Member'
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </DashboardLayout>
        </AuthGuard>
    )
}