'use client'

import * as React from "react"
import { X } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"


/**
 * @param {object} props
 * @param {(dates: any) => void} props.onSelect
 * @param {() => void} [props.onClose]
 * @param {{ from?: Date, to?: Date } | undefined} [props.initialDates]
 * @param {number} [props.numberOfMonths]
 */
export function DatePicker({ onSelect, onClose, initialDates = undefined, numberOfMonths = 1 }) {
  const [selectedDates, setSelectedDates] = React.useState(initialDates)

  const hasFullRange = Boolean(selectedDates?.from && selectedDates?.to)
  const hasOnlyStart = Boolean(selectedDates?.from && !selectedDates?.to)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-2xl font-semibold">When's your trip?</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 -mr-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900"
            aria-label="Close date picker"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <Calendar
        mode="range"
        numberOfMonths={numberOfMonths}
        selected={selectedDates}
        onSelect={setSelectedDates}
        className="rounded-md border"
      />

      <div className="flex items-center justify-between gap-3 pt-4 w-full">
        <p className="text-xs text-gray-500 flex-1 min-w-0 truncate">
          {hasOnlyStart
            ? "Now pick check-out date"
            : hasFullRange
              ? "Looks good — tap Next"
              : "Pick check-in & check-out"}
        </p>
        <Button
          onClick={() => {
            if (hasFullRange) onSelect(selectedDates)
          }}
          disabled={!hasFullRange}
          className="flex-shrink-0 bg-black text-white hover:bg-black/90 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          Next
        </Button>
      </div>
    </div>
  )
}

