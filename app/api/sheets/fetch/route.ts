import { NextRequest, NextResponse } from 'next/server';
import { fetchAllSheetData } from '@/lib/sheets/sheetsService';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // יצירת לקוח Supabase עם הרשאות מהבקשה
    const supabase = createClient();
    
    // בדיקת אימות משתמש
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'אימות נדרש' },
        { status: 401 }
      );
    }
    
    // קבלת מזהה הגיליון מגוף הבקשה
    const body = await request.json();
    const { spreadsheetId, siteId } = body;
    
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'מזהה גיליון חסר' },
        { status: 400 }
      );
    }
    
    // אם יש מזהה אתר, בדוק שהמשתמש הוא הבעלים
    if (siteId) {
      const { data: site, error: siteError } = await supabase
        .from('sites')
        .select('*')
        .eq('id', siteId)
        .single();
      
      if (siteError) {
        return NextResponse.json(
          { error: `שגיאה בקבלת פרטי האתר: ${siteError.message}` },
          { status: 500 }
        );
      }
      
      if (site.owner_id !== user.id) {
        return NextResponse.json(
          { error: 'אין לך הרשאה לגשת לאתר זה' },
          { status: 403 }
        );
      }
    }
    
    // משיכת כל הנתונים מהגיליון
    const sheetData = await fetchAllSheetData(spreadsheetId);
    
    // עדכון מטמון האתר אם יש מזהה אתר
    if (siteId) {
      // מחיקת מטמון קיים
      await supabase
        .from('cache')
        .delete()
        .eq('site_id', siteId);
      
      // שמירת נתונים חדשים במטמון
      const sheets = ['main_menu', 'pages', 'content', 'settings'];
      const cacheData = [
        { site_id: siteId, sheet_name: 'main_menu', data: sheetData.mainMenu },
        { site_id: siteId, sheet_name: 'pages', data: sheetData.pages },
        { site_id: siteId, sheet_name: 'content', data: sheetData.content },
        { site_id: siteId, sheet_name: 'settings', data: sheetData.settings }
      ];
      
      const { error: cacheError } = await supabase
        .from('cache')
        .insert(cacheData);
      
      if (cacheError) {
        console.error('Error updating cache:', cacheError);
      }
      
      // עדכון זמן משיכה אחרון וגרסת מטמון
      const { error: updateError } = await supabase
        .from('sites')
        .update({
          last_fetched: new Date().toISOString(),
          cache_version: supabase.rpc('increment_cache_version', { site_id: siteId })
        })
        .eq('id', siteId);
      
      if (updateError) {
        console.error('Error updating site:', updateError);
      }
    }
    
    return NextResponse.json(sheetData);
  } catch (error: any) {
    console.error('Error fetching sheet data:', error);
    return NextResponse.json(
      { error: `שגיאה במשיכת נתוני הגיליון: ${error.message}` },
      { status: 500 }
    );
  }
} 