import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/events - Fetch events based on user role and visibility
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role || 'student';
    const userId = (session.user as any)?.id;

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build visibility filter based on role
    let visibilityFilter: string[] = ['public', 'all'];
    
    if (userRole === 'student') {
      visibilityFilter.push('students');
    } else if (userRole === 'faculty') {
      visibilityFilter.push('faculty', 'students');
    }
    
    // Super admin sees all events
    if (userRole === 'super_admin') {
      visibilityFilter = ['public', 'private', 'students', 'faculty', 'all'];
    }

    // Date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.startDate = { gte: new Date(startDate) };
    }
    if (endDate) {
      dateFilter.endDate = { lte: new Date(endDate) };
    }

    const events = await db.event.findMany({
      where: {
        OR: [
          { visibility: { in: visibilityFilter } },
          { createdById: userId }, // User can always see their own events
        ],
        ...dateFilter,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            displayName: true,
            role: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event (SuperAdmin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;

    // Only SuperAdmin can create system events
    if (userRole !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only administrators can create events' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      startDate,
      endDate,
      allDay,
      startTime,
      endTime,
      location,
      visibility,
      color,
      courseCode,
    } = body;

    if (!title || !startDate) {
      return NextResponse.json(
        { error: 'Title and start date are required' },
        { status: 400 }
      );
    }

    const event = await db.event.create({
      data: {
        title,
        description,
        type: type || 'other',
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        allDay: allDay ?? true,
        startTime,
        endTime,
        location,
        visibility: visibility || 'public',
        color: color || '#1A56DB',
        courseCode,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            displayName: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
