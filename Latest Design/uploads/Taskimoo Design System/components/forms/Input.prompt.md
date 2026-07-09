Labelled text input — the form workhorse. Mono uppercase label, optional leading icon, hint/error line, and the signature red focus ring.

```jsx
<Input label="Project name" placeholder="e.g. Mercury" />
<Input label="Invoice no." mono defaultValue="INV-2210" icon={<Hash />} />
<Input label="Email" type="email" invalid hint="Enter a valid address" />
<Input label="Search" type="search" size="sm" icon={<Search />} placeholder="Search tasks…" />
```

Notes: focus draws a 2px red border + `--shadow-focus` glow (consistent with the whole system). Use `mono` for typed IDs/amounts so they read tabular. `invalid` turns both border and hint red — pair it with a `hint` that states the rule.
