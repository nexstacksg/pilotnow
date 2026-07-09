Centered dialog over a 30%-black backdrop — mono eyebrow + title + close in the head, scrollable body, optional right-aligned footer actions. Closes on backdrop click and Escape.

```jsx
const [open, setOpen] = React.useState(false);
<Modal open={open} onClose={() => setOpen(false)}
  eyebrow="New work item" title="Create task"
  footer={<>
    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
    <Button variant="primary">Create</Button>
  </>}>
  <Input label="Title" placeholder="What needs to ship…" />
</Modal>
```

Notes: radius is `--radius-lg` (10px), the one place the system rounds more — modals and the auth panel. No backdrop blur (the system avoids glassmorphism); the dim is a flat `color-mix(#000 30%)`. Respects reduced-motion.
