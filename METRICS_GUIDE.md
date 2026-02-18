# CPIC Tracker — Metrics & KPI Calculation Guide

This document explains how every metric and KPI exposed by the `/api/metrics` endpoints is calculated. It serves as a reference for analysts, stakeholders, and frontend developers.

---

## Date Field Semantics

Three date fields on each Strategy drive the analytics:

| Field              | Set When                                | Updatable      | Description                                                                                                                                               |
| ------------------ | --------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initial_deadline` | Strategy created                        | No (immutable) | Auto-computed from `timeline_id` using a fixed plan start date (2024-08-31) + year offset. `null` for "Ongoing" strategies.                               |
| `current_deadline` | Strategy created (= `initial_deadline`) | Yes            | The active, working deadline. When pushed forward, the strategy has been delayed.                                                                         |
| `completed_at`     | Status changes to "Completed"           | Auto-managed   | Auto-set to `NOW()` when status becomes "Completed". Cleared to `null` when status moves away from "Completed". Can also be explicitly set by the client. |

**Timeline → Deadline Mapping:**

| Timeline   | Year Offset | Computed Deadline    |
| ---------- | ----------- | -------------------- |
| Short-Term | +2 years    | 2026-08-31           |
| Mid-Term   | +6 years    | 2030-08-31           |
| Long-Term  | +10 years   | 2034-08-31           |
| Ongoing    | —           | `null` (no deadline) |

---

## Core Definitions

These definitions are used consistently across all metrics endpoints:

### Overdue

A strategy is **overdue** when all three conditions are true:

- `current_deadline` is not null (it has a deadline)
- `current_deadline < NOW()` (the deadline has passed)
- `completed_at` is null (it hasn't been completed)

### On-Time Completion

A completed strategy was **on-time** when:

- `completed_at` is not null AND `current_deadline` is not null
- `completed_at <= current_deadline`

### Late Completion

A completed strategy was **late** when:

- `completed_at` is not null AND `current_deadline` is not null
- `completed_at > current_deadline`

### Pushed (Deadline Drift)

A strategy has been **pushed** when:

- `initial_deadline` is not null AND `current_deadline` is not null
- `current_deadline > initial_deadline`

---

## Common Formulas

| Metric                 | Formula                                            | Notes                                                                                                                             |
| ---------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `completion_rate`      | `(completed / total) * 100`                        | Rounded to 1 decimal. Returns 0 when total is 0.                                                                                  |
| `on_time_rate`         | `(on_time / (on_time + late)) * 100`               | Only considers strategies that have both `completed_at` and `current_deadline`. Returns 0 when denominator is 0.                  |
| `push_rate`            | `(pushed / total_with_deadlines) * 100`            | Percentage of deadline-bearing strategies whose deadline was extended.                                                            |
| `avg_days_to_complete` | `AVG(completed_at - createdAt)` in days            | Computed only over strategies where `completed_at` is not null. Returns 0 when no strategies are completed. Rounded to 1 decimal. |
| `days_overdue`         | `NOW() - current_deadline` in days                 | Whole days (floored).                                                                                                             |
| `days_remaining`       | `deadline_date - NOW()` in days                    | Can be negative if the deadline has passed.                                                                                       |
| `avg_drift_days`       | `AVG(current_deadline - initial_deadline)` in days | Computed only over pushed strategies. Returns 0 when none are pushed. Rounded to 1 decimal.                                       |

---

## Endpoint-by-Endpoint KPI Reference

### `GET /metrics/plan-overview`

Single dashboard-level snapshot of the entire strategic plan.

| Field                  | Formula                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| `total_strategies`     | `COUNT(*)` of all strategies                                                              |
| `completed`            | `COUNT(status_id = 3)`                                                                    |
| `in_progress`          | `COUNT(status_id = 2)`                                                                    |
| `needs_updating`       | `COUNT(status_id = 1)`                                                                    |
| `completion_rate`      | `completed / total_strategies * 100`                                                      |
| `on_time_completions`  | `COUNT(completed_at IS NOT NULL AND completed_at <= current_deadline)`                    |
| `late_completions`     | `COUNT(completed_at IS NOT NULL AND completed_at > current_deadline)`                     |
| `on_time_rate`         | `on_time_completions / (on_time_completions + late_completions) * 100`                    |
| `overdue`              | `COUNT(current_deadline < NOW AND completed_at IS NULL AND current_deadline IS NOT NULL)` |
| `avg_days_to_complete` | `AVG(completed_at - createdAt)` in days across completed strategies                       |

---

### `GET /metrics/completion-by-focus-area`

Same metrics as plan-overview, but grouped per focus area. Each focus area object contains:

| Field                  | Formula                                                |
| ---------------------- | ------------------------------------------------------ |
| `total`                | Strategies where `focus_area_id` matches               |
| `completed`            | Completed strategies in this focus area                |
| `in_progress`          | In-progress strategies in this focus area              |
| `needs_updating`       | Needs-updating strategies in this focus area           |
| `completion_rate`      | `completed / total * 100`                              |
| `overdue`              | Overdue strategies in this focus area                  |
| `avg_days_to_complete` | Average across completed strategies in this focus area |

---

### `GET /metrics/completion-by-timeline`

Progress metrics per timeline tier with deadline intelligence.

| Field                  | Formula                                                                      |
| ---------------------- | ---------------------------------------------------------------------------- |
| `deadline_date`        | Canonical deadline from the timeline mapping (see table above)               |
| `total`                | Strategies in this timeline tier                                             |
| `completed`            | Completed strategies in this tier                                            |
| `completion_rate`      | `completed / total * 100`                                                    |
| `overdue`              | Overdue strategies in this tier                                              |
| `on_time_rate`         | `on_time / (on_time + late) * 100` within this tier                          |
| `days_remaining`       | `deadline_date - NOW()` in days. Negative if past due. `null` for "Ongoing". |
| `avg_days_to_complete` | Average across completed strategies in this tier                             |

---

### `GET /metrics/deadline-drift`

Measures how much the plan has "slipped" from original deadlines.

| Field                          | Formula                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------- |
| `total_with_deadlines`         | Strategies where `initial_deadline IS NOT NULL`                                   |
| `pushed`                       | Strategies where `current_deadline > initial_deadline`                            |
| `push_rate`                    | `pushed / total_with_deadlines * 100`                                             |
| `avg_drift_days`               | `AVG(current_deadline - initial_deadline)` in days, across pushed strategies only |
| `by_timeline[].pushed`         | Pushed count within that timeline tier                                            |
| `by_timeline[].push_rate`      | `pushed / total * 100` within that timeline tier                                  |
| `by_timeline[].avg_drift_days` | Average drift within that timeline tier                                           |

Note: "Ongoing" is excluded from `by_timeline` since those strategies have no deadlines.

---

### `GET /metrics/overdue-strategies`

Flat list of strategies meeting the "overdue" criteria (see Core Definitions above).

| Field                 | Source                                                                          |
| --------------------- | ------------------------------------------------------------------------------- |
| `days_overdue`        | `NOW() - current_deadline` in days                                              |
| `primary_implementer` | Name of the implementer where `is_primary = true` on the join record, or `null` |

Results are ordered by `current_deadline ASC` (most overdue first).

Supports optional filters: `?timeline_id`, `?focus_area_id`, `?implementer_id`.

---

### `GET /metrics/implementer-scorecard`

Graded scorecard per implementer. See "Implementer Grading System" section below for the composite score formula.

Each implementer has:

- `overall` — aggregated stats across all their strategies
- `by_timeline[]` — the same stats broken down per timeline tier

Each stats block contains:

| Field                  | Formula                                              |
| ---------------------- | ---------------------------------------------------- |
| `total`                | Strategies assigned to this implementer              |
| `completed`            | Completed strategies                                 |
| `completion_rate`      | `completed / total * 100`                            |
| `on_time`              | On-time completions                                  |
| `late`                 | Late completions                                     |
| `on_time_rate`         | `on_time / (on_time + late) * 100`                   |
| `overdue`              | Currently overdue strategies                         |
| `avg_days_to_complete` | Average days across completed strategies             |
| `score`                | Composite score (0–100), see grading section         |
| `grade`                | Letter grade derived from score, see grading section |

Results are sorted by `overall.score` descending (best performers first).

Supports `?primary=true` to only grade on strategies where the implementer is the primary assignee.

---

### `GET /metrics/implementer-scorecard/:implementer_id`

Same grading as the list endpoint, plus additional detail:

| Section                | Description                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `by_focus_area[]`      | Same stats block per focus area (only includes focus areas with assigned strategies) |
| `recent_completions[]` | Last 5 completed strategies with `was_on_time` boolean                               |
| `overdue_strategies[]` | All currently overdue strategies with `days_overdue`, sorted most overdue first      |

---

### `GET /metrics/completion-trend`

Completion velocity over time.

| Field        | Formula                                                |
| ------------ | ------------------------------------------------------ |
| `period`     | `YYYY-MM` for monthly, `YYYY-QN` for quarterly         |
| `completed`  | Count of strategies with `completed_at` in this period |
| `cumulative` | Running sum of `completed` across all periods          |

Quarter calculation: `Q = ceil(month / 3)` (Jan–Mar = Q1, Apr–Jun = Q2, etc.)

Supports `?period=monthly|quarterly` and `?focus_area_id` filter.

---

### `GET /metrics/focus-area-progress`

Hierarchical view: Focus Area → Policies → strategy counts.

**Per Focus Area:**

| Field              | Formula                                                  |
| ------------------ | -------------------------------------------------------- |
| `total_strategies` | Sum of strategies across all policies in this focus area |
| `completion_rate`  | `completed / total_strategies * 100`                     |

**Per Policy (within a focus area):**

| Field             | Formula                                |
| ----------------- | -------------------------------------- |
| `total`           | Strategies under this policy           |
| `completed`       | Completed strategies under this policy |
| `completion_rate` | `completed / total * 100`              |
| `overdue`         | Overdue strategies under this policy   |

Policies are ordered by `policy_number ASC`.

---

## Implementer Grading System

The grading system uses a **weighted composite score** to produce a 0–100 numeric score, which is then mapped to a letter grade. All constants are defined in `server/utils/scorecardGrading.js` and can be easily adjusted.

### Composite Score Formula

```
score = (W_completion * completion_rate)
      + (W_ontime    * on_time_rate)
      + (W_overdue   * overdue_penalty_rate)
```

Where:

- `completion_rate` = `(completed / total) * 100` — what percentage of assigned strategies are done
- `on_time_rate` = `(on_time / (on_time + late)) * 100` — of finished strategies, what percentage were on time
- `overdue_penalty_rate` = `(1 - overdue / total) * 100` — what percentage are NOT currently overdue

All three components are on a 0–100 scale before weights are applied.

### Default Weights

| Component         | Weight         | Rationale                                            |
| ----------------- | -------------- | ---------------------------------------------------- |
| `completion_rate` | **0.40** (40%) | Primary measure: are strategies getting done?        |
| `on_time_rate`    | **0.35** (35%) | Timeliness: are they finishing before the deadline?  |
| `overdue_penalty` | **0.25** (25%) | Current health: are there outstanding delinquencies? |

Weights must sum to **1.0**.

### Letter Grade Thresholds

| Grade | Minimum Score |
| ----- | ------------- |
| A     | 90            |
| B     | 80            |
| C     | 70            |
| D     | 60            |
| F     | 0             |

Thresholds are evaluated top-to-bottom; the first threshold where `score >= min` determines the grade.

### Edge Cases

| Scenario                                                | Result                                                                  |
| ------------------------------------------------------- | ----------------------------------------------------------------------- |
| 0 total strategies                                      | Score = 0, Grade = F                                                    |
| 0 completed (but strategies exist)                      | completion_rate = 0, on_time_rate = 0, score depends on overdue penalty |
| All completed, all on-time, 0 overdue                   | Score = 100, Grade = A                                                  |
| Strategies with no deadline (`current_deadline = null`) | Not counted as on-time, late, or overdue                                |

### Example Calculations

**Implementer A**: 10 strategies, 8 completed, 7 on-time, 1 late, 0 overdue

```
completion_rate   = (8/10) * 100  = 80.0
on_time_rate      = (7/8) * 100   = 87.5
overdue_penalty   = (1-0/10) * 100 = 100.0

score = 0.40 * 80.0 + 0.35 * 87.5 + 0.25 * 100.0
      = 32.0 + 30.625 + 25.0
      = 87.6 → Grade B
```

**Implementer B**: 10 strategies, 3 completed, 2 on-time, 1 late, 4 overdue

```
completion_rate   = (3/10) * 100  = 30.0
on_time_rate      = (2/3) * 100   = 66.7
overdue_penalty   = (1-4/10) * 100 = 60.0

score = 0.40 * 30.0 + 0.35 * 66.7 + 0.25 * 60.0
      = 12.0 + 23.345 + 15.0
      = 50.3 → Grade F
```

---

## Configuration

To adjust the grading system, edit `server/utils/scorecardGrading.js`:

- **`SCORECARD_WEIGHTS`** — Change the decimal values (must sum to 1.0)
- **`GRADE_THRESHOLDS`** — Change the `min` values or add/remove grades (must be sorted descending by `min`)
