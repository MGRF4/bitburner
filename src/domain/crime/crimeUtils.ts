import { NS, CrimeType } from '@ns';

export function commitCrime(ns: NS, crimeChoice: string) {
  ns.singularity.commitCrime(crimeChoice as CrimeType, false);
}

export function getOptimalCrime(ns: NS) {
  const crimes = [
    'Shoplift',
    'Rob Store',
    'Mug',
    'Larceny',
    'Deal Drugs',
    'Bond Forgery',
    'Traffick Arms',
    'Homicide',
    'Grand Theft Auto',
    'Kidnap',
    'Assassination',
    'Heist',
  ];
  let bestCrime = crimes[0];
  let bestValue = 0;
  for (let crime of crimes) {
    const c = crime as CrimeType;
    const stats = ns.singularity.getCrimeStats(c);
    const chance = ns.singularity.getCrimeChance(c);
    const reward = stats.money * chance;
    const value = reward / stats.time;
    if (value > bestValue) {
      bestValue = value;
      bestCrime = crime;
    }
  }
  return bestCrime;
}
