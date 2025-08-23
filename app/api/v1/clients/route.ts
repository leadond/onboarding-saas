import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { data: clients, error } = await supabase
      .from('clients')
      .select(
        `
        id,
        name,
        email,
        created_at,
        company_id (
          id,
          name
        )
      `
      );

    if (error) {
      console.error('[API_CLIENTS_GET]', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return NextResponse.json(clients);
  } catch (error) {
    console.error('[API_CLIENTS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}