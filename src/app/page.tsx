'use client'

import { useEffect, useState } from "react"
import { db } from '@/lib/firebase/client'
import { collection, getDocs } from 'firebase/firestore'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function testFirebase() {
      try {
        console.log('Testing simple Firebase query...');
        const subscribersRef = collection(db, 'subscribers');
        const snapshot = await getDocs(subscribersRef);
        console.log('Number of subscribers:', snapshot.size);
        snapshot.forEach(doc => console.log(doc.id, doc.data()));
      } catch (error) {
        console.error('Firebase error:', error);
      }
    }
    testFirebase();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('1. Form submission started');
    setIsSubmitting(true)
    setError(null)
    
    try {
      console.log('2. About to make fetch request', {
        fullName: formData.fullName,
        phoneNumber: formData.phone
      });

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phoneNumber: formData.phone
        }),
      })

      console.log('3. Received response:', response.status);
      const data = await response.json()
      console.log('4. Parsed response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      console.log('5. Setting success state');
      setSuccess(true)
      setFormData({ fullName: "", phone: "" })
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit form')
    } finally {
      console.log('6. Submit process complete');
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-8 md:p-24">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle>Daily Wellness Messages</CardTitle>
          <CardDescription>Sign up to receive daily health and wellness reminders</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="terms">Terms</TabsTrigger>
            </TabsList>

            <TabsContent value="signup">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold">Enrollment Form</h2>
                  <p className="text-muted-foreground">Complete this form to receive daily wellness messages</p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <AlertDescription>
                      Thank you for signing up! Please check your phone for a confirmation message and reply YES to start receiving wellness messages.
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      placeholder="Your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      placeholder="(XXX) XXX-XXXX"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      autoComplete="tel"
                      type="tel"
                    />
                  </div>

                  <div className="mt-4 text-sm text-muted-foreground">
                    <p className="font-medium">Your Privacy Matters</p>
                    <p>We will never share or sell your phone number to any third party under any circumstances.</p>
                  </div>

                  <Button 
                    type="submit"
                    variant="outline"
                    className="w-full max-w-md mx-auto block"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing up..." : "Sign Up for Messages"}
                  </Button>

                  <p className="text-sm text-muted-foreground">
                    By signing up, you agree to our Terms of Service and Privacy Policy. Message and data rates may apply.
                  </p>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="about">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">About Our Wellness Messages</h2>
                <p>Our daily wellness messages are designed to help you maintain a healthy lifestyle through regular reminders and evidence-based health tips.</p>
              </div>
            </TabsContent>

            <TabsContent value="privacy">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Privacy Policy</h2>
                <p>We take your privacy seriously. We will never share or sell your personal information to any third party under any circumstances.</p>
                <p>Your phone number is used solely for delivering wellness messages and will be stored securely with industry-standard encryption.</p>
              </div>
            </TabsContent>

            <TabsContent value="terms">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Terms of Service</h2>
                <p>By signing up for our service, you agree to receive daily wellness messages. Message and data rates may apply.</p>
                <p>You can unsubscribe at any time by replying STOP to any message.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}