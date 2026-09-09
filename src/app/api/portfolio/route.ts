import { NextRequest, NextResponse } from 'next/server';
import { getHoldings, saveHolding, connectDB } from '@/lib/db';
import { updateHoldingsWithLiveData } from '@/lib/financeService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const refreshLive = searchParams.get('live') === 'true';

    const isConnected = await connectDB();
    let holdings = await getHoldings();

    if (refreshLive) {
      holdings = await updateHoldingsWithLiveData(holdings);
    }

    return NextResponse.json({
      success: true,
      dbConnected: isConnected,
      count: holdings.length,
      data: holdings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.symbol || !body.sector || !body.purchasePrice || !body.quantity) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (name, symbol, sector, purchasePrice, quantity)' },
        { status: 400 }
      );
    }

    const newHolding = await saveHolding({
      symbol: body.symbol.toUpperCase(),
      name: body.name,
      sector: body.sector,
      purchasePrice: Number(body.purchasePrice),
      quantity: Number(body.quantity),
      yahooSymbol: body.yahooSymbol || `${body.symbol.toUpperCase()}.NS`,
      googleSymbol: body.googleSymbol || `${body.symbol.toUpperCase()}:NSE`,
      cmp: body.cmp ? Number(body.cmp) : Number(body.purchasePrice),
      peRatio: body.peRatio || 'N/A',
      eps: body.eps || 'N/A',
    });

    return NextResponse.json({
      success: true,
      data: newHolding,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save holding' },
      { status: 500 }
    );
  }
}
