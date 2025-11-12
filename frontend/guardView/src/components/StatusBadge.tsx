import { Badge } from '@/components/ui/badge';

type Status = 'pending' | 'approved' | 'rejected' | 'completed';

interface StatusBadgeProps {
  status: Status;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const variants: Record<Status, string> = {
    pending: 'bg-pending text-pending-foreground',
    approved: 'bg-approved text-approved-foreground',
    rejected: 'bg-rejected text-rejected-foreground',
    completed: 'bg-completed text-completed-foreground',
  };

  return (
    <Badge className={variants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
