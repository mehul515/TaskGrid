'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function UpdatePassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if this is a password recovery request
    const checkRecovery = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      // If no session and no access token in URL, redirect to login
      if (!data.session && !searchParams.get('access_token')) {
        router.push('/auth/login');
      }
    };

    checkRecovery();
  }, [router, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
  
    try {
      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
  
      if (updateError) {
        throw updateError;
      }
  
      // Sign out the user after password update
      const { error: signOutError } = await supabase.auth.signOut();
  
      if (signOutError) {
        throw signOutError;
      }
  
      toast.success('Password updated successfully!', {
        description: 'Please login with your new password',
        icon: <CheckCircle className="text-teal-400" />,
      });
      
      // Redirect to login after successful password update
      router.push('/auth/login');
    } catch (error) {
      toast.error('Password update failed', {
        description: error.message,
        icon: <AlertCircle className="text-red-400" />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.15),transparent_70%)]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative w-full max-w-md bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-800 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 z-0"></div>
        
        <div className="relative z-10 p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-md flex items-center justify-center">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">TaskGrid</span>
            </div>
            <h2 className="text-2xl font-bold text-white text-center">
              Set a new password
            </h2>
            <p className="text-gray-400 text-center mt-2">
              Create a strong password to secure your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white focus:border-teal-500 focus:ring-teal-500/50 pl-10 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white focus:border-teal-500 focus:ring-teal-500/50 pl-10 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button 
                type="submit" 
                className="cursor-pointer relative group px-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-[0_0_10px_rgba(20,184,166,0.3)] transition-all duration-300"
                disabled={loading}
              >
                <span className="relative z-10">
                  {loading ? 'Updating...' : 'Update Password'}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></span>
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <Link 
              href="/auth/login" 
              className="text-sm text-teal-400 hover:text-teal-300 hover:underline transition-colors"
            >
              Return to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}