import { crimes } from '@/shared/globalVariables';
import { CrimeType, NS } from '@ns';

export function commitCrime(
  ns: NS,
  crimeChoice:
    | 'Shoplift'
    | 'Rob Store'
    | 'Mug'
    | 'Larceny'
    | 'Deal Drugs'
    | 'Bond Forgery'
    | 'Traffick Arms'
    | 'Homicide'
    | 'Grand Theft Auto'
    | 'Kidnap'
    | 'Assassination'
    | 'Heist',
) {
  ns.singularity.commitCrime(crimeChoice, false);
}

export function getOptimalCrime(ns: NS): CrimeType {
  let bestCrime: CrimeType = crimes[0];
  let bestValue = 0;

  for (let crime of crimes) {
    const stats = ns.singularity.getCrimeStats(crime);
    const chance = ns.singularity.getCrimeChance(crime);
    const expectedReward = stats.money * chance;
    const value = expectedReward / stats.time;

    if (value > bestValue) {
      bestValue = value;
      bestCrime = crime;
    }
  }
  return bestCrime as CrimeType;
}
