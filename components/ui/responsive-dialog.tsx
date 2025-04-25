// Create a responsive dialog component that works better on mobile
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

// Shared module state for all modal components
const modalState = {
  openCount: 0,
  hasAppliedFix: false,
  scrollbarWidth: 0,
  scrollY: 0,
  bodyPaddingRight: '',
  preventReopenMap: new Map<string, boolean>() // Track components that should avoid reopening
};

// Reuse the same hook pattern as in dialog.tsx
const useResponsiveDialogContentShiftFix = (open: boolean) => {
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

// Enhanced ResponsiveDialog with reopening prevention
const ResponsiveDialog = ({ open, onOpenChange, ...props }: DialogPrimitive.DialogProps) => {
  // Generate a stable component ID for this dialog instance
  const [dialogId] = React.useState(() => Math.random().toString(36).slice(2, 10));
  
  // Use our custom hook to prevent content shift
  useResponsiveDialogContentShiftFix(open || false);
  
  // Handle open state changes with reopening prevention
  const handleOpenChange = React.useCallback((newOpenState: boolean) => {
    if (onOpenChange) {
      // If closing, set a flag to prevent immediate reopening
      if (!newOpenState) {
        modalState.preventReopenMap.set(dialogId, true);
        
        // Clear the prevention flag after a short delay
        window.setTimeout(() => {
          modalState.preventReopenMap.delete(dialogId);
        }, 100);
      }
      
      // If attempting to open but prevention is active, ignore it
      if (newOpenState && modalState.preventReopenMap.get(dialogId)) {
        return;
      }
      
      onOpenChange(newOpenState);
    }
  }, [onOpenChange, dialogId]);
  
  return <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange} {...props} />;
}

const ResponsiveDialogTrigger = DialogPrimitive.Trigger

const ResponsiveDialogPortal = DialogPrimitive.Portal

const ResponsiveDialogClose = DialogPrimitive.Close

const ResponsiveDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
))
ResponsiveDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const ResponsiveDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <ResponsiveDialogPortal>
    <ResponsiveDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-w-[90vw] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:max-w-lg overflow-y-auto max-h-[90vh]",
        className,
      )}
      {...props}
    >
      {children}
      <ResponsiveDialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </ResponsiveDialogClose>
    </DialogPrimitive.Content>
  </ResponsiveDialogPortal>
))
ResponsiveDialogContent.displayName = DialogPrimitive.Content.displayName

const ResponsiveDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)
ResponsiveDialogHeader.displayName = "ResponsiveDialogHeader"

const ResponsiveDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
ResponsiveDialogFooter.displayName = "ResponsiveDialogFooter"

const ResponsiveDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
ResponsiveDialogTitle.displayName = DialogPrimitive.Title.displayName

const ResponsiveDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
ResponsiveDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  ResponsiveDialog,
  ResponsiveDialogPortal,
  ResponsiveDialogOverlay,
  ResponsiveDialogClose,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogFooter,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
}
