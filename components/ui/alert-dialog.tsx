"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

// Shared module state for all modal components
const modalState = {
  openCount: 0,
  hasAppliedFix: false,
  scrollbarWidth: 0,
  scrollY: 0,
  bodyPaddingRight: ''
};

// Reuse the same hook pattern from dialog.tsx
const useAlertDialogContentShiftFix = (open: boolean) => {
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (open) {
      // Increment counter of open modals
      modalState.openCount++;
      
      // Only apply the fix if this is the first modal being opened
      if (modalState.openCount === 1 && !modalState.hasAppliedFix) {
        // Save current scroll position and body styles
        modalState.scrollY = window.scrollY;
        modalState.bodyPaddingRight = document.body.style.paddingRight;
        
        // Get accurate scrollbar width
        const widthWithScrollbar = document.body.offsetWidth;
        document.body.style.overflow = 'hidden';
        const widthWithoutScrollbar = document.body.offsetWidth;
        modalState.scrollbarWidth = widthWithoutScrollbar - widthWithScrollbar;
        
        // Set padding right to compensate for scrollbar disappearance
        if (modalState.scrollbarWidth > 0) {
          document.body.style.paddingRight = `${modalState.scrollbarWidth}px`;
        }
        
        // Prevent scroll but maintain layout
        document.body.style.position = 'fixed';
        document.body.style.top = `-${modalState.scrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';
        
        modalState.hasAppliedFix = true;
      }
    } else {
      // Decrement counter when modal closes
      if (modalState.openCount > 0) {
        modalState.openCount--;
      }
      
      // Only remove the fix if all modals are closed
      if (modalState.openCount === 0 && modalState.hasAppliedFix) {
        // Restore all styles
        document.body.style.position = '';
        document.body.style.overflow = '';
        document.body.style.paddingRight = modalState.bodyPaddingRight;
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        
        // Restore scroll position
        window.scrollTo(0, modalState.scrollY);
        
        modalState.hasAppliedFix = false;
      }
    }
    
    return () => {
      // Clean up on unmount - treat as if modal closed
      if (open) {
        if (modalState.openCount > 0) {
          modalState.openCount--;
        }
        
        // Only remove the fix if all modals are closed
        if (modalState.openCount === 0 && modalState.hasAppliedFix) {
          // Restore all styles
          document.body.style.position = '';
          document.body.style.overflow = '';
          document.body.style.paddingRight = modalState.bodyPaddingRight;
          document.body.style.top = '';
          document.body.style.left = '';
          document.body.style.right = '';
          document.body.style.width = '';
          
          // Restore scroll position
          window.scrollTo(0, modalState.scrollY);
          
          modalState.hasAppliedFix = false;
        }
      }
    };
  }, [open]);
};

const AlertDialog = ({ open, onOpenChange, ...props }: AlertDialogPrimitive.AlertDialogProps) => {
  // Use our custom hook to prevent content shift
  useAlertDialogContentShiftFix(open || false);
  
  return <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange} {...props} />
}

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
