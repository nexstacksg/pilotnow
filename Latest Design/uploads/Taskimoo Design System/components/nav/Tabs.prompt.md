Horizontal subnav tabs — the section switcher across Taskimoo screens. Active tab gets an ink underline; each can carry a mono count.

```jsx
<Tabs defaultValue="board" items={[
  { value: 'board', label: 'Board', count: 24 },
  { value: 'list', label: 'List' },
  { value: 'timeline', label: 'Timeline' },
]} />
```

Notes: works controlled (`value` + `onChange`) or uncontrolled (`defaultValue`). For a compact 2–3 option switch inside a toolbar, reach for SegmentedControl instead.
