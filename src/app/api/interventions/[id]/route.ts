import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/interventions/[id] - Get specific intervention
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const intervention = await db.intervention.findUnique({
      where: { id },
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

    if (!intervention) {
      return apiError('Intervention not found', 404);
    }

    return apiResponse(intervention);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/interventions/[id] - Update intervention (status, notes)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    // Check if intervention exists
    const existingIntervention = await db.intervention.findUnique({
      where: { id },
      select: { id: true, status: true, senderId: true },
    });

    if (!existingIntervention) {
      return apiError('Intervention not found', 404);
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      'pending': ['acknowledged', 'resolved'],
      'acknowledged': ['resolved'],
      'resolved': [], // Cannot change from resolved
    };

    if (status && !validTransitions[existingIntervention.status]?.includes(status)) {
      return apiError(
        `Cannot transition from ${existingIntervention.status} to ${status}`,
        400
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      if (status === 'resolved') {
        updateData.resolvedAt = new Date();
      }
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Update intervention
    const updatedIntervention = await db.intervention.update({
      where: { id },
      data: updateData,
      include: {
        sender: {
          select: { id: true, displayName: true, email: true },
        },
        receiver: {
          select: { id: true, displayName: true, email: true },
        },
        class: {
          select: { id: true, name: true, subjectCode: true },
        },
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId: currentUser.id,
        entityType: 'intervention',
        entityId: id,
        action: 'updated',
        metadata: JSON.stringify({
          previousStatus: existingIntervention.status,
          newStatus: status,
          notes,
        }),
      },
    });

    // Create notification for receiver if status changed
    if (status) {
      await db.notification.create({
        data: {
          userId: updatedIntervention.receiverId,
          type: 'intervention_sent',
          title: 'Intervention Updated',
          body: `Your intervention "${updatedIntervention.subject}" status changed to ${status}`,
          link: '/facility',
        },
      });
    }

    return apiResponse(updatedIntervention);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/interventions/[id] - Delete intervention
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return apiError('Unauthorized', 401);
    }

    const currentUser = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!currentUser || currentUser.role !== 'super_admin') {
      return apiError('Access denied. SuperAdmin only.', 403);
    }

    const { id } = await params;

    const intervention = await db.intervention.findUnique({
      where: { id },
      select: { id: true, subject: true },
    });

    if (!intervention) {
      return apiError('Intervention not found', 404);
    }

    await db.intervention.delete({
      where: { id },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId: currentUser.id,
        entityType: 'intervention',
        entityId: id,
        action: 'deleted',
        metadata: JSON.stringify({ subject: intervention.subject }),
      },
    });

    return apiResponse({ message: 'Intervention deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
