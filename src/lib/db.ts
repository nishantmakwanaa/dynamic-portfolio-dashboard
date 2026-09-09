import mongoose from 'mongoose';
import { Holding } from './types';
import { INITIAL_HOLDINGS } from './initialData';

const MONGODB_URI = process.env.MONGODB_URI || '';

// Mongoose Schema
const HoldingSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    sector: { type: String, required: true },
    purchasePrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    yahooSymbol: { type: String, required: true },
    googleSymbol: { type: String, required: true },
    cmp: { type: Number },
    peRatio: { type: mongoose.Schema.Types.Mixed },
    eps: { type: mongoose.Schema.Types.Mixed },
    marketCap: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const HoldingModel =
  mongoose.models.Holding || mongoose.model('Holding', HoldingSchema);

// In-Memory Storage Fallback when MongoDB is not connected
let memoryHoldings: Holding[] = [...INITIAL_HOLDINGS];

export async function connectDB() {
  if (!MONGODB_URI) {
    return false;
  }
  try {
    if (mongoose.connection.readyState >= 1) {
      return true;
    }
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    return true;
  } catch (error) {
    console.warn('MongoDB connection failed, using in-memory store:', error);
    return false;
  }
}

export async function getHoldings(): Promise<Holding[]> {
  const isConnected = await connectDB();
  if (isConnected) {
    try {
      const docs = await HoldingModel.find().lean();
      if (docs.length === 0) {
        // Auto-seed if DB is empty
        const inserted = await HoldingModel.insertMany(INITIAL_HOLDINGS);
        return inserted.map(docToHolding);
      }
      return docs.map(docToHolding);
    } catch {
      return memoryHoldings;
    }
  }
  return memoryHoldings;
}

export async function saveHolding(holdingData: Omit<Holding, 'id'> & { id?: string }): Promise<Holding> {
  const isConnected = await connectDB();
  if (isConnected) {
    try {
      if (holdingData.id && !holdingData.id.startsWith('hold-')) {
        const updated = await HoldingModel.findByIdAndUpdate(holdingData.id, holdingData, { new: true }).lean();
        if (updated) return docToHolding(updated);
      }
      const created = await HoldingModel.create(holdingData);
      return docToHolding(created.toObject());
    } catch {
      // Fallback
    }
  }

  if (holdingData.id) {
    const idx = memoryHoldings.findIndex((h) => h.id === holdingData.id);
    if (idx !== -1) {
      const updated: Holding = {
        ...memoryHoldings[idx],
        ...holdingData,
        id: holdingData.id,
      };
      memoryHoldings[idx] = updated;
      return updated;
    }
  }

  const newId = `hold-${Date.now()}`;
  const newHolding: Holding = {
    ...holdingData,
    id: newId,
  };
  memoryHoldings.push(newHolding);
  return newHolding;
}

export async function deleteHolding(id: string): Promise<boolean> {
  const isConnected = await connectDB();
  if (isConnected) {
    try {
      if (!id.startsWith('hold-')) {
        await HoldingModel.findByIdAndDelete(id);
        return true;
      }
    } catch {
      // Fallback
    }
  }

  const initialLen = memoryHoldings.length;
  memoryHoldings = memoryHoldings.filter((h) => h.id !== id);
  return memoryHoldings.length < initialLen;
}

export async function resetToDefaultHoldings(): Promise<Holding[]> {
  const isConnected = await connectDB();
  if (isConnected) {
    try {
      await HoldingModel.deleteMany({});
      const docs = await HoldingModel.insertMany(INITIAL_HOLDINGS);
      return docs.map(docToHolding);
    } catch {
      // Fallback
    }
  }
  memoryHoldings = [...INITIAL_HOLDINGS];
  return memoryHoldings;
}

// Helper doc converter
function docToHolding(doc: any): Holding {
  return {
    id: doc._id ? doc._id.toString() : doc.id,
    symbol: doc.symbol,
    name: doc.name,
    sector: doc.sector,
    purchasePrice: Number(doc.purchasePrice),
    quantity: Number(doc.quantity),
    yahooSymbol: doc.yahooSymbol,
    googleSymbol: doc.googleSymbol,
    cmp: doc.cmp !== undefined ? Number(doc.cmp) : undefined,
    peRatio: doc.peRatio,
    eps: doc.eps,
    marketCap: doc.marketCap,
  };
}
