'use client';

import { useState, useEffect, useMemo } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, Check, ArrowRight, Sparkles, Users, TrendingUp, Target, Award } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { FloatingShapes, MeshGradient, ParticleBackground, FloatingNotificationCards } from '@/components/effects/FloatingShapes';
import { FadeIn, AnimatedCounter, Typewriter } from '@/components/ui/animations';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [liveUserCount, setLiveUserCount] = useState(1247);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Simulate live user count
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUserCount(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = () => {
    router.push('/dashboard');
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setIsLoading(false);
        return;
      }

      handleLoginSuccess();
    } catch {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  // Animated feature cards for left panel
  const featureCards = useMemo(() => [
    { icon: Target, label: 'Smart Task Management', color: 'text-green-500' },
    { icon: TrendingUp, label: 'Analytics & Insights', color: 'text-purple-500' },
    { icon: Award, label: 'Gamification', color: 'text-yellow-500' },
  ], []);

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Animated Background - Hidden on mobile and tablet */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-3/5 xl:w-3/5 bg-gradient-to-br from-[#1A56DB] via-[#3B82F6] to-[#1A56DB] relative overflow-hidden"
      >
        {/* Background Effects */}
        <MeshGradient />
        <FloatingShapes count={8} minSize={100} maxSize={250} />
        <ParticleBackground count={30} color="#ffffff" />
        <FloatingNotificationCards className="z-0" />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-start p-8 lg:p-10 xl:p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div 
              className="flex items-center gap-3 mb-6"
              whileHover={{ scale: 1.02 }}
            >
              <Image 
                src="/logo.png" 
                alt="HeronPulse Logo" 
                width={48} 
                height={48}
                className="h-10 w-auto lg:h-12"
              />
              <span className="text-2xl lg:text-3xl font-bold">HeronPulse</span>
            </motion.div>
            
            {/* Animated Heading with Typewriter */}
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 leading-tight">
              Your Academic<br />
              <span className="text-white/90">
                <Typewriter text="Workflow, Elevated." speed={80} />
              </span>
            </h1>
            
            <p className="text-base lg:text-lg xl:text-xl text-white/80 max-w-md">
              A production-ready Academic Work Operating System for the College of Computing and Information Sciences at University of Makati.
            </p>
          </motion.div>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 lg:mt-12 flex gap-4 lg:gap-6"
          >
            {[
              { value: liveUserCount, label: 'Active Students', icon: Users },
              { value: 156, label: 'Courses', icon: TrendingUp },
              { value: 89, label: 'Tasks Today', icon: Target, suffix: '+' },
            ].map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                whileHover={{ scale: 1.05, y: -4 }}
              >
                <div className="flex items-center justify-center gap-1 text-2xl lg:text-3xl xl:text-4xl font-bold">
                  <stat.icon className="h-5 w-5 lg:h-6 lg:w-6 text-white/60" />
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={1500} />
                </div>
                <div className="text-sm lg:text-base text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Floating Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="absolute bottom-8 left-8 right-8 hidden xl:flex gap-4"
          >
            {featureCards.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 cursor-pointer"
                >
                  <Icon className={`h-5 w-5 ${feature.color}`} />
                  <span className="text-sm font-medium">{feature.label}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
      </motion.div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background min-h-screen relative">
        <div className="absolute top-4 right-4">
          <ThemeSwitcher />
        </div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm sm:max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 sm:gap-3 justify-center mb-6 sm:mb-8">
            <motion.div
              whileHover={{ scale: 1.1 }}
            >
              <Image 
                src="/logo.png" 
                alt="HeronPulse Logo" 
                width={40} 
                height={40}
                className="h-8 w-auto sm:h-10 logo-adaptive"
              />
            </motion.div>
            <span className="text-xl sm:text-2xl font-bold">HeronPulse</span>
          </div>

          <Card className="border-0 shadow-xl sm:shadow-2xl glass-card overflow-hidden">
            {/* Card Header with gradient */}
            <div className="h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
            
            <CardHeader className="text-center px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-4">
              <FadeIn delay={0.1}>
                <CardTitle className="text-xl sm:text-2xl font-bold">Welcome back</CardTitle>
              </FadeIn>
              <FadeIn delay={0.2}>
                <CardDescription className="text-sm sm:text-base">
                  Sign in to your account to continue
                </CardDescription>
              </FadeIn>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <FadeIn delay={0.3}>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 transition-colors ${focusedField === 'email' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@umak.edu.ph"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className="pl-10 sm:pl-11 h-11 sm:h-12 text-base transition-all focus:ring-2 focus:ring-primary/20"
                        required
                        disabled={isLoading || isGoogleLoading}
                      />
                    </div>
                  </div>
                </FadeIn>
                
                <FadeIn delay={0.4}>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
                    <div className="relative">
                      <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 transition-colors ${focusedField === 'password' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className="pl-10 sm:pl-11 pr-10 h-11 sm:h-12 text-base transition-all focus:ring-2 focus:ring-primary/20"
                        required
                        disabled={isLoading || isGoogleLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <AnimatePresence mode="wait">
                          {showPassword ? (
                            <motion.div
                              key="eye-off"
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 90 }}
                            >
                              <EyeOff className="h-4 w-4" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="eye"
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 90 }}
                            >
                              <Eye className="h-4 w-4" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                    </div>
                  </div>
                </FadeIn>

                <FadeIn delay={0.5}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="remember" 
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                        Remember me
                      </Label>
                    </div>
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline underline-offset-4 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                </FadeIn>
                
                <FadeIn delay={0.6}>
                  <Button 
                    type="submit" 
                    className="w-full h-11 sm:h-12 text-base font-medium relative overflow-hidden group" 
                    disabled={isLoading || isGoogleLoading}
                  >
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </FadeIn>
              </form>

              {/* Divider */}
              <FadeIn delay={0.7}>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
              </FadeIn>

              {/* Google Sign In Button */}
              <FadeIn delay={0.8}>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 sm:h-12 text-base font-medium gap-2 group hover:border-primary/50 transition-all"
                  onClick={async () => {
                    setIsGoogleLoading(true);
                    try {
                      await signIn('google', { callbackUrl: '/dashboard' });
                    } catch {
                      setError('Google sign in failed. Please try again.');
                      setIsGoogleLoading(false);
                    }
                  }}
                  disabled={isLoading || isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <motion.svg 
                      className="h-5 w-5" 
                      viewBox="0 0 24 24"
                      whileHover={{ rotate: 10 }}
                    >
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </motion.svg>
                  )}
                  <span>{isGoogleLoading ? 'Signing in...' : 'Sign in with UMak Google'}</span>
                </Button>
              </FadeIn>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 px-4 sm:px-6 pb-4 sm:pb-6">
              <FadeIn delay={0.9}>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                  <Check className="h-3 w-3 text-green-500" />
                  <span>Only @umak.edu.ph accounts may register</span>
                </div>
              </FadeIn>
              
              {/* Online indicator */}
              <FadeIn delay={1}>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span><AnimatedCounter value={liveUserCount} /> students online</span>
                </div>
              </FadeIn>
            </CardFooter>
          </Card>

          {/* Quick link to features */}
          <FadeIn delay={1.1}>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                New to HeronPulse?{' '}
                <Link href="/#features" className="text-primary hover:underline underline-offset-4 font-medium">
                  Learn more
                </Link>
              </p>
              <Button variant="ghost" size="sm" className="gap-2" asChild>
                <Link href="/">
                  <Sparkles className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </FadeIn>
        </motion.div>
      </div>
    </div>
  );
}
