import { ApolloServer } from '@apollo/server'
import { NextRequest } from 'next/server'
import { typeDefs, resolvers, createGraphQLContext } from '@/lib/graphql/resolvers'

// GraphQL context type
interface GraphQLContext {
  user?: any
  userContext?: any
  supabase: any
}

const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  plugins: [
    {
      async requestDidStart() {
        return Promise.resolve({
          async didResolveOperation(requestContext) {
            console.log('GraphQL operation:', requestContext.request.operationName)
          },
          async didEncounterErrors(requestContext) {
            console.error('GraphQL errors:', requestContext.errors)
          },
        })
      },
    },
  ],
})

// Start server
const startServer = server.start()

export async function GET(request: NextRequest) {
  await startServer
  
  const context = await createGraphQLContext(request)
  
  return new Response('GraphQL endpoint - use POST for queries', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  })
}

export async function POST(request: NextRequest) {
  await startServer
  
  try {
    const body = await request.json()
    const context = await createGraphQLContext(request)
    
    const response = await server.executeOperation(
      {
        query: body.query,
        variables: body.variables,
        operationName: body.operationName,
      },
      {
        contextValue: context,
      }
    )
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('GraphQL error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
