Transient confirmation / alert — a compact ink-on-paper card with a tone accent rail. Presentational: stack several in a fixed bottom-right container and wire dismissal timers in your app.

```jsx
<Toast tone="success" icon={<Check />} title="Task moved to QA/QC"
  action={<Button size="sm" variant="ghost">Undo</Button>} onDismiss={close} />
<Toast tone="danger" icon={<AlertTriangle />} title="Couldn't sync with GitHub"
  message="Retry in a moment." onDismiss={close} />
```

Notes: default tone uses an ink rail (most confirmations are neutral). Keep titles to one short clause. Elevation via `--shadow-lg` is allowed here — toasts are overlays, one of the few places shadow is used.
