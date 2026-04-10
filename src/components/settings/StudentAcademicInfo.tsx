'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Briefcase, 
  Users, 
  Clock, 
  Plus, 
  X, 
  Save,
  Loader2,
  Building2
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Organization {
  name: string;
  position: string;
}

export function StudentAcademicInfo() {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Student profile state
  const [studentNumber, setStudentNumber] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [program, setProgram] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgPosition, setNewOrgPosition] = useState('');
  const [extracurricularHours, setExtracurricularHours] = useState(0);
  const [hasPartTimeWork, setHasPartTimeWork] = useState(false);
  const [workHoursPerWeek, setWorkHoursPerWeek] = useState(0);
  const [workType, setWorkType] = useState('');

  // Load student profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/student-profile');
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setStudentNumber(data.data.studentNumber || '');
            setYearLevel(data.data.yearLevel || '');
            setProgram(data.data.program || '');
            
            // Parse organizations from JSON string
            let orgs: Organization[] = [];
            if (data.data.organizations) {
              try {
                orgs = typeof data.data.organizations === 'string' 
                  ? JSON.parse(data.data.organizations) 
                  : data.data.organizations;
              } catch { orgs = []; }
            }
            setOrganizations(orgs);
            
            setExtracurricularHours(data.data.extracurricularHours || 0);
            setHasPartTimeWork(data.data.hasPartTimeWork || false);
            setWorkHoursPerWeek(data.data.workHoursPerWeek || 0);
            setWorkType(data.data.workType || '');
          }
        }
      } catch (error) {
        console.error('Failed to load student profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const handleAddOrganization = () => {
    if (!newOrgName.trim()) return;
    
    setOrganizations([
      ...organizations,
      { name: newOrgName.trim(), position: newOrgPosition.trim() || 'Member' }
    ]);
    setNewOrgName('');
    setNewOrgPosition('');
  };

  const handleRemoveOrganization = (index: number) => {
    setOrganizations(organizations.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/student-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentNumber: studentNumber || null,
          yearLevel: yearLevel || null,
          program: program || null,
          organizations,
          extracurricularHours,
          hasPartTimeWork,
          workHoursPerWeek: hasPartTimeWork ? workHoursPerWeek : 0,
          workType: hasPartTimeWork ? workType : null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Profile Updated',
          description: 'Your academic information has been saved successfully!',
        });
      } else {
        throw new Error(result.error || 'Failed to save');
      }
    } catch (err: any) {
      toast({
        title: 'Save Failed',
        description: err.message || 'Failed to save profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Academic Information */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Academic Information
          </CardTitle>
          <CardDescription>
            Your academic details at UMAK CCIS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Student Number</Label>
              <Input
                placeholder="e.g., 2021-00001"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Year Level</Label>
              <Select value={yearLevel} onValueChange={setYearLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year level" />
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
              <Label>Program</Label>
              <Select value={program} onValueChange={setProgram}>
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BSCS">Bachelor of Science in Computer Science</SelectItem>
                  <SelectItem value="BSIT">Bachelor of Science in Information Technology</SelectItem>
                  <SelectItem value="Diploma">Diploma in Information Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extracurricular Activities */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Extracurricular Activities
          </CardTitle>
          <CardDescription>
            Student organizations and activities you're involved in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Organizations */}
          {organizations.length > 0 && (
            <div className="space-y-2">
              <Label>Your Organizations</Label>
              <div className="flex flex-wrap gap-2">
                {organizations.map((org, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Badge variant="secondary" className="gap-1 py-1.5 px-3">
                      <Building2 className="h-3 w-3" />
                      <span>{org.name}</span>
                      {org.position && (
                        <span className="text-muted-foreground">({org.position})</span>
                      )}
                      <button
                        onClick={() => handleRemoveOrganization(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Add Organization */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Organization name"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Position (optional)"
              value={newOrgPosition}
              onChange={(e) => setNewOrgPosition(e.target.value)}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              onClick={handleAddOrganization}
              disabled={!newOrgName.trim()}
              className="min-h-[44px]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <Separator />

          {/* Weekly Hours */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Hours per week spent on extracurricular activities
            </Label>
            <Input
              type="number"
              min="0"
              max="40"
              value={extracurricularHours}
              onChange={(e) => setExtracurricularHours(parseInt(e.target.value) || 0)}
              className="max-w-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              This helps calculate your Academic Load Index (ALI)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Part-time Work */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Part-time Work
          </CardTitle>
          <CardDescription>
            Work commitments that may affect your academic workload
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label>Do you have part-time work?</Label>
              <p className="text-sm text-muted-foreground">
                This affects your available study time and ALI calculation
              </p>
            </div>
            <Switch
              checked={hasPartTimeWork}
              onCheckedChange={setHasPartTimeWork}
            />
          </div>

          {hasPartTimeWork && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-4"
            >
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Work Hours per Week</Label>
                  <Input
                    type="number"
                    min="0"
                    max="48"
                    value={workHoursPerWeek}
                    onChange={(e) => setWorkHoursPerWeek(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Work Type</Label>
                  <Select value={workType} onValueChange={setWorkType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select work type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="On-campus">On-campus</SelectItem>
                      <SelectItem value="Off-campus">Off-campus</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                      <SelectItem value="Mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="min-h-[44px]"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Academic Info
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
