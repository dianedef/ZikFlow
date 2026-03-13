import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const hasApiKey = !!process.env.ELEVENLABS_API_KEY;
    
    return NextResponse.json({
      hasApiKey,
      message: hasApiKey ? 'API key is configured' : 'ElevenLabs API key not found'
    });
  } catch (error) {
    console.error('Error checking API key:', error);
    return NextResponse.json(
      { error: 'Failed to check API key status' },
      { status: 500 }
    );
  }
}
