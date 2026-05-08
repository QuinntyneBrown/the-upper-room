// traces_to: L2-106
export interface AvatarUser {
  readonly displayName?: string;
  readonly email?: string;
}

export function initials(user: AvatarUser): string {
  const source = (user.displayName ?? user.email ?? '').trim();
  if (!source) return '??';
  const cleaned = source.split('@')[0]!;
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return (cleaned[0]! + (cleaned[1] ?? cleaned[0]!)).toUpperCase();
}

export function deterministicColor(identifier: string): string {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash * 31 + identifier.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 70%)`;
}
