import type { Owner } from 'solid-js';
import { createStore } from 'solid-js/store';
import { GwmClient, GwmEventType, type Workspace } from 'glazewm';

import { getMonitors } from '~/desktop';
import type { GlazewmProviderConfig } from '~/user-config';

export async function createGlazewmProvider(
  _: GlazewmProviderConfig,
  __: Owner,
) {
  const { currentMonitor } = await getMonitors();
  const client = new GwmClient();

  const [glazewmVariables, setGlazewmVariables] = createStore({
    workspacesOnMonitor: [] as Workspace[],
    // TODO
    bindingMode: '',
  });

  client.onConnect(e => console.log('onOpen', e));
  client.onMessage(e => console.log('onMessage', e));
  client.onDisconnect(e => console.log('onClose', e));
  client.onError(e => console.log('onError', e));

  // Get initial workspaces.
  await refetch();

  await client.subscribeMany(
    [GwmEventType.WORKSPACE_ACTIVATED, GwmEventType.WORKSPACE_DEACTIVATED],
    refetch,
  );

  async function refetch() {
    const monitors = await client.getMonitors();
    const currentPosition = { x: currentMonitor!.x, y: currentMonitor!.y };

    // Get GlazeWM monitor that corresponds to the bar's monitor.
    const monitor = monitors.reduce((a, b) =>
      getDistance(currentPosition, a) < getDistance(currentPosition, b)
        ? a
        : b,
    );

    setGlazewmVariables({ workspacesOnMonitor: monitor.children });
  }

  function getDistance(
    pointA: { x: number; y: number },
    pointB: { x: number; y: number },
  ) {
    return Math.sqrt(
      Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2),
    );
  }

  return {
    get workspacesOnMonitor() {
      return glazewmVariables.workspacesOnMonitor;
    },
  };
}
