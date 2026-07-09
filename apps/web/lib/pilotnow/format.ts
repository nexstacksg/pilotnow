export function money(n: number) {
  return `S$${n.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function dLabel(date: string) {
  const value = new Date(`${date}T00:00:00`);
  return value.toLocaleDateString('en-SG', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function hrs(start: string, end: string) {
  const [h1 = 0, m1 = 0] = start.split(':').map(Number);
  const [h2 = 0, m2 = 0] = end.split(':').map(Number);
  let delta = h2 * 60 + m2 - (h1 * 60 + m1);
  if (delta < 0) delta += 1440;
  return Math.round((delta / 60) * 100) / 100;
}
