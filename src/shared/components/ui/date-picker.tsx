"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { Calendar } from "@/shared/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"

type DatePickerProps = {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  name?: string
}

function DatePicker({
  value,
  defaultValue,
  onChange,
  placeholder = "dd/mm/aaaa",
  className,
  disabled,
  name,
}: DatePickerProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "")
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue
  const selected = currentValue ? new Date(`${currentValue}T00:00:00`) : undefined

  const handleSelect = (date: Date | undefined) => {
    const next = date ? format(date, "yyyy-MM-dd") : ""
    if (!isControlled) setInternalValue(next)
    onChange?.(next)
  }

  return (
    <Popover>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-11 w-full justify-start gap-2 rounded-lg px-2.5 shadow-none",
              selected ? "text-ink font-medium" : "text-ink-muted font-normal",
              className
            )}
          />
        }
      >
        <CalendarIcon className="size-4 shrink-0 opacity-60" />
        <span className="flex-1 text-left">
          {selected ? format(selected, "dd/MM/yyyy") : placeholder}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={selected} onSelect={handleSelect} />
      </PopoverContent>
      {name && <input type="hidden" name={name} value={currentValue} readOnly />}
    </Popover>
  )
}

export { DatePicker }
