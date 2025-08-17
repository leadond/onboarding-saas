import { NextResponse } from 'next/server';

export async function GET() {
  // Log the environment variables to see if they're accessible
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  return NextResponse.json({ 
    success: true,
    message: 'Environment variables check completed',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'UNSET',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'UNSET'
  });
}