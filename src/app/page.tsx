import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
 return (
   <div className="flex min-h-screen flex-col items-center p-8 md:p-24">
     <Card className="w-full max-w-4xl">
       <CardHeader className="text-center">
         <CardTitle>Daily Wellness Messages</CardTitle>
         <CardDescription>Sign up to receive daily health and wellness reminders</CardDescription>
       </CardHeader>
       <CardContent>
        <Alert variant="destructive" className="mb-8">
           <AlertCircle className="h-4 w-4" />
           <AlertDescription>
             This service is currently awaiting regulatory approval. Any information entered during this time will not be saved or processed until approval is received. We appreciate your patience and interest.
           </AlertDescription>
         </Alert>

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
                 <h2 className="text-2xl font-bold">Sign Up for Wellness Messages</h2>
                 <p className="text-muted-foreground">Complete this form to receive daily wellness messages</p>
               </div>

               <form className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="fullName">Full Name</Label>
                   <Input id="fullName" placeholder="Your full name" />
                 </div>

                 <div className="space-y-2">
                   <Label htmlFor="phone">Phone Number</Label>
                   <Input id="phone" placeholder="(XXX) XXX-XXXX" />
                 </div>

                 <div className="mt-4 text-sm text-muted-foreground">
                   <p className="font-medium">Your Privacy Matters</p>
                   <p>We will never share or sell your phone number to any third party under any circumstances.</p>
                 </div>

                 <Button type="submit" className="w-full">Sign Up for Messages</Button>

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