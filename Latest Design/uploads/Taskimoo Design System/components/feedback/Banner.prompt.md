Inline message strip with a left accent rule. Tones map to the semantic palette (`info`, `success`, `warning`, `danger`) plus `ai` for the red-shifted agent surface.

```jsx
<Banner tone="danger" title="Payment overdue" icon={<AlertTriangle />}
  actions={<Button size="sm" variant="red">Chase invoice</Button>}>
  INV-2210 is 12 days past due.
</Banner>

<Banner tone="ai" title="Delivery agent suggestion" icon={<Sparkles />} onDismiss={dismiss}>
  3 tasks look ready to move to QA/QC.
</Banner>
```

Notes: keep `danger` for genuine blocked/overdue states (it brings in red). The `ai` tone is the only place to use the agent tint surface for messages. Pass `onDismiss` to show the close button.
