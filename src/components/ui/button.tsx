import { cn } from "@pbd/lib/utils/cn"
import { Slot } from "radix-ui"
import type { ButtonHTMLAttributes, JSX } from "react"

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive"
type ButtonSize = "sm" | "md" | "lg"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  asChild?: boolean
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring",
  secondary: "bg-accent text-foreground hover:bg-accent/70 focus-visible:ring-ring",
  ghost:
    "bg-transparent text-foreground/70 hover:bg-accent hover:text-foreground focus-visible:ring-ring",
  destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
}

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold " +
  "transition-colors focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "disabled:pointer-events-none disabled:opacity-50"

export const Button = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  asChild = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps): JSX.Element => {
  const Component = asChild ? Slot.Root : "button"

  return (
    <Component
      className={cn(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
      disabled={disabled ?? isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {children}
    </Component>
  )
}
