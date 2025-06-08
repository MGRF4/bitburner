import { LastExecutedScriptInfo, ScriptQueueInfo } from '@/infra/scriptQueue/models';
import { NS } from '@ns';

/*
 *
 */
export async function createScriptQueueInfo(ns: NS): Promise<ScriptQueueInfo> {
  const data = new ScriptQueueInfo(ns);
  await data.init();
  return data;
}

/*
 *
 */
export async function createLastScriptRanInfo(ns: NS): Promise<LastExecutedScriptInfo> {
  const data = new LastExecutedScriptInfo(ns);
  await data.init();
  return data;
}
