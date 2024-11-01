'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Home() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!name.trim() || !phone.trim()) {
      setError('Please fill in all fields')
      return
    }

    // Phone number validation (basic)
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid phone number in the format (XXX) XXX-XXXX')
      return
    }

    // For now, just show success state
    setSubmitted(true)
    // Later this will submit to your API
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, '')
    
    // Format as (XXX) XXX-XXXX
    if (numbers.length <= 3) {
      return numbers
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
    } else {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Wellness Messages</h1>
          <p className="text-gray-600">Sign up to receive daily health and wellness reminders</p>
        </div>

        <Tabs defaultValue="signup" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="terms">Terms</TabsTrigger>
          </TabsList>

          {/* Sign Up Form */}
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Sign Up for Wellness Messages</CardTitle>
                <CardDescription>
                  Complete this form to receive daily wellness messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!submitted ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                        required
                        type="tel"
                        placeholder="(XXX) XXX-XXXX"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Sign Up for Messages
                    </Button>
                  </form>
                ) : (
                  <Alert>
                    <AlertDescription>
                      Thank you for signing up! You will start receiving daily wellness messages. 
                      You can opt out at any time by replying STOP to any message.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="text-sm text-gray-500">
                By signing up, you agree to our Terms of Service and Privacy Policy.
                Message and data rates may apply.
              </CardFooter>
            </Card>
          </TabsContent>

          {/* About Section */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About Our Wellness Messages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-semibold">Program Overview</h3>
                <p>
                  Our daily wellness message program is provided by Dr. Craig Niederberger and is designed to 
                  support your health journey through gentle, daily reminders and evidence-based wellness tips.
                </p>
                
                <h3 className="font-semibold">What to Expect</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>One message per day at a consistent time</li>
                  <li>Positive, encouraging wellness content</li>
                  <li>Evidence-based health tips and reminders</li>
                  <li>Easy opt-out available at any time</li>
                </ul>

                <h3 className="font-semibold">Message Frequency & Timing</h3>
                <p>
                  Messages are sent once daily. You can expect to receive messages between 9 AM and 5 PM in 
                  your local time zone. Standard message and data rates may apply.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Policy */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-semibold">Information We Collect</h3>
                <p>
                  We collect only the minimum information necessary to provide our wellness message service:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your name (to personalize messages)</li>
                  <li>Phone number (to deliver messages)</li>
                  <li>Message delivery status</li>
                  <li>Opt-out preferences</li>
                </ul>

                <h3 className="font-semibold">How We Use Your Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To send your daily wellness messages</li>
                  <li>To maintain records of your consent as required by law</li>
                  <li>To process and respect opt-out requests</li>
                  <li>To comply with telecommunications regulations</li>
                </ul>

                <h3 className="font-semibold">Data Security</h3>
                <p>
                  Your information is transmitted securely and stored in encrypted format. We do not sell, 
                  rent, or share your personal information with third parties except as required to deliver 
                  our service or comply with legal requirements.
                </p>

                <h3 className="font-semibold">Your Rights</h3>
                <p>
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access your personal information</li>
                  <li>Request deletion of your data</li>
                  <li>Opt-out of messages at any time</li>
                  <li>Contact us with privacy concerns</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Terms of Service */}
          <TabsContent value="terms">
            <Card>
              <CardHeader>
                <CardTitle>Terms of Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-semibold">Service Description</h3>
                <p>
                  By signing up, you agree to receive one daily wellness message. Messages are sent 
                  through our A2P 10DLC verified messaging service. Standard message and data rates may apply.
                </p>

                <h3 className="font-semibold">Message Frequency</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>One message per day</li>
                  <li>Messages sent between 9 AM and 5 PM local time</li>
                  <li>Occasional service updates as needed</li>
                </ul>

                <h3 className="font-semibold">Opt-Out Instructions</h3>
                <p>
                  You can stop receiving messages at any time by:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Replying STOP to any message</li>
                  <li>Contacting our support team</li>
                  <li>Emailing your opt-out request</li>
                </ul>

                <h3 className="font-semibold">Important Disclaimers</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Messages are for general wellness purposes only</li>
                  <li>Not a substitute for professional medical advice</li>
                  <li>Consult healthcare providers for medical decisions</li>
                  <li>Message delivery timing may vary</li>
                  <li>Carrier charges may apply</li>
                </ul>

                <h3 className="font-semibold">Consent</h3>
                <p>
                  By signing up, you:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Confirm you are 18 years or older</li>
                  <li>Own or have permission to use the registered phone number</li>
                  <li>Consent to receive automated messages</li>
                  <li>Acknowledge this consent is not a condition of purchase</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}