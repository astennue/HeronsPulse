import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/analytics/faculty-ali?facultyId=xxx - Get faculty's average student ALI
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return apiError('Unauthorized', 401);
    }

    const currentUser = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!currentUser || !['faculty', 'super_admin'].includes(currentUser.role)) {
      return apiError('Access denied', 403);
    }

    const { searchParams } = new URL(request.url);
    const facultyId = searchParams.get('facultyId');

    // If no facultyId provided, use current user's ID if they are faculty
    const targetFacultyId = facultyId || (currentUser.role === 'faculty' ? currentUser.id : null);

    if (!targetFacultyId) {
      return apiError('Faculty ID is required', 400);
    }

    // Get all classes owned by the faculty
    const facultyClasses = await db.class.findMany({
      where: { ownerId: targetFacultyId },
      select: { id: true, name: true, subjectCode: true },
    });

    if (facultyClasses.length === 0) {
      return apiResponse({
        facultyId: targetFacultyId,
        totalStudents: 0,
        averageALI: 0,
        classes: [],
      });
    }

    const classIds = facultyClasses.map(c => c.id);

    // Get all students in the faculty's classes
    const classMembers = await db.classMember.findMany({
      where: { classId: { in: classIds } },
      select: { userId: true, classId: true },
    });

    const studentIds = [...new Set(classMembers.map(m => m.userId))];

    if (studentIds.length === 0) {
      return apiResponse({
        facultyId: targetFacultyId,
        totalStudents: 0,
        averageALI: 0,
        classes: facultyClasses.map(c => ({
          id: c.id,
          name: c.name,
          subjectCode: c.subjectCode,
          studentCount: 0,
          avgALI: 0,
        })),
      });
    }

    // Get the latest ALI score for each student
    const latestWorkloadData = await db.workloadData.findMany({
      where: { userId: { in: studentIds } },
      orderBy: { recordedDate: 'desc' },
      distinct: ['userId'],
      select: {
        userId: true,
        aliScore: true,
        riskLevel: true,
      },
    });

    // Create a map of userId to their latest ALI
    const userALIMap = new Map(
      latestWorkloadData.map(w => [w.userId, { aliScore: w.aliScore, riskLevel: w.riskLevel }])
    );

    // Calculate class-level statistics
    const classStats = facultyClasses.map(cls => {
      const classStudentIds = classMembers
        .filter(m => m.classId === cls.id)
        .map(m => m.userId);
      
      const classALIScores = classStudentIds
        .map(id => userALIMap.get(id)?.aliScore)
        .filter((score): score is number => score !== undefined);
      
      const avgALI = classALIScores.length > 0
        ? classALIScores.reduce((sum, score) => sum + score, 0) / classALIScores.length
        : 0;

      return {
        id: cls.id,
        name: cls.name,
        subjectCode: cls.subjectCode,
        studentCount: classStudentIds.length,
        avgALI: Math.round(avgALI * 10) / 10,
      };
    });

    // Calculate overall faculty average ALI
    const allALIScores = latestWorkloadData.map(w => w.aliScore);
    const averageALI = allALIScores.length > 0
      ? allALIScores.reduce((sum, score) => sum + score, 0) / allALIScores.length
      : 0;

    // Count risk levels
    const riskCounts = {
      Low: latestWorkloadData.filter(w => w.riskLevel === 'Low').length,
      Moderate: latestWorkloadData.filter(w => w.riskLevel === 'Moderate').length,
      High: latestWorkloadData.filter(w => w.riskLevel === 'High').length,
    };

    return apiResponse({
      facultyId: targetFacultyId,
      totalStudents: studentIds.length,
      averageALI: Math.round(averageALI * 10) / 10,
      riskDistribution: riskCounts,
      classes: classStats,
      students: latestWorkloadData.map(w => ({
        userId: w.userId,
        aliScore: w.aliScore,
        riskLevel: w.riskLevel,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
