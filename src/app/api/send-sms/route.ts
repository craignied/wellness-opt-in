import { NextResponse } from 'next/server'

// Change the twilio import and initialization
const twilio = require('twilio')
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioNumber = process.env.TWILIO_PHONE_NUMBER

const client = twilio(accountSid, authToken)

// The rest stays exactly the same
const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/[^\d+]/g, '')
  return cleaned.startsWith('+') ? cleaned : `+1${cleaned}`
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { phoneNumber, message } = data

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { success: false, message: 'Phone number and message are required' },
        { status: 400 }
      )
    }

    const formattedPhone = formatPhoneNumber(phoneNumber)

    // Send message via Twilio
    const twilioMessage = await client.messages.create({
      body: message,
      from: twilioNumber,
      to: formattedPhone
    })

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      messageId: twilioMessage.sid
    })

  } catch (error) {
    console.error('SMS sending error:', error)
    
    // Return more specific error messages based on the error type
    const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage
      },
      { status: 500 }
    )
  }
}

// Optional: Add a GET endpoint to check service status
export async function GET() {
  try {
    await client.messages.list({ limit: 1 })
    return NextResponse.json({ status: 'healthy' })
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Could not connect to Twilio' },
      { status: 500 }
    )
  }
}