'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle, ArrowRight, Layers } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      } else {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error('Login failed', {
        description: error.message,
        icon: <AlertCircle className="text-red-400" />,
      });
      setLoading(false);
      return;
    }

    toast.success('Login successful!', {
      description: 'Redirecting to dashboard...',
      icon: <CheckCircle className="text-teal-400" />,
    });

    router.push('/dashboard');
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-md flex items-center justify-center">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">TaskGrid</span>
        </div>
      </div>
    );
  }

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
                <Layers className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">TaskGrid</span>
            </div>
            <h2 className="text-2xl font-bold text-white text-center">Welcome back</h2>
            <p className="text-gray-400 text-center mt-2">Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white focus:border-teal-500 focus:ring-teal-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white focus:border-teal-500 focus:ring-teal-500/50"
              />
            </div>
            
            <div className="flex justify-center">
              <Button 
                type="submit" 
                className="cursor-pointer relative group px-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-[0_0_10px_rgba(20,184,166,0.3)] transition-all duration-300"
                disabled={loading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? 'Logging in...' : 'Login'}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></span>
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Don&apos;t have an account?{' '}
              <Link 
                href="/auth/signup" 
                className="text-teal-400 hover:text-teal-300 hover:underline transition-colors"
              >
                Sign up
              </Link>
            </p>
            <Link 
              href="/auth/forgot-password" 
              className="inline-block mt-4 text-sm text-gray-400 hover:text-teal-400 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}