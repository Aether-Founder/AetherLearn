import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';

/**
 * DELETE /api/buttons/[id]
 * Delete a button/shortcut
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteClient();
    const { id } = params;

    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user owns this button
    const { data: button, error: fetchError } = await supabase
      .from('content_buttons')
      .select('created_by')
      .eq('id', id)
      .single();

    if (fetchError || !button) {
      return NextResponse.json(
        { error: 'Button not found' },
        { status: 404 }
      );
    }

    if (button.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - you can only delete your own buttons' },
        { status: 403 }
      );
    }

    // Delete the button
    const { error } = await supabase
      .from('content_buttons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting button:', error);
      return NextResponse.json(
        { error: 'Failed to delete button' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting button:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}