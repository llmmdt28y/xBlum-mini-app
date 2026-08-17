import * as React from "react"
import { cn } from "@/lib/utils"

const MinimalCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl bg-[#1e1e1e] p-4 flex flex-col gap-3 overflow-hidden transition-all hover:bg-[#262626] border border-[#2c2c2e]",
      className
    )}
    {...props}
  />
))
MinimalCard.displayName = "MinimalCard"

const MinimalCardImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#2c2c2e]">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      ref={ref}
      className={cn("w-full h-full object-cover", className)}
      {...props}
      alt={props.alt || "Card image"}
    />
  </div>
))
MinimalCardImage.displayName = "MinimalCardImage"

const MinimalCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-semibold text-white leading-none tracking-tight text-lg mt-1",
      className
    )}
    {...props}
  />
))
MinimalCardTitle.displayName = "MinimalCardTitle"

const MinimalCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[#8e8e93] leading-snug", className)}
    {...props}
  />
))
MinimalCardDescription.displayName = "MinimalCardDescription"

export { MinimalCard, MinimalCardImage, MinimalCardTitle, MinimalCardDescription }
