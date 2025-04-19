"use client"

import { useState } from 'react';
import { useSubscription } from '@/components/subscription/SubscriptionProvider';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Sparkles, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { subscription, isLoading, remainingCredits, isPremium, hasUnlimitedAccess } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);

  // Premium features
  const premiumFeatures = [
    "Unlimited AI-powered writing assistance",
    "Advanced essay analysis and feedback",
    "AI-powered college application advice", 
    "Smart GPA calculator and academic planning",
    "Priority support",
  ];

  // Free features
  const freeFeatures = [
    `${remainingCredits} AI credits per month`,
    "Basic essay editing",
    "College application tracking",
    "Portfolio creation",
    "Standard support",
  ];

  // Handle subscription checkout
  const handleSubscribe = async () => {
    setIsProcessing(true);
    
    try {
      // This will be replaced with actual Stripe checkout
      console.log('Starting Stripe checkout process...');
      
      // Redirect to Stripe checkout (placeholder)
      // Will be replaced with actual Stripe implementation
      alert('Stripe checkout will be implemented when API keys are provided');
      
    } catch (error) {
      console.error('Error starting checkout:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle cancellation
  const handleCancelSubscription = async () => {
    setIsProcessing(true);
    
    try {
      // This will be replaced with actual Stripe cancellation
      console.log('Cancelling subscription...');
      
      // Will be replaced with actual Stripe implementation
      alert('Subscription cancellation will be implemented when API keys are provided');
      
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Format subscription period dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Subscription Management</h1>
        
        {/* Current Plan */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Current Plan</h2>
          
          <Card className="border shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {isPremium ? 'Premium Plan' : 'Free Plan'}
                  {isPremium && subscription?.status === 'active' && (
                    <Badge className="ml-2 bg-green-600">Active</Badge>
                  )}
                  {isPremium && subscription?.cancel_at_period_end && (
                    <Badge className="ml-2 bg-amber-600">Cancels at period end</Badge>
                  )}
                </CardTitle>
                {isPremium && (
                  <div className="text-xl font-bold">$9.99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                )}
              </div>
              <CardDescription>
                {isPremium 
                  ? 'You have access to all premium features'
                  : `You have ${remainingCredits} AI credits remaining this month`}
              </CardDescription>
            </CardHeader>
            
            {isPremium && subscription?.current_period_start && (
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <span>Current billing period: {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}</span>
                  </div>
                  {subscription.cancel_at_period_end && (
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="h-5 w-5" />
                      <span>Your subscription will end on {formatDate(subscription.current_period_end)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
            
            <CardFooter className="flex justify-end">
              {isPremium ? (
                <Button 
                  variant="destructive" 
                  onClick={handleCancelSubscription}
                  disabled={isProcessing || subscription?.cancel_at_period_end}
                >
                  {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {subscription?.cancel_at_period_end ? 'Cancellation Scheduled' : 'Cancel Subscription'}
                </Button>
              ) : (
                <Button 
                  onClick={handleSubscribe}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Sparkles className="h-4 w-4" />
                  Upgrade to Premium
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
        
        {/* Plan Comparison */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Compare Plans</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <Card className={`border shadow-sm ${!isPremium ? 'border-primary' : ''}`}>
              <CardHeader>
                <CardTitle>Free Plan</CardTitle>
                <CardDescription>Basic features for getting started</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-2xl font-bold">$0</span>
                  <span className="text-muted-foreground"> / month</span>
                </div>
                
                <ul className="space-y-2">
                  {freeFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {!isPremium ? (
                  <Button variant="outline" disabled className="w-full">Current Plan</Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleCancelSubscription}
                    disabled={isProcessing}
                  >
                    Downgrade
                  </Button>
                )}
              </CardFooter>
            </Card>
            
            {/* Premium Plan */}
            <Card className={`border shadow-sm ${isPremium ? 'border-primary' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Premium Plan</CardTitle>
                  <Badge className="bg-primary">Best Value</Badge>
                </div>
                <CardDescription>Unlimited AI access and premium features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-2xl font-bold">$9.99</span>
                  <span className="text-muted-foreground"> / month</span>
                </div>
                
                <ul className="space-y-2">
                  {premiumFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isPremium ? (
                  <Button variant="outline" disabled className="w-full">Current Plan</Button>
                ) : (
                  <Button 
                    className="w-full gap-2"
                    onClick={handleSubscribe}
                    disabled={isProcessing}
                  >
                    {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Sparkles className="h-4 w-4" />
                    Upgrade
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Have questions about our subscription plans?
          </p>
          <Link href="/support" passHref>
            <Button variant="outline">Contact Support</Button>
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
} 