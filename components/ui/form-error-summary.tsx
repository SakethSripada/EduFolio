import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface FormErrorSummaryProps {
  errors: Record<string, string>
  show: boolean
}

/**
 * Component to display a summary of form validation errors
 */
export function FormErrorSummary({ errors, show }: FormErrorSummaryProps) {
  const errorList = Object.entries(errors)
  
  if (!show || errorList.length === 0) {
    return null
  }
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        <p className="mb-2">Please fix the following errors:</p>
        <ul className="list-disc pl-5">
          {errorList.map(([field, message]) => (
            <li key={field}>{message}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
} 