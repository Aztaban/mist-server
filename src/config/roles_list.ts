const ROLES_LIST: Record<string, number> = {
  Admin: 4042,
  Editor: 3032,
  User: 1012
}

export type Role = keyof typeof ROLES_LIST;

export { ROLES_LIST };