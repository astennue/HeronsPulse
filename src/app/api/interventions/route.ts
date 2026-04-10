import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/interventions - Get interventions (for faculty: sent, for students: received)
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const classId = searchParams.get('classId');

    let whereClause: any = {};

    // Faculty sees interventions they sent
    if (user.role === 'faculty') {
      whereClause.senderId = user.id;
    } else if (user.role === 'student') {
      // Students see interventions they received
      whereClause.receiverId = user.id;
    } else if (user.role === 'super_admin') {
      // Super admin sees all
    }

    if (status) {
      whereClause.status = status;
    }

    if (classId) {
      whereClause.classId = classId;
    }

    const interventions = await db.intervention.findMany({
      where: whereClause,
      include: {
        sender: {
          select: { id: true, displayName: true, email: true, role: true },
        },
        receiver: {
          select: { id: true, displayName: true, email: true, role: true },
        },
        class: {
          select: { id: true, name: true, subjectCode: true, section: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiResponse(interventions);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/interventions - Create a new intervention
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return apiError('Unauthorized', 401);
    }

    const currentUser = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, displayName: true },
    });

    if (!currentUser) {
      return apiError('User not found', 404);
    }

    // Only faculty and super_admin can create interventions
    if (!['faculty', 'super_admin'].includes(currentUser.role)) {
      return apiError('Only faculty and administrators can send interventions', 403);
    }

    const body = await request.json();
    const { receiverId, classId, type, subject, message } = body;

    // Validate required fields
    if (!receiverId) {
      return apiError('Receiver ID is required', 400);
    }

    if (!type || !['warning', 'support', 'meeting', 'reminder'].includes(type)) {
      return apiError('Valid intervention type is required (warning, support, meeting, reminder)', 400);
    }

    if (!subject || subject.trim().length === 0) {
      return apiError('Subject is required', 400);
    }

    if (!message || message.trim().length === 0) {
      return apiError('Message is required', 400);
    }

    // Verify receiver exists and is a student
    const receiver = await db.user.findUnique({
      where: { id: receiverId },
      select: { id: true, displayName: true, role: true },
    });

    if (!receiver) {
      return apiError('Receiver not found', 404);
    }

    if (receiver.role !== 'student') {
      return apiError('Interventions can only be sent to students', 400);
    }

    // If classId is provided, verify the faculty owns the class or is super_admin
    if (classId) {
      const classData = await db.class.findUnique({
        where: { id: classId },
        select: { ownerId: true, name: true },
      });

      if (!classData) {
        return apiError('Class not found', 404);
      }

      if (classData.ownerId !== currentUser.id && currentUser.role !== 'super_admin') {
        return apiError('You can only send interventions for your own classes', 403);
      }

      // Verify receiver is a member of the class
      const membership = await db.classMember.findUnique({
        where: {
          classId_userId: { classId, userId: receiverId },
        },
      });

      if (!membership) {
        return apiError('The student is not a member of this class', 400);
      }
    }

    // Create the intervention
    const intervention = await db.intervention.create({
      data: {
        senderId: currentUser.id,
        receiverId,
        classId: classId || null,
        type,
        subject: subject.trim(),
        message: message.trim(),
      },
      include: {
        sender: {
          select: { id: true, displayName: true, email: true, role: true },
        },
        receiver: {
          select: { id: true, displayName: true, email: true, role: true },
        },
        class: {
          select: { id: true, name: true, subjectCode: true },
        },
      },
    });

    // Create notification for the receiver
    await db.notification.create({
      data: {
        userId: receiverId,
        type: 'intervention_sent',
        title: `New ${type} from ${currentUser.displayName}`,
        body: subject,
        link: '/dashboard',
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId: currentUser.id,
        entityType: 'intervention',
        entityId: intervention.id,
        action: 'created',
        metadata: JSON.stringify({
          type,
          receiverId,
          classId,
        }),
      },
    });

    return apiResponse(intervention, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
