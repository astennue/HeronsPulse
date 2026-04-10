'use client';

import { motion } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  Shield,
  CheckCircle2,
  XCircle,
  Sparkles,
  Briefcase,
  LayoutDashboard,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ROLE_CONFIGS, UserRole, RoleConfig } from '@/lib/role-privileges';

interface RolePrivilegesDisplayProps {
  currentRole?: UserRole | string;
  showAllRoles?: boolean;
  compact?: boolean;
}

const roleIcons: Record<string, typeof GraduationCap> = {
  student: GraduationCap,
  faculty: BookOpen,
  super_admin: Shield,
};

const roleColors: Record<string, { bg: string; text: string; border: string }> = {
  student: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30' },
  faculty: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  super_admin: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' },
};

export function RolePrivilegesDisplay({ 
  currentRole = 'student', 
  showAllRoles = false,
  compact = false 
}: RolePrivilegesDisplayProps) {
  const roles: [UserRole, RoleConfig][] = showAllRoles 
    ? (Object.entries(ROLE_CONFIGS) as [UserRole, RoleConfig][])
    : [[currentRole as UserRole, ROLE_CONFIGS[currentRole as UserRole] || ROLE_CONFIGS.student]];

  return (
    <div className="space-y-4">
      {roles.map(([roleKey, config], index) => {
        const Icon = roleIcons[roleKey as string] || GraduationCap;
        const colors = roleColors[roleKey as string] || roleColors.student;
        const isCurrentRole = roleKey === currentRole;

        return (
          <motion.div
            key={roleKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={cn(
              'glass-card overflow-hidden',
              isCurrentRole && 'ring-2 ring-primary/50'
            )}>
              <CardHeader className={cn('pb-4', colors.bg)}>
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg', colors.bg)}>
                    <Icon className={cn('h-6 w-6', colors.text)} />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {config.name}
                      {isCurrentRole && (
                        <Badge variant="default" className="text-xs">Current</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">{config.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                {!compact && (
                  <>
                    {/* Duties */}
                    <div>
                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <Briefcase className="h-4 w-4 text-primary" />
                        Duties & Responsibilities
                      </h4>
                      <ul className="space-y-1">
                        {config.duties.map((duty, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                            {duty}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    {/* Features */}
                    <div>
                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Available Features
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {config.features.slice(0, 8).map((feature, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {config.features.length > 8 && (
                          <Badge variant="outline" className="text-xs">
                            +{config.features.length - 8} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Novel Features */}
                    <div>
                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        Novel Features
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {config.novelFeatures.map((feature, i) => (
                          <div 
                            key={i} 
                            className={cn('p-3 rounded-lg border', colors.border, colors.bg)}
                          >
                            <p className="text-sm font-medium">{feature.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Restrictions */}
                    <div>
                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Restrictions
                      </h4>
                      <ul className="space-y-1">
                        {config.restrictions.map((restriction, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <XCircle className="h-3 w-3 mt-1 text-red-400 shrink-0" />
                            {restriction}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    {/* Dashboard Widgets */}
                    <div>
                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <LayoutDashboard className="h-4 w-4 text-primary" />
                        Dashboard Widgets
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {config.dashboardWidgets.map((widget, i) => (
                          <div 
                            key={i} 
                            className="p-2 rounded-lg border bg-muted/30 text-center"
                          >
                            <p className="text-xs font-medium">{widget.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {compact && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{config.features.length} features</span>
                    <span className={colors.text}>{config.novelFeatures.length} unique features</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

// Compact role badge for display in headers/profiles
export function RoleBadge({ role }: { role: UserRole | string }) {
  const config = ROLE_CONFIGS[role as UserRole] || ROLE_CONFIGS.student;
  const Icon = roleIcons[role] || GraduationCap;
  const colors = roleColors[role] || roleColors.student;

  return (
    <Badge className={cn('gap-1.5', colors.bg, colors.text, colors.border)}>
      <Icon className="h-3 w-3" />
      {config.name}
    </Badge>
  );
}
