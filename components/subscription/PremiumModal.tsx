"use client"

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { useSubscription } from './SubscriptionProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export function PremiumModal({ isOpen, onClose, onUpgrade }: PremiumModalProps) {
  const { remainingCredits } = useSubscription();
  
  // Features list for premium plan
  const premiumFeatures = [
    "Unlimited AI-powered writing assistance",
    "Advanced essay analysis and feedback",
    "AI-powered college application advice",
    "Smart GPA calculator and academic planning",
    "Priority support",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl font-bold">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            Upgrade to EduFolio Premium
          </DialogTitle>
          <DialogDescription className="text-lg">
            {remainingCredits > 0 
              ? `You have ${remainingCredits} free AI credits remaining. Upgrade for unlimited access!`
              : "You've used all your free AI credits. Upgrade to continue using AI features!"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Card className="border-2 border-primary">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Premium Plan</CardTitle>
                <Badge className="bg-primary">Best Value</Badge>
              </div>
              <CardDescription>Unlimited AI access and premium features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-3xl font-bold">$9.99</span>
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
          </Card>
        </div>

        <DialogFooter className="flex sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
          <Button onClick={onUpgrade} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Upgrade Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 