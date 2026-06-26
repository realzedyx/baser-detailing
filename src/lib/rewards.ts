export interface Reward {
  id: string;
  pts: number;
  label: string;
  perk: string;
  discount: number;
  services: string[] | null; // null = any service
}

export const REWARDS: Reward[] = [
  { id: 'regular',      pts: 300,  label: 'Regular',  perk: '20% off Exterior',    discount: 0.20, services: ['exterior'] },
  { id: 'regular_plus', pts: 500,  label: 'Regular+', perk: '20% off any service', discount: 0.20, services: null },
  { id: 'vip',          pts: 1000, label: 'VIP',      perk: '50% off Full Detail', discount: 0.50, services: ['full'] },
];

export const SERVICE_PRICE: Record<string, number> = {
  exterior: 129,
  interior: 149,
  full: 219,
};
