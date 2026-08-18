import * as React from "react"
import { cn } from "@/lib/utils"

const MinimalCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-[24px] bg-[#1c1c1e] p-3 flex flex-col overflow-hidden transition-all hover:bg-[#262626]",
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
  <div className="relative w-full aspect-[2/1] rounded-[16px] overflow-hidden bg-[#2c2c2e]">
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
      "font-bold text-white text-[17px] leading-tight mt-3 px-1",
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
    className={cn("text-[14px] text-[#8e8e93] leading-[1.3] mt-1.5 px-1 mb-1", className)}
    {...props}
  />
))
MinimalCardDescription.displayName = "MinimalCardDescription"

export { MinimalCard, MinimalCardImage, MinimalCardTitle, MinimalCardDescription }
