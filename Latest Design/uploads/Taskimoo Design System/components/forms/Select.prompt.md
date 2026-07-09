Native select, restyled to match Input — mono label, hairline border, red focus ring, custom chevron.

```jsx
<Select label="Assignee" placeholder="Unassigned"
  options={['Maya Chen', 'Lin Park', 'Diego R.']} />
<Select label="Delivery status" defaultValue="in_progress" options={[
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'qa', label: 'QA/QC' },
]} />
```

Notes: options accept bare strings or `{value,label}`. Keeps the native picker for accessibility/keyboard; only the chrome is custom.
