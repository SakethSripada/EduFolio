"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

// Shared module state for all modal components
const modalState = {
  openCount: 0,
  hasAppliedFix: false,
  scrollbarWidth: 0,
  scrollY: 0,
  bodyPaddingRight: ''
};

// Reuse the same hook pattern as in dialog.tsx
const useSheetContentShiftFix = (open: boolean) => {
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

const Sheet = ({ open, onOpenChange, ...props }: SheetPrimitive.DialogProps) => {
  // Use our custom hook to prevent content shift
  useSheetContentShiftFix(open || false);
  
  return <SheetPrimitive.Root open={open} onOpenChange={onOpenChange} {...props} />;
}

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
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
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
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
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
