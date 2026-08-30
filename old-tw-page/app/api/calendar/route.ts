import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getCalendarEventsByUserId, getCalendarEventsByDateRange, createCalendarEvent } from '@/lib/calendar-events';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let events;
    if (startDate && endDate) {
      events = getCalendarEventsByDateRange(decoded.userId, startDate, endDate);
    } else {
      events = getCalendarEventsByUserId(decoded.userId);
    }

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Get calendar events error:', error);
    return NextResponse.json(
      { error: 'Failed to get calendar events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, startDate, endDate, allDay, location, color, reminderMinutes, recurrence, testWeekId, subjectId } = body;

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Title, start date, and end date are required' },
        { status: 400 }
      );
    }

    const event = createCalendarEvent(decoded.userId, {
      title,
      description,
      startDate,
      endDate,
      allDay: allDay || false,
      location,
      color,
      reminderMinutes,
      recurrence,
      testWeekId,
      subjectId,
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Create calendar event error:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}
