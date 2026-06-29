import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory cache so the same article isn't re-summarized on repeat clicks
const cache = new Map<string, string>();

function extractText(html: string): string {
  return html
    .replace(/<(script|style|nav|footer|header|aside|form|iframe)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 10000);
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

  if (cache.has(url)) return NextResponse.json({ summary: cache.get(url) });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 });
  }

  let articleText = '';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,*/*',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    articleText = extractText(await res.text());
  } catch (e) {
    return NextResponse.json({ error: `Could not fetch article: ${(e as Error).message}` }, { status: 502 });
  }

  if (!articleText || articleText.length < 100) {
    return NextResponse.json({ error: 'Article content too short to summarize' }, { status: 422 });
  }

  const client = new Anthropic();
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `You are a cybersecurity analyst. Summarize this article in 4-5 bullet points. Be specific and technical. Focus on: what happened, who is affected, the attack method or vulnerability, and any recommended action.\n\nArticle:\n${articleText}`,
    }],
  });

  const summary = (message.content[0] as { type: string; text: string }).text;
  cache.set(url, summary);

  return NextResponse.json({ summary });
}
