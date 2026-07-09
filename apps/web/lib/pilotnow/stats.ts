import { jobs, payments, requests, TODAY } from './data';

export function getStats() {
  const missingPhotos = jobs.flatMap((job) =>
    job.status === 'Ongoing' ? job.photos.filter((photo) => photo.status === 'missing') : [],
  ).length;
  const notBilled = jobs.filter((job) => job.status === 'Completed' && job.billing === 'Not Billed').length;

  return {
    todayJobs: jobs.filter((job) => job.date === TODAY).length,
    waitingJobs: jobs.filter((job) => job.status === 'Waiting for Officers').length,
    officersNeeded: jobs
      .filter((job) => job.status === 'Waiting for Officers')
      .reduce((sum, job) => sum + Math.max(0, job.required - job.officers.length), 0),
    ongoingJobs: jobs.filter((job) => job.status === 'Ongoing').length,
    missingPhotos,
    notBilled,
    newRequests: requests.filter((request) => request.status === 'New').length,
    pendingPayments: payments.filter((payment) => payment.status === 'Pending').length,
  };
}
