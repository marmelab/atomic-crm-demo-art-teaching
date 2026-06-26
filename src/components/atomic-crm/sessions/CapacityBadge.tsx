import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CapacityBadgeProps {
  nbBooked: number;
  capacity: number;
  overbooking: number;
  className?: string;
}

/**
 * Displays a booking count badge with color thresholds:
 * - green  : nb_booked < capacity
 * - amber  : capacity <= nb_booked < capacity + overbooking
 * - red    : nb_booked >= capacity + overbooking (bookable max reached)
 */
export const CapacityBadge = ({
  nbBooked,
  capacity,
  overbooking,
  className,
}: CapacityBadgeProps) => {
  const bookableMax = capacity + overbooking;
  const label = `${nbBooked}/${bookableMax}`;

  const colorClass =
    nbBooked >= bookableMax
      ? "bg-destructive text-white border-transparent"
      : nbBooked >= capacity
        ? "bg-amber-500 text-white border-transparent"
        : "bg-green-600 text-white border-transparent";

  return (
    <Badge className={cn(colorClass, className)} data-testid="capacity-badge">
      {label}
    </Badge>
  );
};
