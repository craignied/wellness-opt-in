import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    // Parse the form-encoded data from Twilio
    const formData = await request.formData()
    
    // Get relevant fields from Twilio webhook
    const from = formData.get('From') as string // The user's phone number
    const body = formData.get('Body') as string // The message content
    
    // Normalize the message content for comparison
    const normalizedBody = body.trim().toLowerCase()
    
    // Handle different message types
    if (normalizedBody === 'yes' || normalizedBody === 'y') {
      // Update opt-in status
      const { error: dbError } = await supabase
        .from('subscribers')
        .update({ opt_in_completed: true })
        .eq('phone_number', from)

      if (dbError) {
        console.error('Database error:', dbError)
        return new NextResponse(
          '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Sorry, there was an error processing your response. Please try again later.</Message></Response>',
          {
            status: 500,
            headers: {
              'Content-Type': 'application/xml',
            },
          }
        )
      }

      // Send confirmation message
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Thank you for confirming! You are now subscribed to daily wellness messages. Reply STOP at any time to unsubscribe.</Message></Response>',
        {
          status: 200,
          headers: {
            'Content-Type': 'application/xml',
          },
        }
      )
    } 
    else if (normalizedBody === 'stop' || normalizedBody === 'unsubscribe') {
      // Update subscription status
      const { error: dbError } = await supabase
        .from('subscribers')
        .update({ 
          opt_in_completed: false,
          unsubscribed: true
        })
        .eq('phone_number', from)

      if (dbError) {
        console.error('Database error:', dbError)
      }

      // Let Twilio handle the standard STOP response
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        {
          status: 200,
          headers: {
            'Content-Type': 'application/xml',
          },
        }
      )
    }
    else if (normalizedBody === 'start') {
      // Resubscribe user
      const { error: dbError } = await supabase
        .from('subscribers')
        .update({ 
          opt_in_completed: true,
          unsubscribed: false
        })
        .eq('phone_number', from)

      if (dbError) {
        console.error('Database error:', dbError)
      }

      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Welcome back! You are now resubscribed to daily wellness messages.</Message></Response>',
        {
          status: 200,
          headers: {
            'Content-Type': 'application/xml',
          },
        }
      )
    }
    else {
      // Handle any other responses
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>To confirm subscription, please reply YES. Reply STOP to unsubscribe.</Message></Response>',
        {
          status: 200,
          headers: {
            'Content-Type': 'application/xml',
          },
        }
      )
    }

  } catch (error) {
    console.error('Webhook error:', error)
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Message>An error occurred. Please try again later.</Message></Response>',
      {
        status: 500,
        headers: {
          'Content-Type': 'application/xml',
        },
      }
    )
  }
}
