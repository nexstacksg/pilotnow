import { AdminApp } from '../../../features/admin/AdminApp';

export default async function OfficersPage({ searchParams }: { searchParams: Promise<{ officer?: string | string[] }> }) {
  const { officer } = await searchParams;
  const initialOfficerProfileId = Array.isArray(officer) ? officer[0] : officer;

  return <AdminApp initialOfficerProfileId={initialOfficerProfileId ?? null} initialScreen="officers" />;
}
