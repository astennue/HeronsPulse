'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Mail, Lock, User, AlertCircle, Loader2, CheckCircle2, XCircle, GraduationCap, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

const ALLOWED_DOMAINS = ['umak.edu.ph', 'student.umak.edu.ph', 'gmail.com'];

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: 'student',
    studentNumber: '',
    yearLevel: '',
    program: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'valid' | 'invalid' | 'exists' | 'checking' | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Check email validity
  useEffect(() => {
    const checkEmail = async () => {
      if (!formData.email || formData.email.length < 5) {
        setEmailStatus(null);
        return;
      }

      const emailDomain = formData.email.toLowerCase().split('@')[1];
      
      if (!emailDomain || !ALLOWED_DOMAINS.includes(emailDomain)) {
        setEmailStatus('invalid');
        return;
      }

      setEmailStatus('checking');

      try {
        const res = await fetch(`/api/auth/signup/validate-email?email=${encodeURIComponent(formData.email)}`);
        const data = await res.json();

        if (data.exists) {
          setEmailStatus('exists');
        } else if (data.valid) {
          setEmailStatus('valid');
          // Auto-suggest role based on email
          if (data.suggestedRole) {
            setFormData(prev => ({ ...prev, role: data.suggestedRole }));
          }
        } else {
          setEmailStatus('invalid');
        }
      } catch {
        setEmailStatus(null);
      }
    };

    const debounce = setTimeout(checkEmail, 500);
    return () => clearTimeout(debounce);
  }, [formData.email]);

  // Check password strength
  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (passwordStrength < 3) {
      setError('Password is too weak. Please use a stronger password.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
          role: formData.role,
          studentNumber: formData.studentNumber || undefined,
          yearLevel: formData.yearLevel || undefined,
          program: formData.program || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create account');
        setIsLoading(false);
        return;
      }

      setSuccess(data.message || 'Account created successfully!');

      // Auto sign in after successful signup
      setTimeout(async () => {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          router.push('/login');
        } else {
          router.push('/dashboard');
          router.refresh();
        }
      }, 1500);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const getEmailStatusIcon = () => {
    switch (emailStatus) {
      case 'valid':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'invalid':
      case 'exists':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getEmailStatusMessage = () => {
    switch (emailStatus) {
      case 'valid':
        return <span className="text-green-600 dark:text-green-400 text-sm">Email is valid for signup</span>;
      case 'invalid':
        return <span className="text-destructive text-sm">Only @umak.edu.ph emails are allowed</span>;
      case 'exists':
        return <span className="text-destructive text-sm">An account with this email already exists</span>;
      default:
        return null;
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-destructive';
    if (passwordStrength <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 4) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Animated Background */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-[#1A56DB] via-[#3B82F6] to-[#1A56DB] relative overflow-hidden"
      >
        {/* Floating Icons Animation */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white/10"
              initial={{ 
                x: Math.random() * 100 + '%', 
                y: Math.random() * 100 + '%',
                rotate: 0 
              }}
              animate={{ 
                y: [null, Math.random() * -200 - 100],
                rotate: [0, 360]
              }}
              transition={{ 
                duration: Math.random() * 20 + 10, 
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              <BookOpen className="w-8 h-8" />
            </motion.div>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7" />
              </div>
              <span className="text-3xl font-bold">HeronPulse</span>
            </div>
            <h1 className="text-5xl font-bold mb-4 leading-tight">
              Join the<br />Academic OS.
            </h1>
            <p className="text-xl text-white/80 max-w-md">
              Create your account with your UMAK email address to get started with the Academic Workload Forecasting System.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-12"
          >
            <h3 className="text-lg font-semibold mb-4">What you'll get:</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Academic Load Index (ALI) monitoring</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Multi-horizon workload forecasting</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Task & project management</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Pomodoro timer with focus tracking</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
      </motion.div>

      {/* Right Panel - Signup Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">HeronPulse</span>
          </div>

          <Card className="glass-card border-0 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
              <CardDescription>
                Sign up with your UMAK email address
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.name@umak.edu.ph"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 pr-10"
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {getEmailStatusIcon()}
                    </div>
                  </div>
                  {getEmailStatusMessage()}
                </div>

                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="displayName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Juan Dela Cruz"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">I am a</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          <span>Student</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="faculty">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          <span>Faculty</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Student-specific fields */}
                {formData.role === 'student' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yearLevel">Year Level</Label>
                      <Select
                        value={formData.yearLevel}
                        onValueChange={(value) => setFormData({ ...formData, yearLevel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st Year">1st Year</SelectItem>
                          <SelectItem value="2nd Year">2nd Year</SelectItem>
                          <SelectItem value="3rd Year">3rd Year</SelectItem>
                          <SelectItem value="4th Year">4th Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="program">Program</Label>
                      <Select
                        value={formData.program}
                        onValueChange={(value) => setFormData({ ...formData, program: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BSCS">BSCS</SelectItem>
                          <SelectItem value="BSIT">BSIT</SelectItem>
                          <SelectItem value="Diploma">Diploma</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                  {formData.password && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getPasswordStrengthColor()} transition-all`}
                          style={{ width: `${(passwordStrength / 6) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{getPasswordStrengthLabel()}</span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={`pl-10 ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? 'border-destructive'
                          : formData.confirmPassword && formData.password === formData.confirmPassword
                          ? 'border-green-500'
                          : ''
                      }`}
                      required
                    />
                    {formData.confirmPassword && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {formData.password === formData.confirmPassword ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || emailStatus !== 'valid'}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Separator />
              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Only @umak.edu.ph and @student.umak.edu.ph<br />email addresses are allowed.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
