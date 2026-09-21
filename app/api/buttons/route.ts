import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

/**
 * GET /api/buttons
 * Fetch buttons for a specific placement
 * Query params: placement (root|subject|chapter|topic), placementId (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get('placement');
    const placementId = searchParams.get('placementId');

    if (!placement) {
      return NextResponse.json(
        { error: 'Placement parameter is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('content_buttons')
      .select('*')
      .eq('placement', placement)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (placementId) {
      query = query.eq('placement_id', placementId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch buttons' },
        { status: 500 }
      );
    }

    return NextResponse.json({ buttons: data || [] });
  } catch (error) {
    console.error('Error fetching buttons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/buttons
 * Create a new button/shortcut
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      target_type,
      target_id,
      target_path,
      button_text,
      button_icon,
      placement,
      placement_id,
      button_style = 'primary',
    } = body;

    // Validate required fields
    if (!target_type || !target_id || !target_path || !button_text || !placement) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('content_buttons')
      .insert({
        created_by: user.id,
        target_type,
        target_id,
        target_path,
        button_text,
        button_icon,
        placement,
        placement_id: placement_id || null,
        button_style,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating button:', error);
      return NextResponse.json(
        { error: 'Failed to create button' },
        { status: 500 }
      );
    }

    return NextResponse.json({ button: data }, { status: 201 });
  } catch (error) {
    console.error('Error creating button:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}