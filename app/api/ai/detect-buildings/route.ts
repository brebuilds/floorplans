import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { BuildingOutline } from '@/types';

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

    const detectionPrompt = `Analyze this site plan image and identify all building outlines. For each building, provide:
1. A suggested name (e.g., "Building A", "Building 4141")
2. The approximate bounding box coordinates (x, y, width, height) relative to the image
3. A description of the building shape

Return the results as a JSON object with this structure:
{
  "buildings": [
    {
      "name": "Building A",
      "boundingBox": { "x": 100, "y": 200, "width": 300, "height": 200 },
      "description": "Rectangular building with dimensions approximately 300x200"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing architectural site plans and identifying building footprints.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: detectionPrompt,
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
    
    // Convert to BuildingOutline format
    const buildings: BuildingOutline[] = (parsed.buildings || []).map((b: any, index: number) => ({
      id: `building-${Date.now()}-${index}`,
      name: b.name || `Building ${index + 1}`,
      x: b.boundingBox?.x || 0,
      y: b.boundingBox?.y || 0,
      width: b.boundingBox?.width || 200,
      height: b.boundingBox?.height || 150,
      path: generatePathFromBoundingBox(b.boundingBox), // Simple rectangular path
    }));

    return NextResponse.json({
      success: true,
      buildings,
    });
  } catch (error: any) {
    console.error('Building detection error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to detect buildings' },
      { status: 500 }
    );
  }
}

function generatePathFromBoundingBox(bbox: { x: number; y: number; width: number; height: number }): string {
  const { x, y, width, height } = bbox;
  // Generate SVG path for rectangle
  return `M${x},${y} L${x + width},${y} L${x + width},${y + height} L${x},${y + height} Z`;
}

