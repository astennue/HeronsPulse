'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Shield, Lock, Eye, Database, Users, Bell, Cookie, Globe, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const sections = [
  {
    icon: Shield,
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us, including:
    
• Account Information: Name, email address, and university ID when you register
• Profile Data: Profile picture, bio, course codes, and preferences
• Academic Data: Tasks, projects, deadlines, and progress tracking
• Usage Data: How you interact with HeronPulse features
• Communication Data: Messages, comments, and feedback

We also automatically collect certain information when you use our service:
• Device information (browser type, operating system)
• Log data (access times, pages viewed, IP address)
• Cookies and similar tracking technologies`
  },
  {
    icon: Lock,
    title: '2. How We Use Your Information',
    content: `We use the information we collect to:

• Provide, maintain, and improve our services
• Process your tasks, projects, and academic data
• Send you technical notices, updates, and administrative messages
• Respond to your comments, questions, and requests
• Monitor and analyze trends, usage, and activities
• Detect, investigate, and prevent fraudulent transactions and abuse
• Personalize your experience with tailored content and recommendations`
  },
  {
    icon: Eye,
    title: '3. Information Sharing',
    content: `We do not sell, trade, or otherwise transfer your personal information to third parties except:

• With Your Consent: When you authorize us to share information
• With Service Providers: Trusted third parties who assist in operating our platform
• For Legal Purposes: When required by law or to protect our rights
• Academic Purposes: Anonymized data may be used for research to improve educational outcomes
• Institutional Reports: Aggregate data shared with University of Makati for accreditation purposes

Your task data may be visible to:
• Faculty members in your enrolled classes (for academic monitoring)
• Team members in shared projects (for collaboration)`
  },
  {
    icon: Database,
    title: '4. Data Storage and Security',
    content: `We implement industry-standard security measures including:

• Encryption: All data transmitted using TLS 1.3 encryption
• Secure Storage: Data stored in encrypted databases with access controls
• Regular Audits: Security assessments and penetration testing
• Access Control: Role-based access with authentication required
• Backup Systems: Regular backups with disaster recovery procedures

Data is stored on secure servers located in the Philippines region. We retain your data for the duration of your account plus 1 year, or as required by university policy.`
  },
  {
    icon: Users,
    title: '5. Your Rights',
    content: `Under the Data Privacy Act of 2012 (RA 10173), you have the right to:

• Access: Request a copy of your personal data
• Correction: Request correction of inaccurate data
• Erasure: Request deletion of your data ("right to be forgotten")
• Portability: Receive your data in a machine-readable format
• Objection: Object to processing of your data
• Withdraw Consent: Withdraw consent at any time

To exercise these rights, contact us at privacy@heronpulse.umak.edu.ph`
  },
  {
    icon: Bell,
    title: '6. Notifications and Communications',
    content: `You can control notifications through your Settings page:

• Email Notifications: Deadline reminders, mentions, achievements
• Push Notifications: Browser notifications for important updates
• In-App Notifications: Activity feed and notification center

You can opt out of marketing communications at any time. We will never send spam or share your email with third parties for marketing purposes.`
  },
  {
    icon: Cookie,
    title: '7. Cookies and Tracking',
    content: `We use cookies and similar technologies for:

• Essential Cookies: Required for authentication and core functionality
• Preference Cookies: Remember your settings and preferences
• Analytics Cookies: Understand how you use our service (anonymized)

You can manage cookie preferences in your browser settings. Disabling essential cookies may affect functionality.`
  },
  {
    icon: Globe,
    title: '8. Third-Party Services',
    content: `HeronPulse may integrate with:

• Google Services: Google Classroom integration (with your permission)
• University of Makati Systems: LMS synchronization (future feature)
• Analytics Tools: Anonymous usage analytics

These services have their own privacy policies. We encourage you to review them.`
  },
  {
    icon: AlertTriangle,
    title: '9. Updates to This Policy',
    content: `We may update this Privacy Policy periodically. We will notify you of material changes by:

• Posting a notice on the HeronPulse login screen
• Sending an email to your registered address
• Updating the "Last Updated" date below

Continued use of HeronPulse after changes constitutes acceptance of the updated policy.`
  }
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="HeronPulse Logo" 
              width={32} 
              height={32}
              className="h-8 w-auto"
            />
            <span className="font-bold text-lg">HeronPulse</span>
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Title Section */}
          <div className="text-center space-y-4 mb-12">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your privacy is important to us. This policy describes how HeronPulse collects, uses, and protects your personal information.
            </p>
            <p className="text-sm text-muted-foreground">
              Last Updated: January 2025 | Effective Date: January 2025
            </p>
          </div>

          {/* Quick Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Quick Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li>We only collect data necessary for academic management</li>
                <li>Your data is never sold to third parties</li>
                <li>Faculty can only see data for students in their classes</li>
                <li>You can request deletion of your data at any time</li>
                <li>Data is encrypted and stored securely</li>
              </ul>
            </CardContent>
          </Card>

          <Separator />

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <section.icon className="h-5 w-5 text-primary" />
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                      {section.content}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Separator />

          {/* Contact Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <p>
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact:
              </p>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p><strong>HeronPulse Data Protection Officer</strong></p>
                <p>College of Computing and Information Sciences</p>
                <p>University of Makati</p>
                <p>Email: privacy@heronpulse.umak.edu.ph</p>
                <p>Phone: +63 (2) 8882-7000 local 6000</p>
              </div>
              <p className="text-xs">
                For complaints about data privacy, you may also contact the National Privacy Commission at privacy.gov.ph
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>2025 HeronPulse. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/legal" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/legal/terms" className="hover:text-foreground">Terms of Service</Link>
            <Link href="/help" className="hover:text-foreground">Help Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
