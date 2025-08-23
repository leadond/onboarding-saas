import { RBACManager, UserContext } from '@/lib/auth/rbac'
import { ROLE_HIERARCHY, DEFAULT_PERMISSIONS } from '@/lib/types/team'

describe('RBACManager', () => {
  let rbacManager: RBACManager

  beforeEach(() => {
    rbacManager = new RBACManager()
    // Mock supabase client with minimal implementation for tests
    rbacManager['supabase'] = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      then: jest.fn(),
    }
    // Clear cache before each test
    rbacManager.invalidatePermissionCache()
  })

  describe('getAggregatedPermissions', () => {
    it('aggregates permissions from roles with lower or equal rank', () => {
      // For a given highest rank, permissions from all roles with rank <= highestRank should be included
      const highestRank = ROLE_HIERARCHY['manager'] // 60
      const aggregated = rbacManager['getAggregatedPermissions'](highestRank)

      // Collect expected permissions from roles with rank <= 60
      const expectedPermissions = new Set<string>()
      for (const [role, rank] of Object.entries(ROLE_HIERARCHY)) {
        if (rank <= highestRank) {
          const rolePerm = DEFAULT_PERMISSIONS.find(rp => rp.role === role)
          if (rolePerm) {
            for (const perm of rolePerm.permissions) {
              expectedPermissions.add(perm.name)
            }
          }
        }
      }

      expect(aggregated).toEqual(expectedPermissions)
    })

    it('uses cache to return aggregated permissions', () => {
      const highestRank = ROLE_HIERARCHY['admin']
      const firstCall = rbacManager['getAggregatedPermissions'](highestRank)
      const secondCall = rbacManager['getAggregatedPermissions'](highestRank)
      expect(secondCall).toBe(firstCall) // Should return same cached Set instance
    })
  })

  describe('hasPermission', () => {
    it('returns true if user has permission from any role with rank <= highest role rank', async () => {
      const userContext: UserContext = {
        id: 'user1',
        email: 'user1@example.com',
        roles: ['viewer', 'editor'], // editor rank 40, viewer rank 20, highest is 40
        permissions: [],
        organizationId: 'org1',
      }
      // editor role has 'kit.create' permission
      const hasPerm = await rbacManager.hasPermission(userContext, 'kit.create')
      expect(hasPerm).toBe(true)
    })

    it('returns false if user does not have the permission', async () => {
      const userContext: UserContext = {
        id: 'user2',
        email: 'user2@example.com',
        roles: ['guest'], // rank 10
        permissions: [],
        organizationId: 'org1',
      }
      const hasPerm = await rbacManager.hasPermission(userContext, 'kit.manage')
      expect(hasPerm).toBe(false)
    })

    it('handles multiple roles and aggregates permissions correctly', async () => {
      const userContext: UserContext = {
        id: 'user3',
        email: 'user3@example.com',
        roles: ['guest', 'manager'], // manager rank 60, guest rank 10, highest 60
        permissions: [],
        organizationId: 'org1',
      }
      // manager role has 'user.invite' permission
      const hasPerm = await rbacManager.hasPermission(userContext, 'user.invite')
      expect(hasPerm).toBe(true)
    })

    it('returns false if permission is not in aggregated permissions even if user has multiple roles', async () => {
      const userContext: UserContext = {
        id: 'user4',
        email: 'user4@example.com',
        roles: ['guest', 'viewer'], // highest rank 20
        permissions: [],
        organizationId: 'org1',
      }
      const hasPerm = await rbacManager.hasPermission(userContext, 'kit.manage')
      expect(hasPerm).toBe(false)
    })

    it('returns false and logs error if an exception occurs', async () => {
      // Force an error by mocking getHighestRoleRank to throw
      jest.spyOn(rbacManager as any, 'getHighestRoleRank').mockImplementation(() => {
        throw new Error('Test error')
      })
      const userContext: UserContext = {
        id: 'user5',
        email: 'user5@example.com',
        roles: ['owner'],
        permissions: [],
        organizationId: 'org1',
      }
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      const hasPerm = await rbacManager.hasPermission(userContext, 'organization.manage')
      expect(hasPerm).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error in hasPermission:'), expect.any(Error))
      consoleErrorSpy.mockRestore()
    })
  })

  describe('cache behavior', () => {
    it('invalidatePermissionCache deletes specific rank cache', () => {
      const rank = ROLE_HIERARCHY['admin']
      rbacManager['getAggregatedPermissions'](rank)
      expect(rbacManager['permissionCache'].has(rank)).toBe(true)
      rbacManager.invalidatePermissionCache(rank)
      expect(rbacManager['permissionCache'].has(rank)).toBe(false)
    })

    it('invalidatePermissionCache clears all cache if no rank provided', () => {
      rbacManager['getAggregatedPermissions'](ROLE_HIERARCHY['owner'])
      rbacManager['getAggregatedPermissions'](ROLE_HIERARCHY['admin'])
      expect(rbacManager['permissionCache'].size).toBeGreaterThan(0)
      rbacManager.invalidatePermissionCache()
      expect(rbacManager['permissionCache'].size).toBe(0)
    })

    it('updatePermissionCache rebuilds cache for all ranks', () => {
      rbacManager.updatePermissionCache()
      // Cache should have entries for all ranks in ROLE_HIERARCHY
      for (const rank of Object.values(ROLE_HIERARCHY)) {
        expect(rbacManager['permissionCache'].has(rank)).toBe(true)
      }
    })
  })

  describe('subscription tier check integration', () => {
    it('checkSubscriptionTier placeholder returns true', () => {
      const userContext: UserContext = {
        id: 'user6',
        email: 'user6@example.com',
        roles: ['owner'],
        permissions: [],
        organizationId: 'org1',
      }
      const result = (rbacManager as any).checkSubscriptionTier(userContext, 'any.permission')
      expect(result).toBe(true)
    })
  })
})