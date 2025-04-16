import type React from "react"
import { cn } from "@/lib/utils"

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {}

export function BentoGrid({ className, children, ...props }: BentoGridProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-max", className)} {...props}>
      {children}
    </div>
  )
}

interface BentoGridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns the item should span */
  colSpan?: number
  /** Number of rows the item should span */
  rowSpan?: number
}

export function BentoGridItem({ className, children, colSpan = 1, rowSpan = 1, ...props }: BentoGridItemProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card text-card-foreground shadow overflow-hidden",
        `col-span-${colSpan} row-span-${rowSpan}`,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
