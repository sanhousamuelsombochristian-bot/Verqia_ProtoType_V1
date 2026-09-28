/** Préférences enregistrées dans le navigateur (paramètres, profil). */
export function loadSettings<T extends object>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`verqia.${key}`);
    return raw ? { ...fallback, ...(JSON.parse(raw) as T) } : fallback;
  } catch {
    return fallback;
  }
}

export function saveSettings<T extends object>(key: string, value: T): boolean {
  try {
    localStorage.setItem(`verqia.${key}`, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
