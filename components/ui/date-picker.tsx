"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

// A simplified date picker that doesn't rely on date-fns or react-day-picker
interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
}

export function DatePicker({ date, setDate, disabled }: DatePickerProps) {
  // Format date using native JavaScript
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  // Handle direct input of date
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = new Date(e.target.value);
    if (!isNaN(inputDate.getTime())) {
      // Check if the date should be disabled
      if (disabled && disabled(inputDate)) {
        return;
      }
      setDate(inputDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? formatDate(date) : <span>Select date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-3">
          <Input 
            type="date"
            value={date ? date.toISOString().split('T')[0] : ''}
            onChange={handleInputChange}
          />
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                if (!(disabled && disabled(today))) {
                  setDate(today);
                }
              }}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDate(undefined)}
            >
              Clear
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 