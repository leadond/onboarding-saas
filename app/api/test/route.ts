import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'success',
    message: 'Onboard Hero API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  })
}