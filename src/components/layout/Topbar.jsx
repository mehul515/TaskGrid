"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, LogOut, Edit2, X, Check, Mail } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { motion } from "framer-motion"

const Topbar = () => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({ name: "", email: "" })
  const [editedName, setEditedName] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", data.user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        } else if (data.user.user_metadata?.name) {
          setProfile({
            name: data.user.user_metadata.name,
            email: data.user.email || "",
          })
        } else {
          setProfile({
            name: "",
            email: data.user.email || "",
          })
        }
      }
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const handleOpenDialog = () => {
    setEditedName(profile.name)
    setIsOpen(true)
  }

  const handleSave = async () => {
    if (!user) return

    await supabase.auth.updateUser({
      data: { name: editedName },
    })

    await supabase.from("profiles").update({ name: editedName }).eq("user_id", user.id)

    setProfile((prev) => ({ ...prev, name: editedName }))
    setIsEditing(false)
    setIsOpen(false)
  }

  return (
    <header className="bg-gray-900 backdrop-blur-sm border-b border-gray-800 py-4.5 px-6 md:pl-72">
      <div className="flex items-center justify-end gap-4">
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 focus:outline-none group cursor-pointer"
          onClick={handleOpenDialog}
        >
          <div className="h-9 w-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-white font-medium group-hover:border-teal-400 transition-colors">
            {profile.name?.charAt(0)?.toUpperCase() || (
              <User className="h-4 w-4 text-gray-400 group-hover:text-teal-400 transition-colors" />
            )}
          </div>
          <span className="text-gray-300 text-sm font-medium hidden md:block">
          {profile.name || "Welcome"}
        </span>
        </motion.button>
      </div>

      <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); setIsEditing(false) }}>
        <DialogContent className="sm:max-w-md bg-gray-900 border border-gray-700 rounded-lg p-0 overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 opacity-90"></div>
            
            <div className="relative z-10">
              <DialogHeader className="px-6 pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-700 border-2 border-teal-400 flex items-center justify-center text-white text-xl font-bold">
                    {profile.name?.charAt(0)?.toUpperCase() || (
                      <User className="h-6 w-6 text-teal-400" />
                    )}
                  </div>
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="bg-gray-800 border-b border-teal-400 text-white text-lg font-semibold px-1 py-1 focus:outline-none"
                      />
                    ) : (
                      <DialogTitle className="text-white text-lg font-semibold">
                        {profile.name || "Your Profile"}
                      </DialogTitle>
                    )}
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {profile.email}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="px-6 py-4 border-t border-gray-800 mt-4">
                <div className="flex items-center justify-between py-2">
                  <div className="text-gray-400 text-sm">Account Status</div>
                  <div className="text-teal-400 text-sm font-medium">Active</div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="text-gray-400 text-sm">Member Since</div>
                  <div className="text-gray-300 text-sm">
                    {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <DialogFooter className="px-6 py-4 bg-gray-800/50 border-t border-gray-800 flex justify-between">
                {!isEditing ? (
                  <>
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="bg-gray-800 text-teal-400 hover:bg-gray-700 border border-gray-700 hover:border-teal-400/50 cursor-pointer"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button 
                      onClick={handleLogout}
                      className="bg-gray-800 text-red-400 hover:bg-gray-700 border border-gray-700 hover:border-red-400/50 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      onClick={() => {
                        setEditedName(profile.name)
                        setIsEditing(false)
                      }}
                      className="bg-gray-800 text-red-400 hover:bg-gray-700 border border-gray-700 hover:border-red-400/50 cursor-pointer"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Discard
                    </Button>
                    <Button 
                      onClick={handleSave}
                      className="bg-gray-800 text-teal-400 hover:bg-gray-700 border border-gray-700 hover:border-teal-400/50 cursor-pointer"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Save Profile
                    </Button>
                  </>
                )}
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )


}

export default Topbar