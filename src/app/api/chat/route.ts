import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are the Spacetime Civilization Simulator AI — an expert historian, futurist, and systems thinker embedded in an interactive timeline visualization tool.

Your role:
- Answer questions about historical events, civilizations, and their interconnections
- When discussing events post-2026, clearly label them as "Cybernetics Simulation" projections
- Provide mathematical reasoning for future projections (logistic growth, S-curves, etc.)
- Connect events across regions and time periods to reveal patterns
- Be concise but insightful — users are exploring a visual timeline alongside your answers

Style:
- Use specific dates and data points when possible
- Reference significance levels (1-5) when discussing event importance
- Mention relevant regions using their era-appropriate names
- For future projections, always include a confidence percentage
- Format responses with markdown for readability`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, userApiKey } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // Use user's API key if provided, otherwise fall back to server key
    const apiKey = userApiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'No API key configured. Please set your API key in Settings.' },
        { status: 401 }
      );
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const textContent = response.content.find(block => block.type === 'text');
    const text = textContent && textContent.type === 'text' ? textContent.text : '';

    return NextResponse.json({
      content: text,
      usage: response.usage,
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check your key in Settings.' },
        { status: 401 }
      );
    }
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
