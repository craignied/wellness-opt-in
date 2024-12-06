import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const messageBody = formData.get('Body')?.toString().trim().toUpperCase();
    const from = formData.get('From')?.toString();

    console.log('Received SMS:', { from, messageBody });

    if (!from || !messageBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const subscribersRef = adminDb.collection('subscribers');
    const querySnapshot = await subscribersRef
      .where('phone_number', '==', from)
      .get();

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;

      if (messageBody === 'YES') {
        await docRef.update({
          opt_in_completed: true
        });
        return NextResponse.json({
          message: 'Thank you for confirming! You are now subscribed to daily wellness messages. Reply STOP at any time to unsubscribe.'
        });
      }

      if (messageBody === 'STOP') {
        await docRef.update({
          unsubscribed: true
        });
        return NextResponse.json({
          message: 'You have been unsubscribed from daily wellness messages.'
        });
      }
    }

    return NextResponse.json({ message: 'Message received' });

  } catch (error) {
    console.error('SMS webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
