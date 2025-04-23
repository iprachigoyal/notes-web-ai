import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 });
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192', // Change the model here
        messages: [
          {
            role: 'system',
            content: 'You are an assistant that summarizes text concisely.',
          },
          {
            role: 'user',
            content: `Summarize this:\n\n${text}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });
    

    if (!groqResponse.ok) {
      const error = await groqResponse.text();
      console.error('Groq error:', error);
      return NextResponse.json({ error }, { status: groqResponse.status });
    }

    const data = await groqResponse.json();
    const summary = data?.choices?.[0]?.message?.content;

    return NextResponse.json({ summary });
  } catch (err) {
    console.error('Error summarizing:', err);
    return NextResponse.json({ error: 'Failed to summarize text' }, { status: 500 });
  }
}
