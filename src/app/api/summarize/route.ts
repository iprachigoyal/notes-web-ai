import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes text concisely.'
          },
          {
            role: 'user',
            content: `Please summarize the following text in a concise manner:\n\n${text}`
          }
        ],
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ summary: data.choices[0].message.content });
  } catch (error) {
    console.error('Error summarizing text:', error);
    return NextResponse.json({ error: 'Failed to summarize text' }, { status: 500 });
  }
}