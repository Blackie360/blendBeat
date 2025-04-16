import { cn } from "@/lib/utils"
import type React from "react"

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  cols?: number
}

export function BentoGrid({ children, className, cols = 4, ...props }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(120px,auto)]",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      {...props}
    >
      {children}
    </div>
  )
}

interface BentoGridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg" | "wide" | "tall"
}

export function BentoGridItem({ children, className, size = "sm", ...props }: BentoGridItemProps) {
  const sizeClasses = {
    sm: "col-span-1 row-span-1",
    md: "col-span-1 row-span-2",
    lg: "col-span-2 row-span-2",
    wide: "col-span-2 row-span-1",
    tall: "col-span-1 row-span-2",
  }

  return (
    <div className={cn(sizeClasses[size], className)} {...props}>
      {children}
    </div>
  )
}
