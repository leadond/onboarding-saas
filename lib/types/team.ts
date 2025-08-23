/*
 * Team types stub
 */

export type Role = 'user' | 'admin' | 'owner'

export interface RolePermission {
  role: string
  permissions: Array<{ name: string }>
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  user: 1,
  admin: 2,
  owner: 3,
}

export const DEFAULT_PERMISSIONS: RolePermission[] = [
  {
    role: 'user',
    permissions: [{ name: 'read' }],
  },
  {
    role: 'admin',
    permissions: [{ name: 'read' }, { name: 'write' }],
  },
  {
    role: 'owner',
    permissions: [{ name: 'read' }, { name: 'write' }, { name: 'delete' }],
  },
]