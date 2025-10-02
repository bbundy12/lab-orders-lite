import { Badge } from "@/components/ui/badge"

interface OrderStatusBadgeProps {
  status: "DRAFT" | "SUBMITTED" | "IN_PROGRESS" | "READY" | "CANCELLED"
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    DRAFT: { variant: "secondary", label: "Draft" },
    SUBMITTED: { variant: "outline", label: "Submitted" },
    IN_PROGRESS: { variant: "default", label: "In Progress" },
    READY: { variant: "default", label: "Ready" },
    CANCELLED: { variant: "destructive", label: "Cancelled" },
  }

  const config = variants[status] || variants.DRAFT

  return (
    <Badge variant={config.variant} className="rounded-lg">
      {config.label}
    </Badge>
  )
}
