"use client"

import { useState, useEffect, ChangeEvent } from "react"
import { Input } from "@/components/ui/input"
import { ComponentPropsWithoutRef } from "react"

// Create InputProps type from Input component props
type InputProps = ComponentPropsWithoutRef<typeof Input>

interface NumericInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value: number | null
  onChange: (value: number | null) => void
  min?: number
  max?: number
}

/**
 * NumericInput is a component that allows for empty values in number inputs
 * while still supporting min/max validation.
 */
export function NumericInput({
  value,
  onChange,
  min,
  max,
  ...props
}: NumericInputProps) {
  // Use a string state to handle the input value
  const [inputValue, setInputValue] = useState<string>(value === null ? "" : value.toString())

  // Update inputValue when value prop changes
  useEffect(() => {
    setInputValue(value === null ? "" : value.toString())
  }, [value])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value

    // Always update the internal string state
    setInputValue(val)

    // If empty, pass null to onChange
    if (val === "") {
      onChange(null)
      return
    }

    // Convert to number and validate
    const numValue = parseFloat(val)
    
    // Check if it's a valid number
    if (!isNaN(numValue)) {
      // Apply min/max constraints if provided
      if (min !== undefined && numValue < min) {
        return
      }
      if (max !== undefined && numValue > max) {
        return
      }
      
      onChange(numValue)
    }
  }

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*\.?[0-9]*"
      value={inputValue}
      onChange={handleChange}
    />
  )
} 