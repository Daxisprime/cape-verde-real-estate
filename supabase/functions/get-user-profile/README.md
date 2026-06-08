# Get User Profile Edge Function

Fetches a user's profile along with all their active (public) external links in a single API call.

## Deployment

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy get-user-profile
```

## Usage

### Endpoints

```
GET /functions/v1/get-user-profile?userId=<uuid>
GET /functions/v1/get-user-profile?slug=<agent-slug>
GET /functions/v1/get-user-profile?userId=<uuid>&includeStats=true
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | UUID | One of userId or slug | The user's UUID from auth.users |
| `slug` | string | One of userId or slug | URL-friendly name (e.g., "maria-santos") |
| `includeStats` | boolean | No | Include property statistics for agents |

### Example Requests

```bash
# By user ID
curl -X GET \
  'https://your-project.supabase.co/functions/v1/get-user-profile?userId=123e4567-e89b-12d3-a456-426614174000' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'

# By slug (agent name)
curl -X GET \
  'https://your-project.supabase.co/functions/v1/get-user-profile?slug=maria-santos' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'

# With stats
curl -X GET \
  'https://your-project.supabase.co/functions/v1/get-user-profile?userId=123e4567-e89b-12d3-a456-426614174000&includeStats=true' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

### Success Response (200)

```json
{
  "profile": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "maria.santos@example.com",
    "full_name": "Maria Santos",
    "avatar_url": "https://example.com/avatar.jpg",
    "phone": "+238 260 1234",
    "roles": ["agent"],
    "is_verified": true,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "links": [
    {
      "id": "link-uuid-1",
      "platform": "whatsapp",
      "formatted_url": "https://wa.me/2382601234",
      "display_label": "WhatsApp",
      "is_verified": true,
      "display_order": 0
    },
    {
      "id": "link-uuid-2",
      "platform": "instagram",
      "formatted_url": "https://instagram.com/maria.santos",
      "display_label": "@maria.santos",
      "is_verified": false,
      "display_order": 1
    }
  ],
  "stats": {
    "properties_count": 24,
    "active_listings": 18
  }
}
```

### Error Responses

#### Missing Parameters (400)

```json
{
  "error": "Missing required parameter: userId or slug",
  "code": "MISSING_PARAMS",
  "details": "Provide either ?userId=<uuid> or ?slug=<agent-slug>"
}
```

#### Invalid UUID (400)

```json
{
  "error": "Invalid userId format",
  "code": "INVALID_REQUEST",
  "details": "userId must be a valid UUID"
}
```

#### Profile Not Found (404)

```json
{
  "error": "User profile not found",
  "code": "PROFILE_NOT_FOUND",
  "details": "No profile exists for user ID: 123e4567-..."
}
```

#### Profile Inactive (403)

```json
{
  "error": "User profile is inactive",
  "code": "PROFILE_INACTIVE",
  "details": "This profile has been deactivated"
}
```

#### Database Error (500)

```json
{
  "error": "Database error while fetching profile",
  "code": "DATABASE_ERROR",
  "details": "Error message from database"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `MISSING_PARAMS` | Neither userId nor slug was provided |
| `INVALID_REQUEST` | Invalid parameter format |
| `USER_NOT_FOUND` | No user exists with the given ID |
| `PROFILE_NOT_FOUND` | User exists but has no profile |
| `PROFILE_INACTIVE` | Profile exists but is deactivated |
| `DATABASE_ERROR` | Database query failed |

## Frontend Usage

```typescript
// Using fetch
async function getUserProfile(userId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-user-profile?userId=${userId}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return response.json();
}

// Using Supabase client
async function getUserProfileWithClient(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase.functions.invoke('get-user-profile', {
    body: { userId },
  });

  if (error) throw error;
  return data;
}
```

## Caching

Responses are cached for 60 seconds (`Cache-Control: public, max-age=60`).

## Security Notes

- Only public links (`is_public = true`) are returned
- Inactive profiles return a 403 error
- Service role key is used internally for database access
- CORS is enabled for browser requests
