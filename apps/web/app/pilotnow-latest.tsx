'use client';

import { PilotNowShell } from '@/components/pilotnow/layout';
import {
  BillingScreen,
  Dashboard,
  JobDetail,
  JobsScreen,
  OfficersScreen,
  PaymentsScreen,
  ReportsScreen,
  RequestsScreen,
  ShiftScreen,
  SummaryScreen,
} from '@/components/pilotnow/screens';
import { routeFromSlug } from '@/lib/pilotnow/routes';

export function PilotNowLatest({ slug }: { slug: string[] }) {
  const route = routeFromSlug(slug);
  const active = route.key;

  return (
    <PilotNowShell active={active}>
      {active === 'dashboard' && <Dashboard />}
      {active === 'requests' && <RequestsScreen />}
      {active === 'jobs' && <JobsScreen />}
      {active === 'jobDetail' && <JobDetail jobId={route.jobId} />}
      {active === 'shift' && <ShiftScreen />}
      {active === 'officers' && <OfficersScreen />}
      {active === 'summary' && <SummaryScreen />}
      {active === 'payments' && <PaymentsScreen />}
      {active === 'billing' && <BillingScreen />}
      {active === 'reports' && <ReportsScreen />}
    </PilotNowShell>
  );
}
