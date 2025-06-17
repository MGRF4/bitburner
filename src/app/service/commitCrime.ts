import { commitCrime, getOptimalCrime } from '@/domain/crime/crimeUtils';
import { CrimeType, NS } from '@ns';

let lastCrime: any;

export async function main(ns: NS) {
  while (true) {
    const optimalCrime = getOptimalCrime(ns);
    if (lastCrime !== optimalCrime) {
      commitCrime(ns, optimalCrime);
      lastCrime = optimalCrime;
    }
    await ns.sleep(500);
  }
}
