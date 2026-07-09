Custom-drawn checkbox / radio with the editorial ink fill — checked fills with `--fg-0` (or functional red via `red`). Supports a label + optional description line.

```jsx
<Checkbox label="Chargeable" defaultChecked />
<Checkbox label="Block on failing tests" description="Pause delivery until QA passes" red />
<Checkbox type="radio" name="role" value="ba" label="Business Analyst" />
```

Notes: pass `type="radio"` for the round single-select variant. Hidden native input keeps it keyboard-accessible; focus draws the standard red ring.
