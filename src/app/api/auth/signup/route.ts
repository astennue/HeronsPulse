import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, handleApiError } from '@/lib/api/response';
import { hash } from 'bcrypt';
import { randomBytes } from 'crypto';

// Allowed UMAK email domains
const ALLOWED_DOMAINS = [
  'umak.edu.ph',
  'student.umak.edu.ph',
  'gmail.com', // For demo purposes, also allow gmail for testing
];

// POST /api/auth/signup - Register a new user with UMAK email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, displayName, role, studentNumber, yearLevel, program } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return apiError('Email is required', 400);
    }

    const emailLower = email.toLowerCase().trim();
    const emailDomain = emailLower.split('@')[1];

    // Check if email domain is allowed
    if (!emailDomain || !ALLOWED_DOMAINS.includes(emailDomain)) {
      return apiError(
        `Only UMAK email addresses are allowed. Please use your @umak.edu.ph or @student.umak.edu.ph email.`,
        400
      );
    }

    // Validate password
    if (!password || typeof password !== 'string' || password.length < 8) {
      return apiError('Password must be at least 8 characters long', 400);
    }

    // Validate display name
    if (!displayName || typeof displayName !== 'string' || displayName.trim().length < 2) {
      return apiError('Display name must be at least 2 characters long', 400);
    }

    // Validate role
    const validRoles = ['student', 'faculty'];
    const userRole = role && validRoles.includes(role) ? role : 'student';

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: emailLower },
    });

    if (existingUser) {
      return apiError('An account with this email already exists. Please sign in instead.', 400);
    }

    // Determine role based on email domain
    // Faculty emails typically use @umak.edu.ph without "student" prefix
    let assignedRole = userRole;
    if (emailDomain === 'student.umak.edu.ph') {
      assignedRole = 'student';
    } else if (emailDomain === 'umak.edu.ph' && !emailLower.includes('student')) {
      // Non-student UMAK email - could be faculty
      // Keep the requested role or default to faculty if not specified
      assignedRole = role === 'student' ? 'student' : (role || 'faculty');
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');

    // Create user
    const user = await db.user.create({
      data: {
        email: emailLower,
        password: hashedPassword,
        displayName: displayName.trim(),
        role: assignedRole,
        verificationToken,
        // Auto-verify for now (in production, send email)
        emailVerified: new Date(),
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
      },
    });

    // If student, create student profile
    if (assignedRole === 'student') {
      await db.studentProfile.create({
        data: {
          userId: user.id,
          studentNumber: studentNumber || null,
          yearLevel: yearLevel || null,
          program: program || null,
        },
      });
    }

    // Log activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        entityType: 'user',
        entityId: user.id,
        action: 'signup',
        metadata: JSON.stringify({
          email: emailLower,
          role: assignedRole,
        }),
      },
    });

    // In production, you would send a verification email here
    // await sendVerificationEmail(emailLower, verificationToken);

    return apiResponse({
      message: 'Account created successfully. You can now sign in.',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/auth/signup/validate-email - Check if email is valid for signup
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return apiResponse({ valid: false, message: 'Email is required' });
    }

    const emailLower = email.toLowerCase().trim();
    const emailDomain = emailLower.split('@')[1];

    // Check if email domain is allowed
    const isAllowed = ALLOWED_DOMAINS.includes(emailDomain);

    if (!isAllowed) {
      return apiResponse({
        valid: false,
        message: 'Only UMAK email addresses (@umak.edu.ph, @student.umak.edu.ph) are allowed',
        suggestion: emailDomain === 'gmail.com' 
          ? 'Please use your official UMAK email address'
          : null,
      });
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: emailLower },
      select: { id: true },
    });

    if (existingUser) {
      return apiResponse({
        valid: false,
        message: 'An account with this email already exists',
        exists: true,
      });
    }

    // Determine suggested role based on email
    let suggestedRole = 'student';
    if (emailDomain === 'umak.edu.ph' && !emailLower.includes('student')) {
      suggestedRole = 'faculty';
    }

    return apiResponse({
      valid: true,
      message: 'Email is valid for signup',
      suggestedRole,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
