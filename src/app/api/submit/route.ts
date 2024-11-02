import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Validation functions
const validatePhoneNumber = (phone: string): { valid: boolean; formatted: string } => {
  // Remove any non-digit characters except '+'
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // Basic phone number format validation
  // Allows '+' at start, then 10-15 digits
  const phoneRegex = /^\+?[\d]{10,15}$/
  
  return {
    valid: phoneRegex.test(cleaned),
    formatted: cleaned
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
      .select('id')
      .eq('phone_number', phoneValidation.formatted)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'This phone number is already registered' },
        { status: 400 }
      )
    }

    // Store in database
    const { error: dbError } = await supabase
      .from('subscribers')
      .insert([
        { 
          full_name: fullName.trim(), 
          phone_number: phoneValidation.formatted,
          opt_in_completed: false // Track opt-in status
        }
      ])

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, message: 'Error saving subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully registered for wellness messages'
    })

  } catch (error) {
    console.error('Form submission error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process registration' },
      { status: 500 }
    )
  }
}