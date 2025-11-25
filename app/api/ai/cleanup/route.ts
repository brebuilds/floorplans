import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

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

    // Determine the prompt based on type
    const cleanupPrompt = type === 'site-plan'
      ? `Convert this rough site plan sketch into a clean architectural-style site plan. Preserve proportions exactly. Straighten building outlines, snap angles to 90°, remove jitter, unify line weights, simplify shapes, and clean up labels. Do not redesign or infer changes. Maintain user intent precisely. Return a detailed description of the cleaned floorplan structure that can be used to recreate it as SVG.`
      : `Convert this rough sketch into a clean architectural-style floorplan. Preserve proportions exactly. Straighten walls, snap angles to 90°, remove jitter, unify line weights, simplify shapes, and convert hand-drawn doors/windows into standardized symbols. Do not redesign or infer changes. Maintain user intent precisely. Return a detailed description of the cleaned floorplan structure that can be used to recreate it as SVG.`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o', // Use gpt-4o for vision
      messages: [
        {
          role: 'system',
          content: 'You are an expert architectural draftsman. Analyze floorplan images and provide detailed structural descriptions that can be converted to clean SVG floorplans.',
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
      max_tokens: 2000,
    });

    const description = response.choices[0]?.message?.content || '';

    // For now, return the description. In a full implementation, you might:
    // 1. Parse the description to extract structured data
    // 2. Use another AI call or algorithm to generate SVG
    // 3. Or use a vision model that can output structured data

    return NextResponse.json({
      success: true,
      description,
      cleanedSVG: null, // Would be generated from description in full implementation
    });
  } catch (error: any) {
    console.error('AI cleanup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process cleanup' },
      { status: 500 }
    );
  }
}

