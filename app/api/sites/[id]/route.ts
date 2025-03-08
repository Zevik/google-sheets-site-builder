import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - קבלת פרטי אתר ספציפי
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const siteId = params.id;
    
    // בדיקת אימות משתמש
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'אימות נדרש' },
        { status: 401 }
      );
    }
    
    // קבלת פרטי האתר
    const { data: site, error } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: `שגיאה בקבלת פרטי האתר: ${error.message}` },
        { status: 500 }
      );
    }
    
    // בדיקת הרשאות
    if (site.owner_id !== user.id) {
      // בדיקה אם המשתמש הוא משתף פעולה
      const { data: collaborator, error: collabError } = await supabase
        .from('site_collaborators')
        .select('*')
        .eq('site_id', siteId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (collabError || !collaborator) {
        return NextResponse.json(
          { error: 'אין לך הרשאה לגשת לאתר זה' },
          { status: 403 }
        );
      }
    }
    
    // קבלת נתוני המטמון של האתר
    const { data: cacheData, error: cacheError } = await supabase
      .from('cache')
      .select('*')
      .eq('site_id', siteId);
    
    if (cacheError) {
      return NextResponse.json(
        { error: `שגיאה בקבלת נתוני המטמון: ${cacheError.message}` },
        { status: 500 }
      );
    }
    
    // ארגון נתוני המטמון
    const cache: any = {};
    cacheData.forEach((item) => {
      cache[item.sheet_name] = item.data;
    });
    
    return NextResponse.json({
      site,
      cache
    });
  } catch (error: any) {
    console.error('Error fetching site:', error);
    return NextResponse.json(
      { error: `שגיאה בקבלת פרטי האתר: ${error.message}` },
      { status: 500 }
    );
  }
}

// PATCH - עדכון פרטי אתר
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const siteId = params.id;
    
    // בדיקת אימות משתמש
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'אימות נדרש' },
        { status: 401 }
      );
    }
    
    // בדיקת הרשאות
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
        { error: 'אין לך הרשאה לעדכן אתר זה' },
        { status: 403 }
      );
    }
    
    // קבלת נתוני העדכון מגוף הבקשה
    const body = await request.json();
    const { title, slug, spreadsheet_id, language, is_public, custom_domain, theme } = body;
    
    // הכנת אובייקט העדכון
    const updates: any = {
      updated_at: new Date().toISOString()
    };
    
    // הוספת שדות לעדכון רק אם הם קיימים בבקשה
    if (title !== undefined) updates.title = title;
    if (slug !== undefined) {
      // בדיקה שה-slug ייחודי
      if (slug !== site.slug) {
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
      }
      updates.slug = slug;
    }
    if (spreadsheet_id !== undefined) updates.spreadsheet_id = spreadsheet_id;
    if (language !== undefined) updates.language = language;
    if (is_public !== undefined) updates.is_public = is_public;
    if (custom_domain !== undefined) updates.custom_domain = custom_domain;
    if (theme !== undefined) updates.theme = theme;
    
    // עדכון האתר
    const { data: updatedSite, error: updateError } = await supabase
      .from('sites')
      .update(updates)
      .eq('id', siteId)
      .select()
      .single();
    
    if (updateError) {
      return NextResponse.json(
        { error: `שגיאה בעדכון האתר: ${updateError.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ site: updatedSite });
  } catch (error: any) {
    console.error('Error updating site:', error);
    return NextResponse.json(
      { error: `שגיאה בעדכון האתר: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE - מחיקת אתר
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const siteId = params.id;
    
    // בדיקת אימות משתמש
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'אימות נדרש' },
        { status: 401 }
      );
    }
    
    // בדיקת הרשאות
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
        { error: 'אין לך הרשאה למחוק אתר זה' },
        { status: 403 }
      );
    }
    
    // מחיקת המטמון של האתר
    const { error: cacheDeleteError } = await supabase
      .from('cache')
      .delete()
      .eq('site_id', siteId);
    
    if (cacheDeleteError) {
      console.error('Error deleting site cache:', cacheDeleteError);
    }
    
    // מחיקת משתפי הפעולה של האתר
    const { error: collabDeleteError } = await supabase
      .from('site_collaborators')
      .delete()
      .eq('site_id', siteId);
    
    if (collabDeleteError) {
      console.error('Error deleting site collaborators:', collabDeleteError);
    }
    
    // מחיקת האתר
    const { error: deleteError } = await supabase
      .from('sites')
      .delete()
      .eq('id', siteId);
    
    if (deleteError) {
      return NextResponse.json(
        { error: `שגיאה במחיקת האתר: ${deleteError.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting site:', error);
    return NextResponse.json(
      { error: `שגיאה במחיקת האתר: ${error.message}` },
      { status: 500 }
    );
  }
} 