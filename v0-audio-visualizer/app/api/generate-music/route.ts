import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export async function POST(request: NextRequest) {
  try {
    const { prompt, musicLengthMs = 30000 } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate music length (10 seconds to 2 minutes)
    if (typeof musicLengthMs !== 'number' || musicLengthMs < 10000 || musicLengthMs > 120000) {
      return NextResponse.json(
        { error: 'Music length must be between 10 seconds (10000ms) and 2 minutes (120000ms)' },
        { status: 400 }
      );
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    // Initialize ElevenLabs client with server-side API key
    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });

    console.log('Generating music with prompt:', prompt);
    
    const track = await elevenlabs.music.compose({
      prompt,
      musicLengthMs,
    });

    // Convert the track stream to a buffer
    const reader = track.getReader();
    const chunks: Uint8Array[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    // Combine all chunks into a single buffer
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const audioBuffer = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      audioBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    console.log('Music generated successfully, size:', audioBuffer.length);

    // Return the audio data directly
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error generating music:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate music. Please try again.' },
      { status: 500 }
    );
  }
}
