import { NextRequest, NextResponse } from 'next/server';
import { validateSpreadsheet } from '@/lib/sheets/sheetsService';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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
    
    // קבלת מזהה הגיליון מפרמטרי ה-URL
    const searchParams = request.nextUrl.searchParams;
    const spreadsheetId = searchParams.get('spreadsheetId');
    
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'Missing spreadsheetId parameter' },
        { status: 400 }
      );
    }
    
    // אימות הגיליון
    const validationResult = await validateSpreadsheet(spreadsheetId);
    
    return NextResponse.json(validationResult);
  } catch (error: any) {
    console.error('Error validating spreadsheet:', error);
    
    return NextResponse.json(
      { 
        valid: false,
        message: error.message || 'An error occurred while validating the spreadsheet'
      },
      { status: 500 }
    );
  }
} 