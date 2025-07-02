import { NextRequest, NextResponse } from 'next/server';
import getAIResponse from '@/lib/ai';
import { FoodItemListSchema } from '@/lib/types';


export async function POST(request: NextRequest) {
  try {
    const { prompt, image } = await request.json();
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }
    
    const response = await getAIResponse(prompt, image);
    
    // The response should already be parsed by the AI function
    // but we can validate it again to be safe
    const validatedResponse = FoodItemListSchema.safeParse(response);
    
    if (!validatedResponse.success) {
      console.error('Invalid AI response format:', validatedResponse.error);
      return NextResponse.json(
        { error: 'Invalid response format from AI' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ response: validatedResponse.data });
  } catch (error) {
    console.error('Error analyzing food:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze food' }, 
      { status: 500 }
    );
  }
} 