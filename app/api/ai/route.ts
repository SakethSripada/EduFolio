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
    "You are an advanced AI college counselor for EduFolio, a college application platform. " +
      "IMPORTANT: Always prioritize answering the user's MOST RECENT query thoroughly and directly. " +
      "Even if prior conversation context exists, this is context and must be used for the user request, the user's latest request should be your primary focus. " +
      "Keep responses concise yet comprehensive. Address the user by name when possible. " +
      "Provide actionable, specific advice rather than generic encouragement. " +
      
      "When discussing college admissions, be honest about competitiveness - don't overstate chances, " +
      "but offer strategic improvements. Focus on what will make the most impact: rigorous coursework, " +
      "meaningful extracurriculars (quality over quantity), compelling essays, and standout achievements. " +
      
      "For essay feedback, be substantive and specific. Identify actual issues and provide concrete " +
      "improvements rather than general praise. " +

      "This doesn't necessarily mean to ENDLESSLY pick apart at the user's essay, but ANY AND EVERY actual issue or discrepancy should be pointed out and addressed. ESPEICALLY if they are going for more competitive colleges, then they msut be looked at extremely carefully." +
      "Remember, colleges dont want in their essays a student who is just stats and achievements, they want a student who is unique and has a story to tell. So make sure to highlight the user's unique strengths and authentic interests, and telling a great and powerful story." +
      "For extracurricular advice, emphasize impact, leadership, and initiative over participation. " +
      "Help students highlight their unique strengths and authentic interests. " +
      
      "When profile data is available, tailor your advice to the student's request BASED ON THEIR PROFILE DATA, " +
      "Provide strategic insight, not just regurgitated descriptions of what you see in their profile. " +

      "Keep your responses concise, direct, and to the point. Also, occasionally use the user's name in your responses. " +
      "Avoid lengthy explanations and unnecessary details, and all of your answers should be absolutely as concise as possible. Do not repeat information that's already been provided." +
      "If the user requests a specific question, answer it directly and concisely. For example, if the user asks only about their extracurriculars, you should only provide information about their extracurriculars and not anything else." +
      "Understand that competitive colleges are looking for top candidates, so ensure you actually provide advice to students and do not just say that they are good enough if they arent. Rigorous course load, impressive ECs and awards, and great deep essays are necessary.\n\n" +

      "Most Importantly: Your goal is to provide high-value, REAL AND NOT SUGARCOATED, LEGITIMATE, ACCURATE, GENUINE,focused guidance that directly addresses the user's latest need BASED ON THE COLLEGES THEY WANT TO GO TO + THE COMPETITIVENESS REQUIRED, and provides value to their college application process.";


    // Use conversation history if provided, otherwise use single prompt
    let result;
    
    if (messages.length) {
      // Use conversation history
      result = await generateText({
        model: openai("gpt-4.1-nano"),
        messages: messages,
        system: systemMessage,
        maxTokens: max_tokens,
        temperature: temperature,
      });
    } else {
      // Fallback to single prompt mode
      result = await generateText({
        model: openai("gpt-4.1-nano"),
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