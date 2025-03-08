import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateSpreadsheet } from '@/lib/sheets/sheetsService';
import { CreateSiteRequest } from '@/types';

// GET - קבלת כל האתרים של המשתמש המחובר
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // בדיקת אימות משתמש
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'אימות נדרש' },
        { status: 401 }
      );
    }
    
    // קבלת כל האתרים של המשתמש
    const { data: sites, error } = await supabase
      .from('sites')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json(
        { error: `שגיאה בקבלת האתרים: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ sites });
  } catch (error: any) {
    console.error('Error fetching sites:', error);
    return NextResponse.json(
      { error: `שגיאה בקבלת האתרים: ${error.message}` },
      { status: 500 }
    );
  }
}

// POST - יצירת אתר חדש
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // בדיקת אימות משתמש
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'אימות נדרש' },
        { status: 401 }
      );
    }
    
    // קבלת נתוני האתר החדש מגוף הבקשה
    const body: CreateSiteRequest = await request.json();
    const { title, slug, spreadsheet_id, language } = body;
    
    // וידוא שכל השדות הנדרשים קיימים
    if (!title || !slug || !spreadsheet_id || !language) {
      return NextResponse.json(
        { error: 'כל השדות הנדרשים חייבים להיות מלאים' },
        { status: 400 }
      );
    }
    
    // בדיקה שה-slug ייחודי
    const { data: existingSite, error: slugCheckError } = await supabase
      .from('sites')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    
    if (slugCheckError) {
      return NextResponse.json(
        { error: `שגיאה בבדיקת ייחודיות ה-slug: ${slugCheckError.message}` },
        { status: 500 }
      );
    }
    
    if (existingSite) {
      return NextResponse.json(
        { error: 'ה-slug כבר קיים במערכת. אנא בחר slug אחר.' },
        { status: 400 }
      );
    }
    
    // אימות תקינות הגיליון
    const validationResult = await validateSpreadsheet(spreadsheet_id);
    
    if (!validationResult.valid) {
      return NextResponse.json(
        { error: validationResult.message || 'הגיליון אינו תקין' },
        { status: 400 }
      );
    }
    
    // יצירת האתר החדש
    const { data: newSite, error: createError } = await supabase
      .from('sites')
      .insert({
        owner_id: user.id,
        title,
        slug,
        spreadsheet_id,
        language,
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (createError) {
      return NextResponse.json(
        { error: `שגיאה ביצירת האתר: ${createError.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ site: newSite }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating site:', error);
    return NextResponse.json(
      { error: `שגיאה ביצירת האתר: ${error.message}` },
      { status: 500 }
    );
  }
} 