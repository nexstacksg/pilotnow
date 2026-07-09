Topbar breadcrumb trail — faint chevron separators, the last item rendered as the current page (ink, medium weight).

```jsx
<Breadcrumb items={[
  { label: 'Projects', href: '#' },
  { label: 'Mercury', href: '#' },
  'Delivery board',
]} />
```

Notes: the final item is always styled as current and is non-interactive. Give earlier items `href` or `onClick` to make them navigable.
