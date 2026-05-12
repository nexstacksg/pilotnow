// PilotNow — seed data for the prototype.
// SG flavor — security manpower ops.

window.PN_DATA = (function () {

  const OFFICERS = [
    { id: 'O-101', name: 'Tan Wei Ming',     initials: 'TW', role: 'Senior Officer', phone: '+65 8123 4501', ic: '×××1A', status: 'on-shift' },
    { id: 'O-102', name: 'Muhammad Hafiz',   initials: 'MH', role: 'Officer',        phone: '+65 9223 8812', ic: '×××4D', status: 'on-shift' },
    { id: 'O-103', name: 'Rajesh Kumar',     initials: 'RK', role: 'Officer',        phone: '+65 8773 6611', ic: '×××2J', status: 'available' },
    { id: 'O-104', name: 'Lim Jia Hao',      initials: 'LJ', role: 'Senior Officer', phone: '+65 9088 1142', ic: '×××8K', status: 'available' },
    { id: 'O-105', name: 'Chen Xiao Ming',   initials: 'CX', role: 'Officer',        phone: '+65 8511 4429', ic: '×××3L', status: 'standby' },
    { id: 'O-106', name: 'Siti Aisyah',      initials: 'SA', role: 'Officer',        phone: '+65 8990 7720', ic: '×××5M', status: 'on-shift' },
    { id: 'O-107', name: 'Lee Kah Wai',      initials: 'LK', role: 'Officer',        phone: '+65 9145 3308', ic: '×××6N', status: 'available' },
    { id: 'O-108', name: 'Nurul Huda',       initials: 'NH', role: 'Officer',        phone: '+65 8224 6651', ic: '×××7P', status: 'off' },
    { id: 'O-109', name: 'Ang Boon Keng',    initials: 'AB', role: 'Officer',        phone: '+65 9332 1107', ic: '×××9Q', status: 'available' },
    { id: 'O-110', name: 'Devi Naidu',       initials: 'DN', role: 'Senior Officer', phone: '+65 8456 9923', ic: '×××0R', status: 'on-shift' },
  ];

  const CLIENTS = [
    { id: 'C-014', name: 'Marina Bay Holdings',   billing: 'Marina Bay Holdings Pte Ltd', sites: 4, contact: 'Edwin Tay',     phone: '+65 6325 1100', finance: 'finance@mbholdings.sg' },
    { id: 'C-021', name: 'Apex Mall Group',       billing: 'Apex Retail Pte Ltd',         sites: 3, contact: 'Serena Wong',   phone: '+65 6622 8800', finance: 'ap@apexretail.sg' },
    { id: 'C-009', name: 'CapitaCommercial',      billing: 'CapitaCommercial Trust',      sites: 6, contact: 'Joel Lim',      phone: '+65 6536 1188', finance: 'invoices@capcom.sg' },
    { id: 'C-031', name: 'JTC Logistics Hub',     billing: 'JTC Corp',                    sites: 2, contact: 'Pauline Chua',  phone: '+65 6883 4400', finance: 'finance@jtc.gov.sg' },
    { id: 'C-018', name: 'Suntec Convention',     billing: 'Suntec Singapore',            sites: 1, contact: 'Daniel Ong',    phone: '+65 6337 2888', finance: 'billing@suntec.sg' },
    { id: 'C-040', name: 'Changi Business Park',  billing: 'CBP Operations Pte Ltd',      sites: 2, contact: 'Marcus Yeo',    phone: '+65 6543 9912', finance: 'cbp-finance@cbp.sg' },
  ];

  const SITES = [
    { id: 'S-201', client: 'C-014', name: 'Marina Bay Financial Centre Tower 1', addr: '8 Marina Boulevard, S(018981)', radius: 80, manager: 'Edwin Tay',    coords: '1.2830, 103.8540' },
    { id: 'S-202', client: 'C-014', name: 'MBFC Tower 2 — Lobby',                 addr: '10 Marina Boulevard, S(018983)', radius: 60, manager: 'Edwin Tay',    coords: '1.2832, 103.8543' },
    { id: 'S-208', client: 'C-021', name: 'Tampines Mall — Loading Bay',          addr: '4 Tampines Central 5, S(529510)', radius: 120, manager: 'Serena Wong', coords: '1.3536, 103.9446' },
    { id: 'S-210', client: 'C-021', name: 'Jurong Point — Atrium',                addr: '1 Jurong West Central 2, S(648886)', radius: 100, manager: 'Serena Wong', coords: '1.3398, 103.7064' },
    { id: 'S-215', client: 'C-009', name: 'Raffles Place One',                    addr: '1 Raffles Place, S(048616)', radius: 80, manager: 'Joel Lim',     coords: '1.2842, 103.8513' },
    { id: 'S-217', client: 'C-009', name: 'Capital Tower',                        addr: '168 Robinson Road, S(068912)', radius: 80, manager: 'Joel Lim',     coords: '1.2778, 103.8474' },
    { id: 'S-221', client: 'C-031', name: 'JTC Logistics Hub — Tuas Block C',     addr: '20 Tuas South Avenue, S(637286)', radius: 200, manager: 'Pauline Chua', coords: '1.2750, 103.6440' },
    { id: 'S-225', client: 'C-018', name: 'Suntec Convention Hall 401',           addr: '1 Raffles Boulevard, S(039593)', radius: 90, manager: 'Daniel Ong',   coords: '1.2939, 103.8576' },
    { id: 'S-229', client: 'C-040', name: 'Changi Business Park — Block 71',      addr: '71 Changi Business Park Vista, S(486060)', radius: 120, manager: 'Marcus Yeo', coords: '1.3346, 103.9628' },
  ];

  // Today: Tue, May 12
  const JOBS = [
    {
      id: 'J-1814', site: 'S-208', client: 'C-021',
      date: 'Today', start: '08:00', end: '20:00', dateMono: '2026-05-12',
      type: 'Day shift', need: 2, assigned: ['O-101','O-102'], ack: ['O-101','O-102'],
      state: 'live',       // unstaffed | assigned | ack | live | done | exception
      progress: 0.42,
      flags: [],
      notes: 'Use Service Lift 3 only. Report to Mr. Suresh at LB.',
    },
    {
      id: 'J-1815', site: 'S-201', client: 'C-014',
      date: 'Today', start: '07:00', end: '19:00', dateMono: '2026-05-12',
      type: 'Day shift', need: 3, assigned: ['O-106','O-110','O-103'], ack: ['O-106','O-110'],
      state: 'live', progress: 0.51,
      flags: ['no-ack:O-103'],
      notes: 'Lobby + visitor mgmt. Hourly photo proof.',
    },
    {
      id: 'J-1816', site: 'S-215', client: 'C-009',
      date: 'Today', start: '09:00', end: '18:00', dateMono: '2026-05-12',
      type: 'Concierge', need: 1, assigned: ['—'], ack: [],
      state: 'exception', progress: 0,
      flags: ['no-show'],
      notes: 'Officer Tan Boon Hwee did not check in by 09:18.',
    },
    {
      id: 'J-1817', site: 'S-225', client: 'C-018',
      date: 'Today', start: '14:00', end: '23:00', dateMono: '2026-05-12',
      type: 'Event', need: 4, assigned: ['O-104','O-107','O-109','—'], ack: ['O-104','O-107'],
      state: 'ack', progress: 0,
      flags: ['under-staffed:1'],
      notes: 'Pharma conference. Black uniform.',
    },
    {
      id: 'J-1818', site: 'S-217', client: 'C-009',
      date: 'Today', start: '19:00', end: '07:00', dateMono: '2026-05-12',
      type: 'Night patrol', need: 2, assigned: ['O-105','—'], ack: [],
      state: 'assigned', progress: 0,
      flags: ['under-staffed:1'],
      notes: 'Patrol every 2 hours.',
    },
    {
      id: 'J-1819', site: 'S-221', client: 'C-031',
      date: 'Today', start: '06:00', end: '18:00', dateMono: '2026-05-12',
      type: 'Day shift', need: 1, assigned: [], ack: [],
      state: 'unstaffed', progress: 0,
      flags: ['unstaffed','t-2h'],
      notes: 'Tuas — vehicle access required.',
    },
    {
      id: 'J-1820', site: 'S-202', client: 'C-014',
      date: 'Tomorrow', start: '07:00', end: '19:00', dateMono: '2026-05-13',
      type: 'Day shift', need: 2, assigned: ['O-104','O-107'], ack: ['O-104'],
      state: 'ack', progress: 0, flags: [],
      notes: '',
    },
    {
      id: 'J-1821', site: 'S-210', client: 'C-021',
      date: 'Tomorrow', start: '10:00', end: '22:00', dateMono: '2026-05-13',
      type: 'Day shift', need: 2, assigned: ['O-103','O-109'], ack: ['O-103','O-109'],
      state: 'ack', progress: 0, flags: [],
      notes: '',
    },
    {
      id: 'J-1822', site: 'S-229', client: 'C-040',
      date: 'Tomorrow', start: '08:00', end: '20:00', dateMono: '2026-05-13',
      type: 'Day shift', need: 1, assigned: [], ack: [],
      state: 'unstaffed', progress: 0,
      flags: ['unstaffed'],
      notes: '',
    },
    {
      id: 'J-1811', site: 'S-208', client: 'C-021',
      date: 'Yesterday', start: '08:00', end: '20:00', dateMono: '2026-05-11',
      type: 'Day shift', need: 2, assigned: ['O-101','O-102'], ack: ['O-101','O-102'],
      state: 'done', progress: 1, flags: ['signed'],
      notes: '',
    },
    {
      id: 'J-1812', site: 'S-201', client: 'C-014',
      date: 'Yesterday', start: '07:00', end: '19:00', dateMono: '2026-05-11',
      type: 'Day shift', need: 3, assigned: ['O-106','O-110','O-103'], ack: ['O-106','O-110','O-103'],
      state: 'done', progress: 1, flags: ['signed'],
      notes: '',
    },
    {
      id: 'J-1813', site: 'S-217', client: 'C-009',
      date: 'Yesterday', start: '19:00', end: '07:00', dateMono: '2026-05-11',
      type: 'Night patrol', need: 1, assigned: ['O-105'], ack: ['O-105'],
      state: 'done', progress: 1, flags: ['unsigned'],
      notes: 'Site manager out of country — unsigned closure.',
    },
  ];

  const EXCEPTIONS = [
    { id: 'EX-441', job: 'J-1816', kind: 'No-show',            severity: 'critical', age: '4m ago',  msg: 'O-201 Tan Boon Hwee not checked in. Shift started 09:00.', action: 'Reassign' },
    { id: 'EX-442', job: 'J-1815', kind: 'Missing ack',        severity: 'high',     age: '11m ago', msg: 'Rajesh Kumar has not acknowledged assignment.',           action: 'Resend' },
    { id: 'EX-443', job: 'J-1817', kind: 'Under-staffed',      severity: 'high',     age: '23m ago', msg: 'Pharma event needs 4, only 3 assigned. T-3h to start.',  action: 'Assign' },
    { id: 'EX-444', job: 'J-1815', kind: 'Missed proof photo', severity: 'medium',   age: '32m ago', msg: 'O-110 Devi Naidu missed the 11:00 proof. 2nd this shift.', action: 'Resend' },
    { id: 'EX-445', job: 'J-1819', kind: 'Unstaffed',          severity: 'critical', age: '1h ago',  msg: 'JTC Tuas — 06:00 shift starts in 2h, no officer assigned.', action: 'Assign' },
    { id: 'EX-446', job: 'J-1818', kind: 'Weak GPS',           severity: 'low',      age: '2h ago',  msg: 'Chen Xiao Ming checked in at 142m from site (radius 80m).', action: 'Review' },
    { id: 'EX-447', job: 'J-1813', kind: 'Signature timeout',  severity: 'high',     age: '6h ago',  msg: 'Capital Tower night patrol DO unsigned for 6h.',           action: 'Resend' },
    { id: 'EX-448', job: 'J-1812', kind: 'Email bounced',      severity: 'medium',   age: '8h ago',  msg: 'finance@mbholdings.sg bounced (mailbox full).',             action: 'Retry'  },
  ];

  return { OFFICERS, CLIENTS, SITES, JOBS, EXCEPTIONS };
})();
