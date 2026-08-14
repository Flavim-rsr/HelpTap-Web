import { apiUrl, request } from './client';

type BackendWearable = {
  id: number;
  wearableName: string;
  status: boolean;
  accessUrl: string;
};

/** O UUID é o último segmento do link gravado na pulseira. */
export function uuidFromLink(accessUrl: string): string {
  return accessUrl.split('/').filter(Boolean).pop() ?? '';
}

/**
 * UUID da pulseira do próprio titular (a primeira ativa; sem ativa, a
 * primeira vinculada). `null` quando ele não tem pulseira ou o site está
 * em modo demonstração (sem API).
 */
export async function getMyWearableUuid(
  userId: string,
  token: string,
): Promise<string | null> {
  if (!apiUrl()) return null;
  const wearables = await request<BackendWearable[]>(`/api/wearables/user/${userId}`, {
    method: 'GET',
    token,
  });
  if (wearables.length === 0) return null;
  const active = wearables.find((w) => w.status) ?? wearables[0];
  return uuidFromLink(active.accessUrl);
}
