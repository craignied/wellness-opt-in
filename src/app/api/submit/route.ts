import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import twilio from 'twilio'

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioNumber = process.env.TWILIO_PHONE_NUMBER

const client = twilio(accountSid, authToken)

// Validation functions
const validatePhoneNumber = (phone: string): { valid: boolean; formatted: string } => {
  // Remove any non-digit characters except '+'
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // Basic phone number format validation
  // Allows '+' at start, then 10-15 digits
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
    const data = await request.json()
    const { fullName, phoneNumber } = data

    // Validate full name
    const nameValidation = validateFullName(fullName)
    if (!nameValidation.valid) {
      return NextResponse.json(
        { success: false, message: nameValidation.error || 'Invalid name format' },
        { status: 400 }
      )
    }

    // Validate phone number
    const phoneValidation = validatePhoneNumber(phoneNumber)
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid phone number' },
        { status: 400 }
      )
    }

    // Check for existing subscription
    const { data: existingUser } = await supabase
      .from('subscribers')
      .select('id, unsubscribed, opt_in_completed')
      .eq('phone_number', phoneValidation.formatted)
      .single()

    // If user exists but has unsubscribed, allow them to resubscribe
    if (existingUser) {
      if (!existingUser.unsubscribed) {
        return NextResponse.json(
          { success: false, message: 'This phone number is already registered' },
          { status: 400 }
        )
      }

      // Update existing user
      const { error: updateError } = await supabase
        .from('subscribers')
        .update({ 
          full_name: fullName.trim(),
          unsubscribed: false,
          opt_in_completed: false
        })
        .eq('phone_number', phoneValidation.formatted)

      if (updateError) {
        console.error('Database error:', updateError)
        return NextResponse.json(
          { success: false, message: 'Error updating subscription' },
          { status: 500 }
        )
      }
    } else {
      // Store new subscriber in database
      const { error: dbError } = await supabase
        .from('subscribers')
        .insert([
          { 
            full_name: fullName.trim(), 
            phone_number: phoneValidation.formatted,
            opt_in_completed: false,
            unsubscribed: false
          }
        ])

      if (dbError) {
        console.error('Database error:', dbError)
        return NextResponse.json(
          { success: false, message: 'Error saving subscription' },
          { status: 500 }
        )
      }
    }

    // Send initial opt-in message
    try {
      await client.messages.create({
        body: "Welcome to Daily Wellness Messages! Reply YES to confirm your subscription and start receiving daily health tips. Reply STOP at any time to unsubscribe.",
        from: twilioNumber,
        to: phoneValidation.formatted
      })
    } catch (smsError) {
      console.error('SMS error:', smsError)
      // Don't return error to user as we've saved their info
      // They can still opt in when they receive the first automated message
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully registered! Please check your phone for a confirmation message.'
    })

  } catch (error) {
    console.error('Form submission error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process registration' },
      { status: 500 }
    )
  }
}