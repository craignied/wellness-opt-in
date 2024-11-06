import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Define types for better TypeScript support
type TwilioClient = {
  messages: {
    create: (params: {
      body: string;
      from: string;
      to: string;
    }) => Promise<{ sid: string }>;
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

// Validation functions
const validatePhoneNumber = (phone: string): { valid: boolean; formatted: string } => {
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // Basic phone number format validation
  const phoneRegex = /^\+?[\d]{10,15}$/
  
  return {
    valid: phoneRegex.test(cleaned),
    formatted: cleaned.startsWith('+') ? cleaned : `+1${cleaned}`
  }
}

const validateFullName = (name: string): { valid: boolean; error?: string } => {
  const trimmedName = name.trim()
  
  if (trimmedName.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters long' }
  }
  
  if (trimmedName.length > 100) {
    return { valid: false, error: 'Name must be less than 100 characters' }
  }
  
  // Check for basic name characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s'-]+$/
  if (!nameRegex.test(trimmedName)) {
    return { valid: false, error: 'Name contains invalid characters' }
  }
  
  return { valid: true }
}

export async function POST(request: Request) {
  try {
    console.log('Submit endpoint called')
    const data = await request.json()
    console.log('Received data:', data)
    const { fullName, phoneNumber } = data

    // Validate full name
    const nameValidation = validateFullName(fullName)
    if (!nameValidation.valid) {
      console.log('Name validation failed:', nameValidation.error)
      return NextResponse.json(
        { success: false, message: nameValidation.error || 'Invalid name format' },
        { status: 400 }
      )
    }

    // Validate phone number
    const phoneValidation = validatePhoneNumber(phoneNumber)
    if (!phoneValidation.valid) {
      console.log('Phone validation failed for:', phoneNumber)
      return NextResponse.json(
        { success: false, message: 'Please enter a valid phone number' },
        { status: 400 }
      )
    }
    console.log('Validated phone number:', phoneValidation.formatted)

    // Check for existing subscription
    console.log('Checking for existing subscription')
    const { data: existingUser } = await supabase
      .from('subscribers')
      .select('id')
      .eq('phone_number', phoneValidation.formatted)
      .single()

    if (existingUser) {
      console.log('Found existing subscription for:', phoneValidation.formatted)
      return NextResponse.json(
        { success: false, message: 'This phone number is already registered' },
        { status: 400 }
      )
    }

    // Store in database
    console.log('Attempting database insert')
    const { error: dbError } = await supabase
      .from('subscribers')
      .insert([
        { 
          full_name: fullName.trim(), 
          phone_number: phoneValidation.formatted,
          opt_in_completed: false
        }
      ])

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, message: 'Error saving subscription' },
        { status: 500 }
      )
    }
    console.log('Database insert successful')

    // Send initial opt-in message
    try {
      console.log('Initializing Twilio client')
      const twilioClient = getClient()
      console.log('Twilio environment variables:')
      console.log('Account SID length:', process.env.TWILIO_ACCOUNT_SID?.length || 'undefined')
      console.log('Auth Token length:', process.env.TWILIO_AUTH_TOKEN?.length || 'undefined')
      console.log('Phone Number:', process.env.TWILIO_PHONE_NUMBER || 'undefined')
      
      console.log('Attempting to send message to:', phoneValidation.formatted)
      const message = await twilioClient.messages.create({
        body: "Welcome to Daily Wellness Messages! Reply YES to confirm your subscription and start receiving daily health tips. Reply STOP at any time to unsubscribe.",
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: phoneValidation.formatted
      })
      console.log('Twilio message sent successfully:', message.sid)
    } catch (error: any) {
      console.error('SMS error:', error)
      console.error('SMS error details:', {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        stack: error?.stack
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully registered! Please check your phone for a confirmation message.'
    })

  } catch (error: any) {
    console.error('Form submission error:', error)
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    })
    return NextResponse.json(
      { success: false, message: 'Failed to process registration' },
      { status: 500 }
    )
  }
}