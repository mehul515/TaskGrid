'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabaseClient'
import AuthGuard from '@/components/AuthGuard'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { MailOpen, Loader2, Mail } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('project_invitation')
          .select('*, projects(name, description, created_at)')
          .eq('email', user.email)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })

        if (error) throw error
        setInvitations(data || [])
      } catch (err) {
        console.error('Error fetching invitations:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchInvitations()
  }, [])

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-6 space-y-4">
            <div className="space-y-3">
              <Skeleton className="h-7 w-64 bg-gray-700" />
              <Skeleton className="h-4 w-80 bg-gray-700" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="w-sm bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700">
                  <CardHeader className="space-y-3 p-4 pb-2">
                    <Skeleton className="h-5 w-3/4 bg-gray-400/20" />
                    <Skeleton className="h-3 w-full bg-gray-700" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-48 bg-gray-700" />
                      <Skeleton className="h-3 w-40 bg-gray-700" />
                    </div>
                    <Skeleton className="h-8 w-full bg-gray-600/30 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-6">
            <div className="bg-gradient-to-br from-red-900/30 to-red-900/10 border border-red-800/50 p-6 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <MailOpen className="h-6 w-6 text-red-400" />
                <h2 className="text-xl font-bold text-red-400">Error loading invitations</h2>
              </div>
              <p className="text-gray-300 mb-6">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700"
              >
                Try Again
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <motion.div 
          className="p-6 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-300">
              Project Invitations
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {invitations.length === 0 
                ? "You don't have any pending invitations"
                : `${invitations.length} pending invitation${invitations.length !== 1 ? 's' : ''}`}
            </p>
          </motion.div>

          {invitations.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Mail className="h-8 w-8 text-gray-600 mb-3" />
              <h3 className="text-base font-medium text-gray-300">No pending invitations</h3>
              <p className="text-gray-500 text-xs mt-1">When you receive invitations, they'll appear here</p>
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {invitations.map((invitation, index) => (
                <motion.div
                  key={invitation.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + (index * 0.05) }}
                >
                  <Card className="gap-2 p-4 max-w-xs bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 hover:border-teal-500/50 transition-colors ">
                    <CardHeader className="px-0">
                      <CardTitle className="text-base text-cyan-300">{invitation.projects.name}</CardTitle>
                      {invitation.projects.description && (
                        <CardDescription className="text-sm text-gray-400">
                          {invitation.projects.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="justify-between items-start sm:items-center px-0 space-y-3">
                      <div className="text-sm space-y-0 text-gray-500">
                        <p>Invited on {format(new Date(invitation.created_at), 'MMM d, yyyy')}</p>
                        <p>Project created on {format(new Date(invitation.projects.created_at), 'MMM d, yyyy')}</p>
                      </div>
                      <Button 
                        asChild 
                        size="sm"
                        className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
                      >
                        <Link href={`/invitations/${invitation.id}`}>
                          <MailOpen className="h-3 w-3 mr-2" />
                          View
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </DashboardLayout>
    </AuthGuard>
  )
}