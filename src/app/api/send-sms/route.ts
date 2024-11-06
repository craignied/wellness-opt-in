import { NextResponse } from 'next/server'
import type { Twilio } from 'twilio'

// Define types for better TypeScript support
type TwilioClient = {
  messages: {
    create: (params: {
      body: string;
      from: string;
      to: string;
    }) => Promise<{ sid: string }>;
    list: (params: { limit: number }) => Promise<any[]>;
  };
}

let client: TwilioClient

// Initialize client only when needed
const getClient = () => {
  if (!client) {
    const twilio = require('twilio')
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    ) as TwilioClient
  }
  return client
}

// Ensure phone number is properly formatted
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

    // Get client instance and send message
    const twilioClient = getClient()
    const twilioMessage = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!,
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
    const twilioClient = getClient()
    await twilioClient.messages.list({ limit: 1 })
    return NextResponse.json({ status: 'healthy' })
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Could not connect to Twilio' },
      { status: 500 }
    )
  }
}