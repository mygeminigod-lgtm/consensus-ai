import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'History is stored client-side in localStorage. No server-side storage configured.',
    storageType: 'localStorage'
  });
}
