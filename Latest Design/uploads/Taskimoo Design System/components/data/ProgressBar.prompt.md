Thin determinate progress bar for milestone / completion counts ("5 of 8 milestones done"). Ink fill by default; `tone` switches to a semantic color.

```jsx
<ProgressBar value={5} max={8} label="Milestones" showValue />
<ProgressBar value={31} max={48} tone="green" showValue valueText="$31k / $48k" />
<ProgressBar value={2} max={10} tone="red" size="sm" />
```

Notes: keep the default ink fill for neutral progress; reserve `red` for overdue/at-risk completion. `valueText` overrides the auto `value / max` string for money or percentages.
