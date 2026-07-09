Initials avatar. Derives initials from `name`; `ai` swaps in the agent star (Taskimoo is humans + AI agents).

```jsx
<Avatar name="Maya Chen" />
<Avatar initials="KL" tone="dark" size="sm" />
<Avatar ai name="Delivery Agent" />
```

Notes: stack avatars by wrapping in a `.stack` container (negative margin). Use `ai` to distinguish agent assignees from human ones.
