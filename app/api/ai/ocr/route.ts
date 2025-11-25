import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { OCRResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const ocrPrompt = `Identify and transcribe all handwritten or printed text in this sketch or site plan, including labels, unit numbers, room names, dimensions, and notes. For each text element, provide:
1. The exact text content
2. The approximate bounding box coordinates (x, y, width, height) relative to the image
3. The type: "label" (for room names), "measurement" (for dimensions), or "note" (for other text)
4. Your confidence level (0-1)

Return the results as a JSON array of objects with this structure:
[
  {
    "text": "Kitchen",
    "boundingBox": { "x": 100, "y": 200, "width": 80, "height": 20 },
    "type": "label",
    "confidence": 0.95
  }
]`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an OCR expert specializing in architectural drawings. Extract all text with precise bounding boxes.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: ocrPrompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64.startsWith('data:') 
                  ? imageBase64 
                  : `data:image/png;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    
    // Extract results array
    const results: OCRResult[] = parsed.results || parsed || [];

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error('OCR error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process OCR' },
      { status: 500 }
    );
  }
}

