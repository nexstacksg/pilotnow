Compact segmented switch for toolbars — view mode, density, grouping. Active segment inverts to ink-on-paper. Best for 2–4 short options; use Tabs for full section navigation.

```jsx
<SegmentedControl defaultValue="board"
  options={[{ value: 'board', label: 'Board' }, { value: 'list', label: 'List' }]} />
<SegmentedControl size="sm" options={[
  { value: 'kanban', icon: <Columns /> },
  { value: 'rows', icon: <Rows /> },
]} />
```

Notes: options accept bare strings or `{value,label,icon}` — icon-only segments work for view toggles. Controlled or uncontrolled.
