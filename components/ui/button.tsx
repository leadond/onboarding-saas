import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-primary to-primary-600 text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5',
        outline:
          'border-2 border-border bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground hover:border-primary/50 hover:-translate-y-0.5',
        secondary:
          'bg-secondary/80 text-secondary-foreground backdrop-blur-sm hover:bg-secondary shadow-md hover:shadow-lg hover:-translate-y-0.5',
        ghost: 'hover:bg-accent/50 hover:text-accent-foreground backdrop-blur-sm hover:-translate-y-0.5',
        link: 'text-primary underline-offset-4 hover:underline',
        glass: 'bg-glass-medium backdrop-blur-md border border-white/20 text-foreground hover:bg-glass-strong hover:-translate-y-0.5',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 rounded-lg px-4 text-xs',
        lg: 'h-13 rounded-xl px-10 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
