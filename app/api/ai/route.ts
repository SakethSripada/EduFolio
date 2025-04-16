import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(request: Request) {
  try {
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

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error in AI API route:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
} 