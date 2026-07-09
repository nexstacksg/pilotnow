Status pill — the smallest state marker used in kanban cards, tables and task rows. Neutral by default; tones for semantic states.

```jsx
<Pill tone="green">On track</Pill>
<Pill tone="red" dot="var(--red-500)">Urgent</Pill>
<Pill dot="var(--status-progress)">In progress</Pill>
<Pill tone="blue" mono>UAT</Pill>
```

Notes: use the `dot` prop with a status color variable to mirror kanban column dots. Keep labels to 1–2 words.
