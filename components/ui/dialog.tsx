"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({
  open: false,
  onOpenChange: () => {},
});

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>;
}

export function DialogContent({ children, className = "" }: DialogContentProps) {
  const { open, onOpenChange } = React.useContext(DialogContext);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div
        className={`relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto ${className}`}
      >
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 h-8 w-8 p-0"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </Button>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children, className = "" }: DialogHeaderProps) {
  return <div className={`p-6 pb-0 ${className}`}>{children}</div>;
}

export function DialogTitle({ children, className = "" }: DialogTitleProps) {
  return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>;
}

export function DialogDescription({ children, className = "" }: DialogDescriptionProps) {
  return <p className={`text-sm text-muted-foreground mt-1 ${className}`}>{children}</p>;
}
