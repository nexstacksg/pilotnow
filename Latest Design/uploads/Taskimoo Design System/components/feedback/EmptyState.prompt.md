Dashed-border placeholder for empty lists, boards and search results.

```jsx
<EmptyState icon={<Inbox />} title="No work items"
  description="Nothing assigned to you in this sprint yet."
  action={<Button variant="primary" icon={<Plus />}>New task</Button>} />
```

Notes: keep the copy operational and terse — state the fact, offer the next action. Use `compact` when the empty state sits inside a section card rather than a full page.
