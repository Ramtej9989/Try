import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  withBorder?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, withBorder = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-lg shadow", 
          withBorder && "border border-gray-200", 
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
      />
    );
  }
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
      />
    );
  }
);
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm text-gray-500", className)}
        {...props}
      />
    );
  }
);
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("p-6 pt-0", className)}
        {...props}
      />
    );
  }
);
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
      />
    );
  }
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
