Kanban work-item card — the unit of the delivery board. Carries the mono work-item id, title, tags, a status dot/label, due date, and assignee.

```jsx
<TaskCard
  id="TASK-148"
  title="Wire up invoice PDF export"
  tags={[{ label: 'Finance' }, { label: 'Blocked', red: true }]}
  statusLabel="In progress"
  statusColor="var(--status-progress)"
  due="May 12"
  assignee="LP"
/>
```

Notes: pass `--status-*` tokens to `statusColor`; set `overdue` to flag a late due date; `selected` adds the red left rail used for the active card.
