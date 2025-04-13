// Validation utilities for form inputs

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

export const isValidNumber = (value: any): boolean => {
  return !isNaN(Number(value))
}

export const isValidGPA = (gpa: number): boolean => {
  return gpa >= 0 && gpa <= 5.0
}

export const calculateWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export const calculateCharacterCount = (text: string): number => {
  return text.length
}

export const validateRequired = (value: any, fieldName: string): string | null => {
  if (!value && value !== 0) {
    return `${fieldName} is required`
  }
  return null
}

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): string | null => {
  if (value && value.length > maxLength) {
    return `${fieldName} must be less than ${maxLength} characters`
  }
  return null
}

export const validateMinLength = (value: string, minLength: number, fieldName: string): string | null => {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`
  }
  return null
}

export const validateNumberRange = (value: number, min: number, max: number, fieldName: string): string | null => {
  if (value < min || value > max) {
    return `${fieldName} must be between ${min} and ${max}`
  }
  return null
}
