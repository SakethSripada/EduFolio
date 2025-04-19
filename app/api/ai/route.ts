import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { hasAvailableAICredits, trackAIUsage } from '@/lib/subscription';

export async function POST(request: Request) {
  try {
    // Initialize supabase client
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has subscription access
    const hasAccess = await hasAvailableAICredits(session.user.id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'No AI credits available' },
        { status: 403 }
      );
    }

    const { prompt, max_tokens = 800, temperature = 0.7 } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Add system message to ensure concise responses
    const systemMessage = 
      "You are a helpful AI assistant for a college application platform. " +
      "Keep your responses concise, direct, and to the point. " +
      "Avoid lengthy explanations and unnecessary details. " +
      "Provide specific, actionable advice when asked. " +
      "Do not repeat information that's already been provided.";

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      system: systemMessage,
      maxTokens: max_tokens,
      temperature: temperature,
    });

    // Track AI usage
    await trackAIUsage(session.user.id);

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error in AI API route:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
} 