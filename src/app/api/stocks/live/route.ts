import { NextResponse } from 'next/server';
import { getHoldings } from '@/lib/db';
import { updateHoldingsWithLiveData } from '@/lib/financeService';

export async function GET() {
  try {
    const holdings = await getHoldings();
    const updated = await updateHoldingsWithLiveData(holdings);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch live stock data' },
      { status: 500 }
    );
  }
}
