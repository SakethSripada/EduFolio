import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface RequiredLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
  required?: boolean
}

/**
 * A label component that shows an asterisk for required fields
 */
export function RequiredLabel({ children, required = true, className, ...props }: RequiredLabelProps) {
  return (
    <Label className={cn(className)} {...props}>
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
  )
} 