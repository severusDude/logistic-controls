import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { DeviceStatus } from "@/lib/simcon/types";

const statusDotVariants = cva("inline-flex rounded-full", {
  variants: {
    status: {
      online: "bg-[var(--signal-online)]",
      warning: "bg-[var(--signal-warning)]",
      offline: "bg-[var(--signal-offline)]",
      idle: "bg-[var(--signal-neutral)]",
    },
    pulse: {
      true: "animate-pulse",
      false: "",
    },
    size: {
      sm: "size-2",
      md: "size-2.5",
    },
  },
  defaultVariants: {
    size: "md",
    pulse: false,
  },
});

export function StatusDot({
  className,
  pulse,
  size,
  status,
}: {
  className?: string;
  pulse?: boolean;
  size?: "sm" | "md";
  status: DeviceStatus;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(statusDotVariants({ status, pulse, size }), className)}
    />
  );
}
