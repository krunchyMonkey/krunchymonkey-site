import { type VariantProps, cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../utils";
import {
  ShadcnCard,
  ShadcnCardContent,
  ShadcnCardDescription,
  ShadcnCardFooter,
  ShadcnCardHeader,
  ShadcnCardTitle,
} from "../shadcn/Card";
import "./retro.css";

export const cardVariants = cva("", {
  variants: { font: { normal: "", retro: "retro" } },
  defaultVariants: { font: "retro" },
});

export interface BitCardProps
  extends ComponentProps<"div">,
    VariantProps<typeof cardVariants> {}

export function BitCard({ className, font, ...props }: BitCardProps) {
  return (
    <div className={cn("relative bg-card text-card-foreground border-y-6 border-foreground p-0!", className)}>
      <ShadcnCard
        {...props}
        className={cn(
          "rounded-none border-0 w-full! h-full flex flex-col bg-card text-card-foreground shadow-none",
          font !== "normal" && "retro",
          className,
        )}
      />
      <div className="absolute inset-0 border-x-6 -mx-1.5 border-inherit pointer-events-none" aria-hidden="true" />
    </div>
  );
}

export function BitCardHeader({ className, ...props }: ComponentProps<"div">) {
  return <ShadcnCardHeader className={cn("retro", className)} {...props} />;
}

export function BitCardTitle({ className, ...props }: ComponentProps<"div">) {
  return <ShadcnCardTitle className={cn("retro", className)} {...props} />;
}

export function BitCardDescription({ className, ...props }: ComponentProps<"div">) {
  return <ShadcnCardDescription className={cn("retro", className)} {...props} />;
}

export function BitCardContent({ className, ...props }: ComponentProps<"div">) {
  return <ShadcnCardContent className={cn("retro", className)} {...props} />;
}

export function BitCardFooter({ className, ...props }: ComponentProps<"div">) {
  return <ShadcnCardFooter className={cn("retro", className)} {...props} />;
}
