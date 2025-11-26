import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Define the structure for parsed floorplan elements
interface ParsedFloorplanElements {
  rooms: Array<{
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  walls: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    thickness?: number;
  }>;
  doors: Array<{
    x: number;
    y: number;
    width: number;
    rotation: number;
    swing: 'left' | 'right';
  }>;
  windows: Array<{
    x: number;
    y: number;
    width: number;
    rotation: number;
  }>;
  labels: Array<{
    text: string;
    x: number;
    y: number;
    fontSize?: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, type } = await request.json();

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

    // JSON schema for structured output
    const jsonSchema = `{
  "rooms": [{ "name": "string", "x": number, "y": number, "width": number, "height": number }],
  "walls": [{ "x1": number, "y1": number, "x2": number, "y2": number, "thickness": number }],
  "doors": [{ "x": number, "y": number, "width": number, "rotation": number, "swing": "left"|"right" }],
  "windows": [{ "x": number, "y": number, "width": number, "rotation": number }],
  "labels": [{ "text": "string", "x": number, "y": number, "fontSize": number }]
}`;

    // Determine the prompt based on type
    const cleanupPrompt = type === 'site-plan'
      ? `Analyze this site plan image and extract all architectural elements. Return a JSON object with the structure below. Use pixel coordinates based on a 1200x800 canvas. Straighten lines, snap angles to 90 degrees, and clean up the layout.

JSON Schema:
${jsonSchema}

Important:
- Estimate coordinates proportionally based on the image layout
- Room coordinates should represent the top-left corner
- Wall coordinates are start and end points
- Door swing should be "left" or "right" based on hinge position
- Include labels for any visible text in the image
- Return ONLY valid JSON, no additional text`
      : `Analyze this floorplan image and extract all architectural elements. Return a JSON object with the structure below. Use pixel coordinates based on a 1200x800 canvas. Straighten walls, snap angles to 90 degrees, and standardize door/window symbols.

JSON Schema:
${jsonSchema}

Important:
- Estimate coordinates proportionally based on the image layout
- Room coordinates should represent the top-left corner
- Wall coordinates are start and end points (thickness default 3)
- Door width default is 30, window width default is 60
- Door swing should be "left" or "right" based on hinge position
- Include labels for room names and any visible measurements
- Return ONLY valid JSON, no additional text`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert architectural analyst. Analyze floorplan images and extract structural elements as JSON data. Always respond with valid JSON only, no markdown or additional text.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: cleanupPrompt,
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
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content || '';

    // Try to parse the JSON response
    let parsedElements: ParsedFloorplanElements | null = null;
    let description = content;

    try {
      // Remove markdown code blocks if present
      let jsonContent = content.trim();
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.slice(7);
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.slice(3);
      }
      if (jsonContent.endsWith('```')) {
        jsonContent = jsonContent.slice(0, -3);
      }
      jsonContent = jsonContent.trim();

      parsedElements = JSON.parse(jsonContent) as ParsedFloorplanElements;
      description = 'Successfully parsed floorplan elements from image.';
    } catch (parseError) {
      // If parsing fails, return the raw description
      console.warn('Failed to parse AI response as JSON:', parseError);
      description = content;
    }

    return NextResponse.json({
      success: true,
      description,
      cleanedSVG: null,
      parsedElements,
    });
  } catch (error: any) {
    console.error('AI cleanup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process cleanup' },
      { status: 500 }
    );
  }
}

