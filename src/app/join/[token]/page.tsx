'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Clock,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  LogIn,
  Building,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface InvitationDetails {
  valid: boolean;
  invitation?: {
    id: string;
    class: {
      id: string;
      name: string;
      subjectCode: string;
      description?: string;
      schedule?: string;
      room?: string;
      semester: string;
      yearLevel: string;
      section: string;
      owner: {
        id: string;
        displayName: string;
        email: string;
      };
    };
    expiresAt: string;
    maxUses?: number;
    currentUses: number;
  };
  error?: string;
}

export default function JoinClassPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await fetch(`/api/join/${token}`);
        const data = await response.json();
        setInvitationDetails(data);
      } catch (error) {
        console.error('Error fetching invitation:', error);
        setInvitationDetails({ valid: false, error: 'Failed to load invitation' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleJoinClass = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/join/${token}`);
      return;
    }

    setIsJoining(true);
    try {
      const response = await fetch(`/api/join/${token}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join class');
      }

      setHasJoined(true);
      toast.success(data.message || 'Successfully joined the class!');
      
      // Redirect to classes page after 2 seconds
      setTimeout(() => {
        router.push('/classes');
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to join class');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading invitation...</p>
        </motion.div>
      </div>
    );
  }

  // Invalid invitation
  if (!invitationDetails?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="glass-card border-destructive/50">
            <CardContent className="pt-6 text-center">
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Invalid Invitation</h2>
              <p className="text-muted-foreground mb-6">
                {invitationDetails?.error || 'This invitation link is not valid or has expired.'}
              </p>
              <Button onClick={() => router.push('/')} className="min-h-[44px]">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const { invitation } = invitationDetails;
  const classData = invitation!.class;

  // Success state after joining
  if (hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="glass-card border-green-500/50">
            <CardContent className="pt-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
              >
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-xl font-bold mb-2">Successfully Joined!</h2>
              <p className="text-muted-foreground mb-2">
                You've been added to
              </p>
              <p className="font-semibold text-lg mb-6">{classData.name}</p>
              <p className="text-sm text-muted-foreground">
                Redirecting to your classes...
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        <Card className="glass-card">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Join Class</CardTitle>
            <CardDescription>
              You've been invited to join a class
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Class Info */}
            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{classData.subjectCode}</Badge>
                    <Badge variant="secondary">{classData.yearLevel} - {classData.section}</Badge>
                  </div>
                  <h3 className="font-semibold text-lg">{classData.name}</h3>
                </div>
              </div>
              
              {classData.description && (
                <p className="text-sm text-muted-foreground">{classData.description}</p>
              )}
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>{classData.semester}</span>
                </div>
                {classData.schedule && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{classData.schedule}</span>
                  </div>
                )}
                {classData.room && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>{classData.room}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {invitation!.currentUses} enrolled
                    {invitation!.maxUses && ` / ${invitation!.maxUses} max`}
                  </span>
                </div>
              </div>
              
              {/* Instructor */}
              <div className="flex items-center gap-3 pt-3 border-t">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {classData.owner.displayName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm">{classData.owner.displayName}</p>
                  <p className="text-xs text-muted-foreground">Instructor</p>
                </div>
              </div>
            </div>

            {/* Expiration Notice */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Invitation expires: {new Date(invitation!.expiresAt).toLocaleDateString()}
              </span>
            </div>

            {/* Login Warning or Join Button */}
            {status === 'unauthenticated' ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm">
                  <p className="text-yellow-600 dark:text-yellow-400">
                    Please log in to join this class. You'll need a student account.
                  </p>
                </div>
                <Button
                  onClick={() => router.push(`/login?callbackUrl=/join/${token}`)}
                  className="w-full min-h-[44px]"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Log in to Join
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleJoinClass}
                disabled={isJoining}
                className="w-full min-h-[44px]"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Join Class
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
