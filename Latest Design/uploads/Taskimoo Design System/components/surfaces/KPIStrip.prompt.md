KPI / summary strip — the `.run-bar` pattern: a bordered row of stat cells with mono labels and large tabular numbers. Used on dashboards, finance overviews and test runs.

```jsx
<KPIStrip items={[
  { label: 'Passed', value: 128, tone: 'pass' },
  { label: 'Failed', value: 6, tone: 'fail' },
  { label: 'Blocked', value: 3, tone: 'block' },
  { label: 'Total', value: 137 },
]} />
```

Notes: cells auto-fit (min 140px). Use tones only on test/finance summaries; leave neutral for counts.
