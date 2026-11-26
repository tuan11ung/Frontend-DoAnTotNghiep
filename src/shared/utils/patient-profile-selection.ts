type ProfileIdentity = { id: number | string; relationship: string };
const storageKey = 'medconnect.patient-portal.profile';

export function resolvePatientProfile<T extends ProfileIdentity>(profiles: T[], requested: string | null): T | undefined {
  const self = profiles.find(profile => profile.relationship === 'SELF');
  if (requested === 'self') return self;
  if (requested !== null) return profiles.find(profile => String(profile.id) === requested);
  if (!self) return undefined;
  try {
    const remembered = sessionStorage.getItem(storageKey + '.' + self.id);
    return profiles.find(profile => String(profile.id) === remembered) ?? self;
  } catch {
    return self;
  }
}

export function rememberPatientProfile(profiles: ProfileIdentity[], selected: ProfileIdentity) {
  const self = profiles.find(profile => profile.relationship === 'SELF');
  if (!self || !profiles.some(profile => profile.id === selected.id)) return;
  try {
    sessionStorage.setItem(storageKey + '.' + self.id, String(selected.id));
  } catch {
    // The current URL still preserves the selection when storage is unavailable.
  }
}
