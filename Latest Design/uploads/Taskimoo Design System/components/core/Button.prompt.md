Editorial action button — ink-filled `primary`, functional `red`, hairline `secondary`, quiet `ghost`; the four button roles in Taskimoo.

```jsx
<Button variant="primary" icon={<Plus />}>New task</Button>
<Button variant="red">Block</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost" size="sm">Filter</Button>
```

Notes: `primary` is ink (`--fg-0`) not red — red is reserved for danger/urgent actions. Pass Lucide SVG nodes to `icon` / `iconRight`; an icon with no children renders a square icon-only button.
