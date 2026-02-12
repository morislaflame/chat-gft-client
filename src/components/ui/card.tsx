import * as React from "react";

import { cn } from "@/lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("card-silver-border rounded-xl p-4", className)}
      {...props}
    />
  )
);

Card.displayName = "Card";

export { Card };
