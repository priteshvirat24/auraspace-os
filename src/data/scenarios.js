export const scenarios = [
  {
    id: 'A',
    name: 'Scenario A: Commercial Comm Satellite vs Spent Rocket Body',
    shortName: 'Comm Sat vs Rocket Body',
    tier: 'Critical',
    basePc: 4.2e-3,
    consequences: {
      value: '$250M',
      downtime: '14 Days',
      fuelRemaining: '78%'
    },
    hbr: 0.05, // km
    baseCovScale: 2.0,
    // Target B-Plane offset to achieve Pc ~ 4.2e-3 (with default covariance)
    // We will adjust mu dynamically to match the exact Pc later if needed, 
    // or just use this as the starting offset.
    muTarget: { x: 0.15, y: 0.08 },
    tlePrimary: [
      "1 44235U 19029A   26001.00000000  .00000000  00000-0  00000-0 0  9997",
      "2 44235  53.0000   0.0000 0001000   0.0000   0.0000 15.00000000    05"
    ],
    tleChaser: [
      "1 99999U 99999A   26001.00000000  .00000000  00000-0  00000-0 0  9999",
      "2 99999  53.0000  90.0000 0001000   0.0000   0.0000 15.00000000    01"
    ],
    // Strategies for Decision Arena
    strategies: [
      { id: 'no-action', name: 'No Action', deltaV: 0, fuelCost: '0', newPc: 4.2e-3, recommendation: 'Reject', explanation: 'Collision risk is unacceptable.' },
      { id: 'radial', name: 'Radial', deltaV: 0.4, fuelCost: 'Low', newPc: 8.2e-7, recommendation: 'Best', explanation: 'Radial Burn selected because it reduces collision probability by 99.98% while consuming 43% less fuel than cross-track alternatives.' },
      { id: 'in-track', name: 'In-Track', deltaV: 0.7, fuelCost: 'Medium', newPc: 1.2e-6, recommendation: 'Accept', explanation: 'Viable alternative, but consumes more fuel than radial burn.' },
      { id: 'cross-track', name: 'Cross-Track', deltaV: 1.8, fuelCost: 'High', newPc: 5.1e-7, recommendation: 'Expensive', explanation: 'Highly energy-intensive maneuver. Reserved only as a fallback.' },
    ]
  },
  {
    id: 'B',
    name: 'Scenario B: Earth Observation Satellite vs Debris Fragment',
    shortName: 'Earth Obs vs Debris',
    tier: 'Warning',
    basePc: 8.7e-5,
    consequences: {
      value: '$120M',
      downtime: '3 Days',
      fuelRemaining: '45%'
    },
    hbr: 0.02,
    baseCovScale: 3.0,
    muTarget: { x: 0.4, y: 0.2 },
    tlePrimary: [
      "1 43013U 17071A   26001.00000000  .00000000  00000-0  00000-0 0  9997",
      "2 43013  97.0000  10.0000 0001000   0.0000   0.0000 15.00000000    05"
    ],
    tleChaser: [
      "1 88888U 88888A   26001.00000000  .00000000  00000-0  00000-0 0  9999",
      "2 88888  97.0000  80.0000 0001000   0.0000   0.0000 15.00000000    01"
    ],
    strategies: [
      { id: 'no-action', name: 'No Action', deltaV: 0, fuelCost: '0', newPc: 8.7e-5, recommendation: 'Monitor', explanation: 'Risk is below critical threshold. Continue monitoring.' },
      { id: 'radial', name: 'Radial', deltaV: 0.2, fuelCost: 'Low', newPc: 1.2e-7, recommendation: 'Best', explanation: 'Small radial burn effectively mitigates risk.' },
      { id: 'in-track', name: 'In-Track', deltaV: 0.3, fuelCost: 'Low', newPc: 3.4e-7, recommendation: 'Accept', explanation: 'In-track phasing effectively increases separation distance.' },
      { id: 'cross-track', name: 'Cross-Track', deltaV: 1.2, fuelCost: 'High', newPc: 1.1e-7, recommendation: 'Expensive', explanation: 'Plane change is too costly for this risk tier.' },
    ]
  },
  {
    id: 'C',
    name: 'Scenario C: Starlink-like Satellite vs CubeSat',
    shortName: 'Starlink vs CubeSat',
    tier: 'Safe',
    basePc: 2.3e-7,
    consequences: {
      value: '$2M',
      downtime: '0 Days',
      fuelRemaining: '92%'
    },
    hbr: 0.01,
    baseCovScale: 1.5,
    muTarget: { x: 1.5, y: 1.0 },
    tlePrimary: [
      "1 45532U 20025A   26001.00000000  .00000000  00000-0  00000-0 0  9997",
      "2 45532  53.0000  20.0000 0001000   0.0000   0.0000 15.00000000    05"
    ],
    tleChaser: [
      "1 77777U 77777A   26001.00000000  .00000000  00000-0  00000-0 0  9999",
      "2 77777  53.0000 110.0000 0001000   0.0000   0.0000 15.00000000    01"
    ],
    strategies: [
      { id: 'no-action', name: 'No Action', deltaV: 0, fuelCost: '0', newPc: 2.3e-7, recommendation: 'Best', explanation: 'No action required. Conjunction probability is within safe operational limits.' },
      { id: 'radial', name: 'Radial', deltaV: 0.1, fuelCost: 'Low', newPc: 1e-8, recommendation: 'Unnecessary', explanation: 'Burn not required.' },
      { id: 'in-track', name: 'In-Track', deltaV: 0.1, fuelCost: 'Low', newPc: 1e-8, recommendation: 'Unnecessary', explanation: 'Burn not required.' },
      { id: 'cross-track', name: 'Cross-Track', deltaV: 0.5, fuelCost: 'High', newPc: 1e-8, recommendation: 'Expensive', explanation: 'Burn not required.' },
    ]
  }
];
