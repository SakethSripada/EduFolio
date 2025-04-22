import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(request: Request) {
  try {
    const { messages = [], prompt, max_tokens = 800, temperature = 0.7 } = await request.json();
    
    if (!messages.length && !prompt) {
      return NextResponse.json(
        { error: 'Either messages or prompt is required' },
        { status: 400 }
      );
    }

    // Add system message to ensure concise responses and guide on user profile data
    const systemMessage = 
      "You are a helpful AI assistant for a college application platform called EduFolio. " +
      "Keep your responses concise, direct, and to the point. " +
      "Avoid lengthy explanations and unnecessary details. " +
      "Provide specific, actionable advice when asked. " +
      "Do not repeat information that's already been provided.\n\n" +
      "When the user's profile data is provided, you have access to:\n" +
      "- Basic profile information (name, school, graduation year)\n" +
      "- Academic records (courses, grades, GPA)\n" +
      "- Test scores (SAT, ACT, AP, etc.)\n" +
      "- Extracurricular activities\n" +
      "- Awards and honors\n" +
      "- Essays (drafts and completed)\n" +
      "- College-specific application materials\n" +
      "- Todos and application deadlines\n\n" +
      "Use this information to provide personalized, relevant advice for college applications, " +
      "essay writing, activity description improvements, and application strategy.";

    // Use conversation history if provided, otherwise use single prompt
    let result;
    
    if (messages.length) {
      // Use conversation history
      result = await generateText({
        model: openai("gpt-4o"),
        messages: messages,
        system: systemMessage,
        maxTokens: max_tokens,
        temperature: temperature,
      });
    } else {
      // Fallback to single prompt mode
      result = await generateText({
        model: openai("gpt-4o"),
        prompt,
        system: systemMessage,
        maxTokens: max_tokens,
        temperature: temperature,
      });
    }

    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error('Error in AI API route:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
} 