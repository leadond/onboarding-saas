/*
 * Copyright (c) 2024 Marvelously Made LLC DBA Dev App Hero. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: legal@devapphero.com
 */

import { getSupabaseClient } from '@/lib/supabase'
import { rbacManager, UserContext } from '@/lib/auth/rbac'

// GraphQL context type
interface GraphQLContext {
  user?: any
  userContext?: UserContext
  supabase: ReturnType<typeof createClient>
}

// Type definitions for GraphQL
export const typeDefs = `
  type User {
    id: ID!
    email: String!
    fullName: String
    companyName: String
    avatarUrl: String
    subscriptionStatus: String
    createdAt: String!
  }

  type Kit {
    id: ID!
    title: String!
    description: String
    isPublished: Boolean!
    userId: String!
    createdAt: String!
    updatedAt: String!
    steps: [KitStep!]!
  }

  type KitStep {
    id: ID!
    kitId: String!
    title: String!
    description: String
    stepType: String!
    content: JSON
    orderIndex: Int!
    isRequired: Boolean!
    createdAt: String!
  }

  type Organization {
    id: ID!
    name: String!
    slug: String!
    ownerId: String!
    settings: JSON
    createdAt: String!
    members: [OrganizationMember!]!
  }

  type OrganizationMember {
    id: ID!
    organizationId: String!
    userId: String!
    role: String!
    user: User!
    createdAt: String!
  }

  type Team {
    id: ID!
    organizationId: String!
    name: String!
    description: String
    createdAt: String!
    members: [TeamMember!]!
  }

  type TeamMember {
    id: ID!
    teamId: String!
    userId: String!
    role: String!
    user: User!
    createdAt: String!
  }

  scalar JSON

  type Query {
    me: User
    kits: [Kit!]!
    kit(id: ID!): Kit
    organizations: [Organization!]!
    organization(id: ID!): Organization
    teams(organizationId: ID!): [Team!]!
    team(id: ID!): Team
  }

  type Mutation {
    createKit(title: String!, description: String): Kit!
    updateKit(id: ID!, title: String, description: String, isPublished: Boolean): Kit!
    deleteKit(id: ID!): Boolean!
    createOrganization(name: String!, slug: String!): Organization!
    updateOrganization(id: ID!, name: String, settings: JSON): Organization!
    createTeam(organizationId: ID!, name: String!, description: String): Team!
    addTeamMember(teamId: ID!, userId: ID!, role: String!): TeamMember!
  }
`

// GraphQL resolvers
export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      const { data, error } = await context.supabase
        .from('users')
        .select('*')
        .eq('id', context.user.id)
        .single()

      if (error) throw new Error('User not found')
      return data
    },

    kits: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      const { data, error } = await context.supabase
        .from('kits')
        .select('*')
        .eq('user_id', context.user.id)
        .order('created_at', { ascending: false })

      if (error) throw new Error('Failed to fetch kits')
      return data || []
    },

    kit: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      const { data, error } = await context.supabase
        .from('kits')
        .select('*')
        .eq('id', id)
        .eq('user_id', context.user.id)
        .single()

      if (error) throw new Error('Kit not found')
      return data
    },

    organizations: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      const { data, error } = await context.supabase
        .from('organization_members')
        .select(`
          organizations!inner(*)
        `)
        .eq('user_id', context.user.id)

      if (error) throw new Error('Failed to fetch organizations')
      return data?.map(om => (om as any).organizations) || []
    },

    organization: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.user || !context.userContext) {
        throw new Error('Not authenticated')
      }

      // Check if user belongs to organization
      if (!rbacManager.belongsToOrganization(context.userContext, id)) {
        throw new Error('Access denied')
      }

      const { data, error } = await context.supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw new Error('Organization not found')
      return data
    },

    teams: async (_: any, { organizationId }: { organizationId: string }, context: GraphQLContext) => {
      if (!context.user || !context.userContext) {
        throw new Error('Not authenticated')
      }

      // Check if user belongs to organization
      if (!rbacManager.belongsToOrganization(context.userContext, organizationId)) {
        throw new Error('Access denied')
      }

      const { data, error } = await context.supabase
        .from('teams')
        .select('*')
        .eq('organization_id', organizationId)

      if (error) throw new Error('Failed to fetch teams')
      return data || []
    },

    team: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      const { data, error } = await context.supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw new Error('Team not found')
      return data
    },
  },

  Mutation: {
    createKit: async (_: any, { title, description }: { title: string; description?: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      const { data, error } = await context.supabase
        .from('kits')
        .insert({
          title,
          description,
          user_id: context.user.id,
          is_published: false,
        })
        .select()
        .single()

      if (error) throw new Error('Failed to create kit')
      return data
    },

    updateKit: async (_: any, { id, title, description, isPublished }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      const updateData: any = {}
      if (title !== undefined) updateData.title = title
      if (description !== undefined) updateData.description = description
      if (isPublished !== undefined) updateData.is_published = isPublished

      const { data, error } = await context.supabase
        .from('kits')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', context.user.id)
        .select()
        .single()

      if (error) throw new Error('Failed to update kit')
      return data
    },

    deleteKit: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      const { error } = await context.supabase
        .from('kits')
        .delete()
        .eq('id', id)
        .eq('user_id', context.user.id)

      if (error) throw new Error('Failed to delete kit')
      return true
    },

    createOrganization: async (_: any, { name, slug }: { name: string; slug: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      const { data, error } = await context.supabase
        .from('organizations')
        .insert({
          name,
          slug,
          owner_id: context.user.id,
          settings: {},
        })
        .select()
        .single()

      if (error) throw new Error('Failed to create organization')

      // Add user as owner
      await context.supabase
        .from('organization_members')
        .insert({
          organization_id: data.id,
          user_id: context.user.id,
          role: 'owner',
        })

      return data
    },

    updateOrganization: async (_: any, { id, name, settings }: any, context: GraphQLContext) => {
      if (!context.user || !context.userContext) {
        throw new Error('Not authenticated')
      }

      // Check permissions
      const hasPermission = await rbacManager.hasPermission(context.userContext, 'organization:update')
      if (!hasPermission) {
        throw new Error('Access denied')
      }

      const updateData: any = {}
      if (name !== undefined) updateData.name = name
      if (settings !== undefined) updateData.settings = settings

      const { data, error } = await context.supabase
        .from('organizations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error('Failed to update organization')
      return data
    },

    createTeam: async (_: any, { organizationId, name, description }: any, context: GraphQLContext) => {
      if (!context.user || !context.userContext) {
        throw new Error('Not authenticated')
      }

      // Check if user belongs to organization
      if (!rbacManager.belongsToOrganization(context.userContext, organizationId)) {
        throw new Error('Access denied')
      }

      const { data, error } = await context.supabase
        .from('teams')
        .insert({
          organization_id: organizationId,
          name,
          description,
        })
        .select()
        .single()

      if (error) throw new Error('Failed to create team')
      return data
    },

    addTeamMember: async (_: any, { teamId, userId, role }: any, context: GraphQLContext) => {
      if (!context.user || !context.userContext) {
        throw new Error('Not authenticated')
      }

      // Check permissions
      const hasPermission = await rbacManager.hasPermission(context.userContext, 'team:manage')
      if (!hasPermission) {
        throw new Error('Access denied')
      }

      const { data, error } = await context.supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: userId,
          role,
        })
        .select()
        .single()

      if (error) throw new Error('Failed to add team member')
      return data
    },
  },

  // Nested resolvers
  Kit: {
    steps: async (parent: any, _: any, context: GraphQLContext) => {
      const { data, error } = await context.supabase
        .from('kit_steps')
        .select('*')
        .eq('kit_id', parent.id)
        .order('step_order', { ascending: true })

      if (error) return []
      return data || []
    },
  },

  Organization: {
    members: async (parent: any, _: any, context: GraphQLContext) => {
      const { data, error } = await context.supabase
        .from('organization_members')
        .select(`
          *,
          users!inner(*)
        `)
        .eq('organization_id', parent.id)

      if (error) return []
      return data || []
    },
  },

  Team: {
    members: async (parent: any, _: any, context: GraphQLContext) => {
      const { data, error } = await context.supabase
        .from('team_members')
        .select(`
          *,
          users!inner(*)
        `)
        .eq('team_id', parent.id)

      if (error) return []
      return data || []
    },
  },

  OrganizationMember: {
    user: async (parent: any, _: any, context: GraphQLContext) => {
      const { data, error } = await context.supabase
        .from('users')
        .select('*')
        .eq('id', parent.user_id)
        .single()

      if (error) return null
      return data
    },
  },

  TeamMember: {
    user: async (parent: any, _: any, context: GraphQLContext) => {
      const { data, error } = await context.supabase
        .from('users')
        .select('*')
        .eq('id', parent.user_id)
        .single()

      if (error) return null
      return data
    },
  },
}

// Create GraphQL context
export const createGraphQLContext = async (request: Request): Promise<GraphQLContext> => {
  const supabase = await getSupabaseClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return { supabase }
    }

    const userContext = await rbacManager.createUserContext(user)
    
    return {
      user,
      userContext,
      supabase,
    }
  } catch (error) {
    console.error('Error creating GraphQL context:', error)
    return { supabase }
  }
}
