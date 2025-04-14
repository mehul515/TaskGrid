'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import AuthGuard from '@/components/AuthGuard'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Mail, User, Clock, Check, X, AlertTriangle } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { format } from 'date-fns'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function InvitationPage() {
  const router = useRouter()
  const params = useParams()
  const invitationId = Array.isArray(params.id) ? params.id[0] : params.id
  const [invitation, setInvitation] = useState(null)
  const [project, setProject] = useState(null)
  const [inviter, setInviter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [showDeclineDialog, setShowDeclineDialog] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: inv, error } = await supabase
        .from('project_invitation')
        .select('*, projects(*)')
        .eq('id', invitationId)
        .single()

      if (error || !inv) {
        toast.error('Invitation not found or expired')
        router.push('/invitations')
        return
      }

      setInvitation(inv)
      setProject(inv.projects)

      const { data: inviterProfile } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .eq('user_id', inv.invited_by)
        .single()

      setInviter(inviterProfile)
      setLoading(false)
    }

    if (invitationId) fetchData()
  }, [invitationId, router])

  const handleAccept = async () => {
    setProcessing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/login?redirect=/invitations/${invitationId}`)
        return
      }

      if (user.email !== invitation.email) {
        toast.error('This invitation is for a different email address')
        return
      }

      const { data: existingMember, error: memberCheckError } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', invitation.project_id)
        .eq('user_id', user.id)
        .single()

      if (memberCheckError && memberCheckError.code !== 'PGRST116') {
        throw memberCheckError
      }

      if (existingMember) {
        toast.error('You are already a member of this project')
        return
      }

      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: invitation.project_id,
          user_id: user.id,
          role: 'member',
          member_name: user.user_metadata?.name || user.email.split('@')[0],
          member_email: user.email,
          added_at: new Date().toISOString()
        })

      if (memberError) throw memberError

      const { error: inviteError } = await supabase
        .from('project_invitation')
        .update({ status: 'accepted' })
        .eq('id', invitationId)

      if (inviteError) throw inviteError

      toast.success(`You've joined ${project.name}!`)
      router.push(`/projects/${invitation.project_id}`)
    } catch (error) {
      console.error('Accept error:', error)
      toast.error('Failed to accept invitation')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    setProcessing(true)
    try {
      const { error } = await supabase
        .from('project_invitation')
        .update({ status: 'rejected' })
        .eq('id', invitationId)

      if (error) throw error

      toast.success('Invitation declined')
      router.push('/invitations')
    } catch (error) {
      console.error('Reject error:', error)
      toast.error('Failed to decline invitation')
    } finally {
      setProcessing(false)
      setShowDeclineDialog(false)
    }
  }

  if (loading) return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-8 bg-gray-900 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="bg-gray-800 rounded-full p-3">
            <div className="h-6 w-6 bg-gray-700 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-800 rounded-md" />
            <div className="h-4 w-64 bg-gray-800 rounded-md" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-8 w-3/5 bg-gray-800 rounded-md" />
            <div className="h-4 w-full bg-gray-800 rounded-md" />
            <div className="h-4 w-4/5 bg-gray-800 rounded-md" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg h-24" />
            <div className="bg-gray-800 p-4 rounded-lg h-24" />
          </div>

          <div className="bg-gray-800 p-4 rounded-lg h-24" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <div className="w-full sm:w-40 h-12 bg-gray-800 rounded-md" />
          <div className="w-full sm:w-40 h-12 bg-gray-800 rounded-md" />
        </div>
      </div>
    </DashboardLayout>
  )

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6 max-w-3xl mx-auto space-y-8 bg-gray-900 rounded-lg">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="bg-teal-500/20 rounded-full p-3 border border-teal-500/50">
              <Mail className="h-6 w-6 text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">Project Invitation</h1>
              <p className="text-gray-400">You've been invited to collaborate</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Project Info */}
            <div className="space-y-3">
              <h2 className="text-xl font-medium text-white">{project?.name}</h2>
              <p className="text-gray-400">{project?.description}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Inviter */}
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-teal-500 transition-colors">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Invited by</h3>
                <div className="flex items-center gap-3">
                  <Avatar 
                    src={null} 
                    name={inviter?.name}
                    size="md"
                    className="border border-teal-500/50"
                  />
                  <div>
                    <span className="text-white block">{inviter?.name || 'Team member'}</span>
                    <span className="text-gray-400 text-sm">{inviter?.email}</span>
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-teal-500 transition-colors">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Invited on</h3>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-white">
                    {format(new Date(invitation?.created_at), 'MMMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>

            {/* Role */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-teal-500 transition-colors">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Your role</h3>
              <div className="flex items-center gap-3">
                <div className="bg-teal-500/10 text-teal-400 px-3 py-1 rounded-md text-sm font-medium border border-teal-500/50">
                  Member
                </div>
                <span className="text-gray-400 text-sm">
                  Can view and edit project content
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeclineDialog(true)}
              disabled={processing}
              className="w-full sm:w-40 bg-transparent border-red-500/50 hover:bg-red-500/10 text-red-400 hover:text-red-300"
            >
              <X className="h-5 w-5 mr-2" />
              Decline
            </Button>
            <Button
              onClick={handleAccept}
              disabled={processing}
              className="w-full sm:w-40 bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-[0_0_15px_rgba(20,184,166,0.5)]"
            >
              <Check className="h-5 w-5 mr-2" />
              Accept
            </Button>
          </div>
        </div>

        {/* Decline Confirmation Dialog */}
        <AlertDialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
          <AlertDialogContent className="bg-gray-800 border-gray-700">
            <AlertDialogHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <AlertDialogTitle className="text-white">Decline Invitation?</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-gray-400">
                Are you sure you want to decline this invitation to join {project?.name}? 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-gray-600 hover:bg-gray-700 text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleReject}
                className="bg-red-500 hover:bg-red-600 text-white"
                disabled={processing}
              >
                {processing ? 'Declining...' : 'Decline Invitation'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </AuthGuard>
  )
}