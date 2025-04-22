# Form Validation Implementation Guide

This guide outlines how to implement consistent form validation with required field indicators and error summaries across all forms in the EduFolio application.

## Components to Use

1. **`RequiredLabel`**: Used instead of standard `Label` for required fields, adds a red asterisk
2. **`FormErrorSummary`**: Displays a list of all validation errors when a form is submitted

## Implementation Steps for Each Form

### 1. Import Required Components

Add these imports at the top of your component file:

```tsx
import { RequiredLabel } from "@/components/ui/required-label"
import { FormErrorSummary } from "@/components/ui/form-error-summary"
```

### 2. Add Form Submission State

Add a state variable to track when a form has been submitted:

```tsx
const [formSubmitted, setFormSubmitted] = useState(false)
```

### 3. Update Form Submit Handlers

Modify your form submission function to use the pattern:

```tsx
const addSomething = async () => {
  if (!user) return
  
  setFormSubmitted(true)
  
  if (!validateForm()) {
    // Form validation failed, error summary will display
    return
  }

  // Continue with database operation
  performDatabaseOperation(
    // ... database logic ...
    (data) => {
      if (data) {
        // ... success handling ...
        setFormSubmitted(false) // Reset form submission state
        // ... other state resets ...
      }
    },
    // ... error handling ...
  )
}
```

### 4. Add FormErrorSummary to Dialog Content

Add the error summary right after the dialog header:

```tsx
<DialogContent>
  <DialogHeader>
    <DialogTitle>Add Something</DialogTitle>
  </DialogHeader>
  
  <FormErrorSummary errors={formErrors} show={formSubmitted} />
  
  <div className="grid gap-4 py-4">
    {/* Form fields... */}
  </div>
</DialogContent>
```

### 5. Replace Labels with RequiredLabel for Required Fields

Replace standard `Label` components with `RequiredLabel` for all required fields:

```tsx
<div className="grid gap-2">
  <RequiredLabel htmlFor="field-id">Field Name</RequiredLabel>
  <Input
    id="field-id"
    value={value}
    onChange={(e) => setValue(e.target.value)}
  />
  {formErrors.field && <p className="text-xs text-destructive">{formErrors.field}</p>}
</div>
```

For optional fields, continue using the standard `Label` component but mark them explicitly:

```tsx
<Label htmlFor="optional-field">Field Name (Optional)</Label>
```

### 6. Update Error Messages Style

Change error message styles to be consistent:

```tsx
{formErrors.field && <p className="text-xs text-destructive">{formErrors.field}</p>}
```

## Components That Need Updates

Based on the codebase search, these components have forms that need to be updated:

1. ✅ `components/todo/TodoList.tsx` (already updated)
2. ✅ `components/college-application/AcademicsTab.tsx` (already updated)
3. ✅ `components/college-application/AwardsTab.tsx` (already updated)
4. `components/college-application/ExtracurricularsTab.tsx` 
5. `components/college-application/EssaysTab.tsx`
6. `components/college-application/CollegeListTab.tsx`
7. `components/college-application/college-specific/CollegeExtracurriculars.tsx`
8. `components/college-application/college-specific/CollegeAcademics.tsx`
9. `components/college-application/college-specific/CollegeAwards.tsx`
10. `components/college-application/college-specific/CollegeEssays.tsx`
11. `components/college-application/college-specific/CollegeTodos.tsx`
12. `components/portfolio/ProjectsTab.tsx` (if it exists)

## Testing

After implementing these changes, test each form by:

1. Trying to submit without required fields
2. Ensuring the error summary appears with the correct errors
3. Verifying that filling in required fields allows submission
4. Confirming the form resets properly after successful submission

This consistent approach will ensure users always know which fields are required and get clear feedback on validation errors. 