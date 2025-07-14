import * as React from "react";
import { Slot as SlotPrimitive } from "radix-ui";;
import { cva, type VariantProps } from "class-variance-authority";
import styles from "./button.module.css";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  styles.buttonBase,
  {
    variants: {
      variant: {
        default: styles.default,
        destructive: styles.destructive,
        outline: styles.outline,
        secondary: styles.secondary,
        ghost: styles.ghost,
        link: styles.link,
        success: styles.success,
        warning: styles.warning
      },
      size: {
        default: styles.sizeDefault,
        sm: styles.sizeSm,
        lg: styles.sizeLg,
        icon: styles.sizeIcon
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? SlotPrimitive.Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
