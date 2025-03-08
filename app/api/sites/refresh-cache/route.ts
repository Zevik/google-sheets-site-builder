import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSiteDataWithCache } from '@/lib/sheets/sheetsService';

export async function POST(request: NextRequest) {
  try {
    // בדיקת אימות משתמש
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // קבלת מזהה האתר מגוף הבקשה
    const body = await request.json();
    const { siteId } = body;
    
    if (!siteId) {
      return NextResponse.json(
        { error: 'Missing siteId parameter' },
        { status: 400 }
      );
    }
    
    // קבלת פרטי האתר
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .single();
    
    if (siteError || !site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }
    
    // בדיקה שהמשתמש הוא הבעלים של האתר או מנהל
    const { data: userData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();
    
    if (site.owner_id !== session.user.id && !userData?.is_admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // רענון המטמון
    await getSiteDataWithCache(site.id, site.spreadsheet_id, true);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error refreshing cache:', error);
    
    return NextResponse.json(
      { 
        success: false,
        message: error.message || 'An error occurred while refreshing the cache'
      },
      { status: 500 }
    );
  }
} 