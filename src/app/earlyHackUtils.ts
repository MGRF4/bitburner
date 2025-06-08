import { getCurrentTimeInSeconds } from '@/shared/timeUtils';
import { NS } from '@ns';

export async function recordServerHGWStats(ns: NS, server: string, increment: number) {
  const sTime = getCurrentTimeInSeconds();
  const maxExtractionPercent = 0.75;
  let extractionPercent = increment;
  let securityProjection = 0;
  const serverMaxMoney = ns.getServerMaxMoney(server);

  //while (extractionPercent < maxExtractionPercent) {
  // Hack constants.
  let threadsRequired = Math.floor(ns.hackAnalyzeThreads(server, extractionPercent));
  if (threadsRequired < 1) threadsRequired = 1;
  securityProjection += ns.hackAnalyzeSecurity(threadsRequired, server);
  // Grow constants.
  const remainingMoney = serverMaxMoney - ns.hackAnalyze(server) * threadsRequired;
  ns.print(remainingMoney);
  return;

  extractionPercent += increment;
  //}
  ns.print(getCurrentTimeInSeconds() - sTime);
}
