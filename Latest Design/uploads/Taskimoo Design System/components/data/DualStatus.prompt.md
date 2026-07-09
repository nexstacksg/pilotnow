The signature Taskimoo component. A project carries **two parallel truths** — commercial and delivery — and the core product principle is to *never collapse them into one*. DualStatus shows both as stepped pipelines, stacked, so they read as parallel at a glance.

```jsx
<DualStatus
  commercial={{
    stages: ['Idea','Bidding','Quoted','Won','Invoiced','Paid','Closed'],
    current: 4,
  }}
  delivery={{
    stages: ['Draft','Planned','Ready','In progress','In review','QA/QC','UAT','Released','Closed'],
    current: 3,
    tone: 'risk',
  }}
/>

{/* Dense table / row variant */}
<DualStatus compact bordered={false}
  commercial={{ stages: ['Idea','Quoted','Paid'], current: 1 }}
  delivery={{ stages: ['Planned','In progress','Released'], current: 1 }} />
```

Notes: `tone: 'risk'` is the one place red enters — it flags the current stage and its kicker when a track is at risk/blocked. Filled segments use ink (`--fg-1`/`--fg-0`), future segments are faint (`--bg-3`). Use `compact` inside tables and list rows.
