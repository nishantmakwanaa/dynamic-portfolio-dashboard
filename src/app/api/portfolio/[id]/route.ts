import { NextRequest, NextResponse } from 'next/server';
import { saveHolding, deleteHolding } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await saveHolding({
      ...body,
      id,
      purchasePrice: Number(body.purchasePrice),
      quantity: Number(body.quantity),
      cmp: body.cmp ? Number(body.cmp) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update holding' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteHolding(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Holding not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Holding deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete holding' },
      { status: 500 }
    );
  }
}
