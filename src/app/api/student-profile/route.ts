import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/student-profile - Get current user's student profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return apiError('Unauthorized', 401);
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return apiError('User not found', 404);
    }

    // Get or create student profile
    let profile = await db.studentProfile.findUnique({
      where: { userId: user.id },
    });

    // Create profile if it doesn't exist (for students)
    if (!profile && user.role === 'student') {
      profile = await db.studentProfile.create({
        data: { userId: user.id },
      });
    }

    return apiResponse(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/student-profile - Update student profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return apiError('Unauthorized', 401);
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return apiError('User not found', 404);
    }

    if (user.role !== 'student') {
      return apiError('Only students can update student profiles', 403);
    }

    const body = await request.json();
    const {
      studentNumber,
      yearLevel,
      program,
      organizations,
      orgPositions,
      extracurricularHours,
      hasPartTimeWork,
      workHoursPerWeek,
      workType,
    } = body;

    // Upsert the profile
    const profile = await db.studentProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        studentNumber,
        yearLevel,
        program,
        organizations: organizations ? JSON.stringify(organizations) : '[]',
        orgPositions: orgPositions ? JSON.stringify(orgPositions) : '[]',
        extracurricularHours: extracurricularHours || 0,
        hasPartTimeWork: hasPartTimeWork || false,
        workHoursPerWeek: workHoursPerWeek || 0,
        workType,
      },
      update: {
        studentNumber,
        yearLevel,
        program,
        organizations: organizations ? JSON.stringify(organizations) : undefined,
        orgPositions: orgPositions ? JSON.stringify(orgPositions) : undefined,
        extracurricularHours,
        hasPartTimeWork,
        workHoursPerWeek,
        workType,
      },
    });

    return apiResponse(profile);
  } catch (error) {
    return handleApiError(error);
  }
}
