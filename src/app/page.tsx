'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Target, 
  Award, 
  BarChart3, 
  Calendar,
  CheckCircle2,
  Zap,
  Shield,
  Timer,
  ArrowRight,
  LogIn,
  Rocket,
  Sparkles,
  Menu,
  Play,
  Users,
  BookOpen,
  TrendingUp,
  Flame,
  Clock,
  Monitor,
  Smartphone,
  Laptop
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { FloatingShapes, FloatingNotificationCards, DotsPattern, MeshGradient, ParticleBackground } from '@/components/effects/FloatingShapes';
import { AnimatedCounter, StaggerContainer, StaggerItem, FadeIn, HoverLift, Typewriter } from '@/components/ui/animations';
import { InteractiveDemo } from '@/components/landing/InteractiveDemo';
import SplashScreen from '@/components/SplashScreen';

// Device mockup component - defined outside to avoid lint error
function DeviceMockup({ type, delay = 0 }: { type: 'desktop' | 'tablet' | 'mobile'; delay?: number }) {
  const devices = {
    desktop: { icon: Monitor, label: 'Desktop', size: 'w-48 h-32 sm:w-64 sm:h-40' },
    tablet: { icon: Laptop, label: 'Tablet', size: 'w-32 h-44 sm:w-40 sm:h-52' },
    mobile: { icon: Smartphone, label: 'Mobile', size: 'w-20 h-36 sm:w-24 sm:h-44' },
  };
  const device = devices[type];
  const Icon = device.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: type === 'mobile' ? -12 : type === 'tablet' ? 6 : 0 }}
      animate={{ 
        opacity: 1, 
        y: [0, -10, 0],
        rotate: type === 'mobile' ? -12 : type === 'tablet' ? 6 : 0
      }}
      transition={{ 
        delay, 
        duration: 0.6,
        y: { delay: delay + 1, duration: 4, repeat: Infinity, ease: 'easeInOut' }
      }}
      className={`relative ${device.size} glass-card rounded-lg shadow-2xl overflow-hidden border border-primary/20`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      <div className="absolute top-2 left-2 flex gap-1">
        <div className="w-2 h-2 rounded-full bg-red-400" />
        <div className="w-2 h-2 rounded-full bg-yellow-400" />
        <div className="w-2 h-2 rounded-full bg-green-400" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className="h-8 w-8 text-primary/40" />
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [showSplash, setShowSplash] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDemo, setActiveDemo] = useState<'preview' | 'interactive'>('preview');
  const [liveUserCount, setLiveUserCount] = useState(1247);

  // Simulate live user count updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUserCount(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: Target, title: 'Smart Task Management', description: 'AI-powered priorities, deadlines, and smart categorization for your workflow', color: 'bg-green-500', colorLight: 'bg-green-500/10', textColor: 'text-green-500' },
    { icon: BarChart3, title: 'Analytics & Insights', description: 'Visualize productivity with comprehensive dashboards and actionable insights', color: 'bg-purple-500', colorLight: 'bg-purple-500/10', textColor: 'text-purple-500' },
    { icon: Timer, title: 'Focus Timer', description: 'Built-in Pomodoro timer with ambient sounds and break reminders', color: 'bg-orange-500', colorLight: 'bg-orange-500/10', textColor: 'text-orange-500' },
    { icon: Award, title: 'Gamification', description: 'Earn badges, maintain streaks, and compete on student leaderboards', color: 'bg-yellow-500', colorLight: 'bg-yellow-500/10', textColor: 'text-yellow-500' },
    { icon: Calendar, title: 'Smart Calendar', description: 'Visualize deadlines, schedule tasks with drag-and-drop reminders', color: 'bg-pink-500', colorLight: 'bg-pink-500/10', textColor: 'text-pink-500' },
    { icon: Shield, title: 'Secure & Private', description: 'Encrypted academic data. Only verified UMak emails are allowed', color: 'bg-blue-500', colorLight: 'bg-blue-500/10', textColor: 'text-blue-500' },
  ];

  const stats = useMemo(() => [
    { value: liveUserCount, label: 'Active Students', icon: Users, color: 'text-blue-500' },
    { value: 156, label: 'Courses Connected', icon: BookOpen, color: 'text-green-500' },
    { value: 4.9, label: 'User Rating', icon: TrendingUp, color: 'text-yellow-500', decimals: 1, suffix: '★' },
    { value: 89, label: 'Tasks Completed Today', icon: CheckCircle2, color: 'text-purple-500', suffix: '+' },
  ], [liveUserCount]);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {/* Main Landing Page */}
      <AnimatePresence>
        {!showSplash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-background flex flex-col relative overflow-hidden"
          >
            {/* Background Effects */}
            <MeshGradient />
            <FloatingShapes count={10} minSize={80} maxSize={200} />
            <ParticleBackground count={30} color="var(--primary)" />
            <FloatingNotificationCards className="z-0" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
              <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 sm:h-16">
                  {/* Logo */}
                  <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0 group">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative"
                    >
                      <Image 
                        src="/logo.png" 
                        alt="HeronPulse Logo" 
                        width={32} 
                        height={32}
                        className="h-8 w-8 sm:h-10 sm:w-10 logo-adaptive group-hover:animate-logo-pulse"
                        priority
                      />
                    </motion.div>
                    <span className="text-lg sm:text-xl font-bold gradient-text">HeronPulse</span>
                  </Link>

                  {/* Desktop Navigation */}
                  <div className="hidden md:flex items-center gap-3 lg:gap-4">
                    <ThemeSwitcher />
                    <Button variant="ghost" asChild className="min-h-[44px] group">
                      <Link href="/login">
                        <LogIn className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild className="min-h-[44px] group relative overflow-hidden">
                      <Link href="/login">
                        <motion.span
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.5 }}
                        />
                        <Rocket className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                        Get Started
                      </Link>
                    </Button>
                  </div>

                  {/* Mobile Menu Button */}
                  <div className="flex items-center gap-2 md:hidden">
                    <ThemeSwitcher />
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">
                          <Menu className="h-6 w-6" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                        <SheetHeader className="border-b pb-4">
                          <SheetTitle className="flex items-center gap-2">
                            <Image 
                              src="/logo.png" 
                              alt="HeronPulse Logo" 
                              width={28} 
                              height={28}
                              className="h-7 w-7 logo-adaptive"
                            />
                            HeronPulse
                          </SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-col gap-3 mt-6">
                          <Button 
                            variant="ghost" 
                            asChild 
                            className="justify-start min-h-[48px] text-base"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Link href="/login">
                              <LogIn className="h-5 w-5 mr-3" />
                              Sign In
                            </Link>
                          </Button>
                          <Button 
                            asChild 
                            className="justify-start min-h-[48px] text-base"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Link href="/login">
                              <Rocket className="h-5 w-5 mr-3" />
                              Get Started
                            </Link>
                          </Button>
                          <div className="border-t my-2" />
                          <Button 
                            variant="outline" 
                            className="justify-start min-h-[48px] text-base"
                            onClick={scrollToFeatures}
                          >
                            <Sparkles className="h-5 w-5 mr-3" />
                            Explore Features
                          </Button>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-20 sm:pt-28 md:pt-32 pb-8 sm:pb-12 md:pb-16 px-3 sm:px-4 relative">
              <DotsPattern dotSize={1} gap={32} className="opacity-[0.05]" />
              <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  {/* Left Content */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center lg:text-left"
                  >
                    {/* Logo */}
                    <FadeIn delay={0.1}>
                      <div className="flex justify-center lg:justify-start mb-4 sm:mb-6">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="relative"
                        >
                          <Image 
                            src="/logo.png" 
                            alt="HeronPulse Logo" 
                            width={100} 
                            height={100}
                            className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 logo-adaptive animate-logo-pulse"
                            priority
                          />
                        </motion.div>
                      </div>
                    </FadeIn>
                    
                    {/* Badge */}
                    <FadeIn delay={0.2}>
                      <Badge className="mb-3 sm:mb-4 px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm">
                        <Zap className="h-3 w-3 mr-1 animate-pulse" />
                        Academic Work Operating System
                      </Badge>
                    </FadeIn>
                    
                    {/* Heading with Typewriter */}
                    <FadeIn delay={0.3}>
                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-2">
                        <span className="block">Your Academic Workflow,</span>
                        <span className="gradient-text">
                          <Typewriter text="Elevated." speed={100} />
                        </span>
                      </h1>
                    </FadeIn>
                    
                    {/* Description */}
                    <FadeIn delay={0.5}>
                      <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-8 px-2 sm:px-4 lg:px-0 leading-relaxed">
                        A production-ready Academic Work OS designed for the{' '}
                        <span className="text-primary font-medium">College of Computing and Information Sciences</span> at{' '}
                        <span className="text-primary font-medium">University of Makati</span>.
                      </p>
                    </FadeIn>
                    
                    {/* CTA Buttons */}
                    <FadeIn delay={0.6}>
                      <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 px-4 mb-8">
                        <HoverLift>
                          <Button size="lg" className="gap-2 text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto min-h-[48px] group relative overflow-hidden" asChild>
                            <Link href="/login">
                              <motion.span
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.5 }}
                              />
                              Start Now
                              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </Button>
                        </HoverLift>
                        <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto min-h-[48px]" onClick={scrollToFeatures}>
                          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                          Explore Features
                        </Button>
                      </div>
                    </FadeIn>

                    {/* Live Stats Counter */}
                    <FadeIn delay={0.7}>
                      <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-muted-foreground">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span>
                          <AnimatedCounter value={liveUserCount} /> students online right now
                        </span>
                      </div>
                    </FadeIn>
                  </motion.div>

                  {/* Right Content - Floating Devices */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="relative hidden lg:flex items-center justify-center h-[400px] xl:h-[500px]"
                  >
                    {/* Background glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/10 to-pink-500/20 rounded-full blur-3xl" />
                    
                    {/* Device mockups */}
                    <div className="relative flex items-end gap-4">
                      <DeviceMockup type="desktop" delay={0.2} />
                      <DeviceMockup type="tablet" delay={0.4} />
                      <DeviceMockup type="mobile" delay={0.6} />
                    </div>

                    {/* Floating feature badges */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 }}
                      className="absolute top-4 left-0 glass-card px-3 py-2 rounded-lg shadow-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">5-day streak!</span>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 }}
                      className="absolute bottom-20 right-0 glass-card px-3 py-2 rounded-lg shadow-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Task due in 2h</span>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 }}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-card px-3 py-2 rounded-lg shadow-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Badge unlocked!</span>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Interactive Demo Section */}
                <FadeIn delay={0.8}>
                  <div className="mt-8 sm:mt-12">
                    {/* Demo Tabs */}
                    <div className="flex justify-center gap-2 mb-6">
                      <Button
                        variant={activeDemo === 'preview' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveDemo('preview')}
                        className="min-h-[44px] px-4"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Watch Demo
                      </Button>
                      <Button
                        variant={activeDemo === 'interactive' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveDemo('interactive')}
                        className="min-h-[44px] px-4"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Try It
                      </Button>
                    </div>
                    
                    {/* Demo Container */}
                    <motion.div
                      key={activeDemo}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="relative max-w-4xl mx-auto"
                    >
                      <Card className="glass-card overflow-hidden border-2 border-primary/20 shadow-2xl">
                        <CardContent className="p-0">
                          <InteractiveDemo mode={activeDemo} />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </FadeIn>

                {/* Live Stats Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="mt-10 sm:mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
                >
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div 
                        key={index} 
                        className="text-center p-3 sm:p-4 glass-card rounded-xl"
                        whileHover={{ scale: 1.05, y: -4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 ${stat.color}`} />
                        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                          <AnimatedCounter 
                            value={stat.value} 
                            suffix={stat.suffix}
                            decimals={stat.decimals || 0}
                            duration={2000}
                          />
                        </p>
                        <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">{stat.label}</p>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 bg-muted/30 relative">
              <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-center mb-8 sm:mb-12 md:mb-16"
                >
                  <Badge variant="outline" className="mb-3 sm:mb-4">Features</Badge>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">
                    Everything You Need to Succeed
                  </h2>
                  <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-2">
                    Powerful features designed specifically for CCIS students and faculty
                  </p>
                </motion.div>

                <StaggerContainer delay={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <StaggerItem key={index}>
                        <HoverLift>
                          <Card className="h-full border-transparent hover:border-primary/20 group cursor-pointer glass-card flex flex-col">
                            <CardContent className="p-4 sm:p-6 relative flex flex-col flex-1 min-h-[200px]">
                              {/* Number badge */}
                              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                {index + 1}
                              </div>
                              
                              <motion.div 
                                className={`h-12 w-12 rounded-xl ${feature.colorLight} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 flex-shrink-0`}
                                whileHover={{ rotate: [0, -10, 10, 0] }}
                                transition={{ duration: 0.3 }}
                              >
                                <Icon className={`h-6 w-6 ${feature.textColor}`} />
                              </motion.div>
                              <h3 className="text-lg font-semibold mb-2 flex-shrink-0">{feature.title}</h3>
                              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{feature.description}</p>
                            </CardContent>
                          </Card>
                        </HoverLift>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>
              </div>
            </section>

            {/* How It Works Section */}
            <section className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 relative">
              <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-center mb-8 sm:mb-12 md:mb-16"
                >
                  <Badge variant="outline" className="mb-3 sm:mb-4">Getting Started</Badge>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">
                    How It Works
                  </h2>
                  <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-2">
                    Get started with HeronPulse in four simple steps
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                  {[
                    { step: 1, title: 'Sign Up', description: 'Create your account using your UMak Gmail address', icon: Users, color: 'bg-blue-500' },
                    { step: 2, title: 'Set Up Profile', description: 'Configure your preferences, courses, and notification settings', icon: Shield, color: 'bg-purple-500' },
                    { step: 3, title: 'Start Managing', description: 'Create tasks, track progress, and collaborate with your team', icon: Target, color: 'bg-green-500' },
                    { step: 4, title: 'Achieve Goals', description: 'Earn badges, maintain streaks, and achieve academic success!', icon: Award, color: 'bg-yellow-500' },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15 }}
                      className="relative"
                    >
                      {/* Connector Line - Desktop only */}
                      {index < 3 && (
                        <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -translate-x-4 z-0" />
                      )}
                      <HoverLift>
                        <Card className="h-full glass-card relative z-10 flex flex-col">
                          <CardContent className="p-5 sm:p-6 text-center flex flex-col flex-1 min-h-[220px]">
                            <motion.div 
                              className={`w-12 h-12 rounded-full ${item.color} text-white flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-lg flex-shrink-0`}
                              whileHover={{ scale: 1.1, rotate: 360 }}
                              transition={{ duration: 0.3 }}
                            >
                              {item.step}
                            </motion.div>
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 flex-shrink-0">
                              <item.icon className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2 flex-shrink-0">{item.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed flex-1">{item.description}</p>
                          </CardContent>
                        </Card>
                      </HoverLift>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 bg-primary/5 mt-auto relative overflow-hidden">
              <FloatingShapes count={4} minSize={80} maxSize={150} />
              <div className="max-w-4xl mx-auto text-center relative z-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  <motion.div 
                    className="flex justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6"
                    initial="hidden"
                    whileInView="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1 }
                      }
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        variants={{
                          hidden: { scale: 0, opacity: 0 },
                          visible: { scale: 1, opacity: 1 }
                        }}
                        transition={{ type: 'spring' }}
                      >
                        <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                      </motion.div>
                    ))}
                  </motion.div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">
                    Ready to Transform Your Academic Life?
                  </h2>
                  <p className="text-muted-foreground text-base sm:text-lg mb-6 sm:mb-8 px-2">
                    Join <span className="font-semibold text-primary">{liveUserCount}+ CCIS students</span> already using HeronPulse
                  </p>
                  <HoverLift>
                    <Button size="lg" className="gap-2 text-base sm:text-lg px-6 sm:px-8 min-h-[48px] group relative overflow-hidden" asChild>
                      <Link href="/login">
                        <motion.span
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.5 }}
                        />
                        Start Now
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </HoverLift>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-4 px-4">
                    Only @umak.edu.ph accounts allowed
                  </p>
                </motion.div>
              </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-8 sm:py-10 md:py-12 px-3 sm:px-4 relative z-10">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  {/* Logo and Brand */}
                  <Link href="/" className="flex items-center gap-2 sm:gap-3 justify-center md:justify-start group">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                    >
                      <Image 
                        src="/logo.png" 
                        alt="HeronPulse Logo" 
                        width={28} 
                        height={28}
                        className="h-7 w-7 sm:h-8 sm:w-auto logo-adaptive group-hover:animate-logo-pulse"
                      />
                    </motion.div>
                    <span className="text-sm sm:text-base font-semibold">HeronPulse Academic OS</span>
                  </Link>
                  
                  {/* Footer Links */}
                  <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                    <Link href="#" className="hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center hover:underline underline-offset-4">
                      Privacy Policy
                    </Link>
                    <Link href="#" className="hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center hover:underline underline-offset-4">
                      Terms of Service
                    </Link>
                    <Link href="#" className="hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center hover:underline underline-offset-4">
                      Help Center
                    </Link>
                  </div>
                  
                  {/* Copyright */}
                  <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-right">
                    © 2025 HeronPulse. Made for UMaK CCIS.
                  </p>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
