# API RBAC and RLS Enforcement Flow Diagram

```mermaid
flowchart TD
  A[API Request Received] --> B[Authenticate User]
  B --> C{Authentication Successful?}
  C -- No --> D[Return 401 Unauthorized]
  C -- Yes --> E[Extract User Roles & Permissions]
  E --> F[Check RBAC Permissions]
  F --> G{Permission Granted?}
  G -- No --> H[Return 403 Forbidden]
  G -- Yes --> I[Apply Row Level Security (RLS) Policies]
  I --> J{RLS Policy Allows Access?}
  J -- No --> K[Return 403 Forbidden]
  J -- Yes --> L[Process API Request]
  L --> M[Return Data/Response]
```

This flow diagram illustrates the enforcement of API Role-Based Access Control (RBAC) and Row Level Security (RLS) policies in API endpoints:

1. The API receives a request and authenticates the user.
2. If authentication fails, a 401 Unauthorized response is returned.
3. If successful, the system extracts the user's roles and permissions.
4. The RBAC permission check determines if the user has the necessary rights to perform the requested action.
5. If the RBAC check fails, a 403 Forbidden response is returned.
6. If RBAC passes, Row Level Security policies are applied to restrict data access at the row level based on user context.
7. If RLS policies deny access, a 403 Forbidden response is returned.
8. If RLS policies allow access, the API processes the request and returns the appropriate data or response.

This design ensures that both coarse-grained (RBAC) and fine-grained (RLS) access controls are enforced consistently for secure API data access.