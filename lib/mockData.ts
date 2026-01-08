// Mock data for testing components before connecting to live MCP servers

export const mockGA4Overview = {
  summary: {
    totalUsers: 28400,
    newUsers: 26800,
    sessions: 32100,
    pageViews: 38500,
    engagementRate: 0.375,
    avgSessionDuration: 86.4,
    bounceRate: 0.625
  },
  trend: [
    { date: '2026-01-01', totalUsers: 981, sessions: 1021 },
    { date: '2026-01-02', totalUsers: 1108, sessions: 1158 },
    { date: '2026-01-03', totalUsers: 1109, sessions: 1143 },
    { date: '2026-01-04', totalUsers: 984, sessions: 1036 },
    { date: '2026-01-05', totalUsers: 1066, sessions: 1117 },
    { date: '2026-01-06', totalUsers: 1018, sessions: 1068 },
    { date: '2026-01-07', totalUsers: 612, sessions: 663 }
  ]
};

export const mockChannels = [
  { channel: 'Paid Social', users: 3142, percentage: 45.6 },
  { channel: 'Organic Search', users: 2197, percentage: 31.9 },
  { channel: 'Direct', users: 1118, percentage: 16.2 },
  { channel: 'Paid Search', users: 171, percentage: 2.5 },
  { channel: 'Referral', users: 137, percentage: 2.0 },
  { channel: 'Email', users: 28, percentage: 0.4 },
  { channel: 'Other', users: 95, percentage: 1.4 }
];

export const mockCountries = [
  { country: 'United States', code: 'US', users: 2923 },
  { country: 'China', code: 'CN', users: 2125 },
  { country: 'India', code: 'IN', users: 1856 },
  { country: 'Philippines', code: 'PH', users: 1618 },
  { country: 'Pakistan', code: 'PK', users: 1253 },
  { country: 'United Kingdom', code: 'GB', users: 1224 },
  { country: 'Italy', code: 'IT', users: 918 },
  { country: 'Singapore', code: 'SG', users: 858 }
];

export const mockTopPages = [
  { path: '/vpn-reseller/white-label-solution', users: 7119, pageViews: 8700, engagementRate: 0.42 },
  { path: '/hack-wifi', users: 7093, pageViews: 9194, engagementRate: 0.38 },
  { path: '/white-label/msp', users: 1498, pageViews: 1626, engagementRate: 0.45 },
  { path: '/redeem', users: 1482, pageViews: 2634, engagementRate: 0.35 },
  { path: '/vpn-reseller/vpn-reseller-program', users: 1048, pageViews: 1259, engagementRate: 0.40 }
];

export const mockDeals = [
  { id: '1', name: 'justin@kasmweb.com', amount: 7200, stage: 'active', closeDate: '2025-01-17' },
  { id: '2', name: 'amolood@icloud.com', amount: null, stage: 'closedlost', closeDate: '2024-01-31' },
  { id: '3', name: 'piohnston@pxedeploy.com', amount: null, stage: 'closedlost', closeDate: '2024-01-31' }
];

export const mockRedditPosts = [
  {
    id: '1q6vnax',
    title: 'VPNs and WhatsApp Calls',
    author: 'BENED01',
    subreddit: 'VPN',
    score: 1,
    commentCount: 9,
    createdAt: '2026-01-08T04:39:38+05:00',
    url: 'https://reddit.com/r/VPN/comments/1q6vnax',
    content: null
  },
  {
    id: '1q6i85f',
    title: 'OpenVPN - why and why not',
    author: 'bazoo513',
    subreddit: 'VPN',
    score: 1,
    commentCount: 12,
    createdAt: '2026-01-07T20:24:14+05:00',
    url: 'https://reddit.com/r/VPN/comments/1q6i85f',
    content: null
  }
];
