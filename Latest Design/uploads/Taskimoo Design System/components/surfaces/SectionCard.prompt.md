Bordered section container with an optional head — the most-reused surface in Taskimoo (dashboards, panels, finance).

```jsx
<SectionCard title="Availability" meta="who's free" actions={<Button size="sm">View</Button>} pad>
  …content…
</SectionCard>
```

Notes: leave `pad` off when wrapping a table, feed or list that has its own row padding; turn it on for free-form content.
