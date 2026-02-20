import { cn } from 'utils/cn';
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card';
import {
  CalendarClock,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  Timer,
  MessageSquare,
} from 'lucide-react';

const MetricCard = ({ icon: Icon, title, value, subtext, highlight }) => (
  <Card>
    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
      <CardTitle className='text-sm font-medium'>{title}</CardTitle>
      <Icon className='h-4 w-4 text-muted-foreground' />
    </CardHeader>
    <CardContent>
      <div
        className={cn(
          'text-2xl font-bold',
          highlight === 'danger' && 'text-red-600 dark:text-red-400',
          highlight === 'success' && 'text-green-600 dark:text-green-400'
        )}
      >
        {value}
      </div>
      {subtext && <p className='text-xs text-muted-foreground'>{subtext}</p>}
    </CardContent>
  </Card>
);

export const StrategyMetricLabels = ({ strategy, metrics, counts }) => {
  const { status, timeline, current_deadline } = strategy;

  const deadlineDisplay = current_deadline
    ? new Date(current_deadline).toLocaleDateString()
    : 'Not set';

  const daysValue =
    metrics.days_until_deadline != null
      ? metrics.days_until_deadline >= 0
        ? `${metrics.days_until_deadline}d`
        : `${Math.abs(metrics.days_until_deadline)}d`
      : 'N/A';

  const daysSubtext =
    metrics.days_until_deadline != null
      ? metrics.days_until_deadline >= 0
        ? 'remaining'
        : 'ago'
      : 'no deadline set';

  const cards = [
    {
      key: 'status',
      icon: Timer,
      title: 'Status',
      value: status.title,
      subtext: timeline.title,
    },
    {
      key: 'deadline',
      icon: CalendarClock,
      title: 'Deadline',
      value: deadlineDisplay,
      subtext:
        daysSubtext !== 'no deadline set'
          ? `${daysValue} ${daysSubtext}`
          : null,
      highlight: metrics.is_overdue ? 'danger' : undefined,
    },
    {
      key: 'pushes',
      icon: TrendingDown,
      title: 'Deadline Pushes',
      value: metrics.deadline_pushes,
      subtext: 'deadline extensions',
      highlight: metrics.deadline_pushes > 0 ? 'danger' : undefined,
    },
    {
      key: 'activity',
      icon: Activity,
      title: 'Last Activity',
      value:
        metrics.days_since_last_activity != null
          ? metrics.days_since_last_activity === 0
            ? 'Today'
            : `${metrics.days_since_last_activity}d ago`
          : 'None',
      subtext: `${metrics.total_updates} total updates`,
    },
    {
      key: 'comms',
      icon: MessageSquare,
      title: 'Last Comms',
      value:
        metrics.days_since_last_comms != null
          ? metrics.days_since_last_comms === 0
            ? 'Today'
            : `${metrics.days_since_last_comms}d ago`
          : 'Never',
      subtext: `${counts.comments} comments`,
    },
  ];

  if (metrics.completed_on_time === true) {
    cards.push({
      key: 'completion',
      icon: CheckCircle2,
      title: 'Completion',
      value: 'On time',
      subtext: new Date(strategy.completed_at).toLocaleDateString(),
      highlight: 'success',
    });
  } else if (metrics.completed_on_time === false) {
    cards.push({
      key: 'completion',
      icon: XCircle,
      title: 'Completion',
      value: 'Late',
      subtext: new Date(strategy.completed_at).toLocaleDateString(),
      highlight: 'danger',
    });
  }

  return (
    <div className='grid gap-4 grid-cols-2 lg:grid-cols-5'>
      {cards.map((c) => (
        <MetricCard
          key={c.key}
          icon={c.icon}
          title={c.title}
          value={c.value}
          subtext={c.subtext}
          highlight={c.highlight}
        />
      ))}
    </div>
  );
};
