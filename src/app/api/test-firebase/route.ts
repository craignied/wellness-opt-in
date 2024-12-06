import { adminDb } from '@/lib/firebase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const snapshot = await adminDb.collection('subscribers').get();
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ message: 'Admin connection successful', data: docs });
  } catch (error) {
    return NextResponse.json(
      { error: 'Admin connection failed', details: error.message },
      { status: 500 }
    );
  }
}
