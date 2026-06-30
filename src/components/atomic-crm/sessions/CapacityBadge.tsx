import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CapacityBadgeProps {
  nbBooked: number;
  capacity: number;
  overbooking: number;
  className?: string;
}

/**
 * Returns the Tailwind color classes for a capacity level.
 *
 * Thresholds:
 * - green  : nb_booked < capacity
 * - amber  : capacity <= nb_booked < capacity + overbooking
 * - red    : nb_booked >= capacity + overbooking (bookable max reached)
 *
 * Exported so that session chips in the calendar can reuse the same semantics
 * without importing the full badge component.
 */
export function getCapacityColorClass(
  nbBooked: number,
  capacity: number,
  overbooking: number,
): string {
  const bookableMax = capacity + overbooking;
  if (nbBooked >= bookableMax)
    return "bg-destructive text-white border-transparent";
  if (nbBooked >= capacity) return "bg-amber-500 text-white border-transparent";
  return "bg-green-600 text-white border-transparent";
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

  const colorClass = getCapacityColorClass(nbBooked, capacity, overbooking);

  return (
    <Badge className={cn(colorClass, className)} data-testid="capacity-badge">
      {label}
    </Badge>
  );
};
