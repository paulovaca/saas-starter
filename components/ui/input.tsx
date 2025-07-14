import * as React from "react";
import styles from "./input.module.css";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(styles.input, className)}
      {...props}
    />
  );
}

export { Input };
