Dense editorial table for finance, work lists and portfolios — mono uppercase headers, hairline row rules, hover highlight, and a red left-rail on the selected row.

```jsx
<DataTable
  rowKey="id"
  selectedKey="INV-2210"
  onRowClick={(row) => open(row)}
  columns={[
    { key: 'id', header: 'Invoice', mono: true },
    { key: 'client', header: 'Client', strong: true },
    { key: 'amount', header: 'Amount', align: 'right', mono: true },
    { key: 'status', header: 'Status', render: (v) => <Pill tone={v.tone}>{v.label}</Pill> },
  ]}
  rows={[
    { id: 'INV-2210', client: 'Acme Corp', amount: '$31,000', status: { label: 'Paid', tone: 'green' } },
  ]}
/>
```

Notes: use `render` to drop Pills, Avatars or DualStatus into cells. Mark IDs/amounts/dates `mono` so they read tabular; mark the primary column `strong`. Pass `empty` for the no-rows state.
