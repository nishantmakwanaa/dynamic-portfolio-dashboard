import { NextResponse } from 'next/server';
import { resetToDefaultHoldings } from '@/lib/db';

export async function POST() {
  try {
    const data = await resetToDefaultHoldings();
    return NextResponse.json({
      success: true,
      message: 'Portfolio reset to default assignment dataset',
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to seed portfolio' },
      { status: 500 }
    );
  }
}
