export const METRIC_DEFINITIONS = {
  completion_rate:
    'Completion Rate = (completed / total) \u00d7 100. Percentage of strategies that have been completed.',
  on_time_rate:
    'On-Time Rate = (on_time / (on_time + late)) \u00d7 100. Only counts completed strategies \u2014 incomplete and overdue strategies are excluded.',
  overdue:
    'A strategy is overdue when its deadline has passed and it has not been completed.',
  avg_days_to_complete:
    'Average number of days from creation to completion, computed across all completed strategies.',
  push_rate:
    'Push Rate = (pushed / total with deadlines) \u00d7 100. Percentage of deadline-bearing strategies whose deadline was extended.',
  avg_drift_days:
    'Average of (current deadline \u2212 original deadline) in days, computed only across pushed strategies.',
  days_overdue: 'Days Overdue = today \u2212 current deadline, in whole days.',
  score:
    'Weighted composite: (0.40 \u00d7 completion rate) + (0.35 \u00d7 on-time rate) + (0.25 \u00d7 overdue penalty). Overdue penalty = (1 \u2212 overdue/total) \u00d7 100. Weights are configurable in App Settings.',
  grade:
    'Letter grade from score: A \u2265 90, B \u2265 80, C \u2265 70, D \u2265 60, F < 60. Thresholds are configurable in App Settings.',
  pushed:
    'A strategy has been pushed when its current deadline is later than its original deadline.',
};
