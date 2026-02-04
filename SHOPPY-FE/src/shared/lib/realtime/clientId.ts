const TAB_CLIENT_ID_KEY = 'shoppy_tab_client_id';

const createClientId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

export const getOrCreateTabClientId = (): string => {
  if (typeof window === 'undefined') return '';

  const existing = window.sessionStorage.getItem(TAB_CLIENT_ID_KEY);
  if (existing) {
    return existing;
  }

  const created = createClientId();
  window.sessionStorage.setItem(TAB_CLIENT_ID_KEY, created);
  return created;
};

