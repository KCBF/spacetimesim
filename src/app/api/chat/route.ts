import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const MAX_MESSAGES = 100; // ~500 sentences across conversation
const MAX_USER_MESSAGE_LENGTH = 2000; // reject spam
const MAX_RESPONSE_TOKENS = 400; // ~200 words

const SYSTEM_PROMPT = `You are the Spacetime Civilization Simulator AI — an expert historian, futurist, data analyst, and systems thinker embedded in an interactive spacetime visualization and global data platform.

STRICT RULES — you MUST follow these:
1. ONLY answer questions related to: history, civilizations, geopolitics, economics, demographics, commodity markets (gold, oil, etc.), country data, technology trends, future projections, and topics covered by this platform.
2. REFUSE any off-topic requests politely. Say: "I can only discuss topics related to history, civilizations, global data, markets, and future simulations."
3. NEVER write code, programming instructions, or technical implementation details.
4. NEVER use emojis or emoticons in your responses.
5. Keep every response under 200 words. Be concise and direct.
6. Use plain markdown formatting: **bold** for emphasis, bullet points for lists, numbers for data. No code blocks.
7. When discussing events post-2026, label them as "Simulation Projection" with a confidence percentage.
8. When discussing commodity prices or market trends, reference historical data points and known incidents.
9. When comparing countries, reference specific metrics (GDP, population, life expectancy, etc.).
10. For future predictions, use mathematical reasoning (logistic growth, S-curves, historical patterns).

Your knowledge covers:
- 175 historical events from Big Bang to present
- 195 country profiles with economic, demographic, and social metrics
- 10 commodity price histories (gold, oil, bitcoin, S&P 500, etc.)
- 36 historic financial incidents
- 55 technology milestones in the tech tree
- Population and GDP data by region across centuries`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, userApiKey } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // Guardrail: limit conversation length
    if (messages.length > MAX_MESSAGES) {
      return NextResponse.json(
        { error: 'Conversation too long. Please start a new chat.' },
        { status: 400 }
      );
    }

    // Guardrail: reject spam / overly long messages
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.content && lastMessage.content.length > MAX_USER_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: 'Message too long. Please keep messages under 2000 characters.' },
        { status: 400 }
      );
    }

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
      max_tokens: MAX_RESPONSE_TOKENS,
      system: SYSTEM_PROMPT,
      messages: messages.slice(-20).map((m: { role: string; content: string }) => ({
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
