const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://love-alarm-backend.vercel.app/api';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
};

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(res.status, data?.error || 'Algo correu mal');
  }
  return data as T;
}

export type User = {
  id: number;
  username: string;
  display_name: string;
  alarm_radius_m: number;
  alarm_active?: boolean;
  paused?: boolean;
};

export type ReportReason = 'assedio' | 'perfil_falso' | 'conteudo_inadequado' | 'comportamento_suspeito' | 'outro';

export type CrushCandidate = {
  id: number;
  username: string;
  display_name: string;
  already_crush?: boolean;
};

export type MatchEntry = {
  id: number;
  username: string;
  display_name: string;
  revealed_at: string;
};

export type LocationUpdateResult = {
  alarmActive: boolean;
  nearbyAdmirersCount: number;
  newMatches: { id: number; username: string; display_name: string }[];
};

export const api = {
  register: (username: string, password: string, display_name: string) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: { username, password, display_name },
    }),

  login: (username: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: { username, password },
    }),

  me: (token: string) => request<{ user: User }>('/me', { token }),

  updateRadius: (token: string, alarm_radius_m: number) =>
    request<{ ok: true }>('/me', { method: 'PATCH', token, body: { alarm_radius_m } }),

  updatePaused: (token: string, paused: boolean) =>
    request<{ ok: true }>('/me', { method: 'PATCH', token, body: { paused } }),

  searchUsers: (token: string, q: string) =>
    request<{ users: CrushCandidate[] }>(`/users/search?q=${encodeURIComponent(q)}`, { token }),

  addCrush: (token: string, target_id: number) =>
    request<{ ok: true }>('/crush/add', { method: 'POST', token, body: { target_id } }),

  removeCrush: (token: string, target_id: number) =>
    request<{ ok: true }>('/crush/list', { method: 'DELETE', token, body: { target_id } }),

  listCrushes: (token: string) => request<{ crushes: CrushCandidate[] }>('/crush/list', { token }),

  updateLocation: (token: string, lat: number, lng: number, push_token?: string | null) =>
    request<LocationUpdateResult>('/location/update', {
      method: 'POST',
      token,
      body: { lat, lng, push_token },
    }),

  listMatches: (token: string) => request<{ matches: MatchEntry[] }>('/matches/list', { token }),

  unmatch: (token: string, target_id: number) =>
    request<{ ok: true }>('/matches/remove', { method: 'DELETE', token, body: { target_id } }),

  blockUser: (token: string, target_id: number) =>
    request<{ ok: true }>('/block/add', { method: 'POST', token, body: { target_id } }),

  unblockUser: (token: string, target_id: number) =>
    request<{ ok: true }>('/block/list', { method: 'DELETE', token, body: { target_id } }),

  listBlocks: (token: string) => request<{ blocks: CrushCandidate[] }>('/block/list', { token }),

  reportUser: (token: string, target_id: number, reason: ReportReason) =>
    request<{ ok: true }>('/report', { method: 'POST', token, body: { target_id, reason } }),

  deleteAccount: (token: string, password: string) =>
    request<{ ok: true }>('/me', { method: 'DELETE', token, body: { password } }),
};
