import { apiUrl, request } from './client';

type BackendWearable = {
  id: number;
  wearableName: string;
  status: boolean;
  accessUrl: string;
};

/** O UUID é o último segmento do link gravado na pulseira. */
export function uuidDoLink(accessUrl: string): string {
  return accessUrl.split('/').filter(Boolean).pop() ?? '';
}

/**
 * UUID da pulseira do próprio titular (a primeira ativa; sem ativa, a
 * primeira vinculada). `null` quando ele não tem pulseira ou o site está
 * em modo demonstração (sem API).
 */
export async function uuidDaMinhaPulseira(
  userId: string,
  token: string,
): Promise<string | null> {
  if (!apiUrl()) return null;
  const pulseiras = await request<BackendWearable[]>(`/api/wearables/user/${userId}`, {
    method: 'GET',
    token,
  });
  if (pulseiras.length === 0) return null;
  const ativa = pulseiras.find((p) => p.status) ?? pulseiras[0];
  return uuidDoLink(ativa.accessUrl);
}
