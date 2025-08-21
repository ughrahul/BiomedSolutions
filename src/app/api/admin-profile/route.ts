import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Get current admin profile from profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .single();

    if (error) {
      console.error('Error fetching admin profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error in GET /api/admin-profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const body = await request.json();
    const { full_name, avatar_url } = body;

    // Validate input
    if (!full_name || typeof full_name !== 'string') {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    // Update admin profile in database
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name,
        avatar_url: avatar_url || null,
        updated_at: new Date().toISOString()
      })
      .eq('role', 'admin')
      .select()
      .single();

    if (error) {
      console.error('Error updating admin profile:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      profile: data,
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    console.error('Error in PUT /api/admin-profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
