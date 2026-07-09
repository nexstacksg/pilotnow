Toggle / switch for binary settings — ink-filled track when on (functional red via `red`), with an optional label + description.

```jsx
<Toggle label="Notify on status change" defaultChecked />
<Toggle label="Pause delivery" description="Stops the board moving forward" red />
<Toggle size="sm" />
```

Notes: reserve `red` for settings that gate or stop work. Use a plain ink toggle for ordinary preferences. Keyboard-focusable with the standard red ring.
