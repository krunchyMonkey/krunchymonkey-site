import type { ComponentProps } from "react";
import { cn } from "../utils";

export function ShadcnCard({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="card" className={cn("flex flex-col gap-4 rounded-xl border py-4", className)} {...props} />;
}

export function ShadcnCardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="card-header" className={cn("grid gap-2 px-4", className)} {...props} />;
}

export function ShadcnCardTitle({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="card-title" className={cn("font-semibold", className)} {...props} />;
}

export function ShadcnCardDescription({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="card-description" className={cn("text-sm", className)} {...props} />;
}

export function ShadcnCardContent({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-4", className)} {...props} />;
}

export function ShadcnCardFooter({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("flex items-center px-4", className)} {...props} />;
}
