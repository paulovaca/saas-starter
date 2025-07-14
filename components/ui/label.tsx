"use client";

import * as React from "react";
import { Label as LabelPrimitive } from "radix-ui";;
import styles from "./label.module.css";

import { cn } from "@/lib/utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(styles.label, className)}
      {...props}
    />
  );
}

export { Label };
