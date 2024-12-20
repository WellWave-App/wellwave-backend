# User Management API Documentation

Base URL: `localhost:3000`

## Authentication

Most endpoints are protected with JWT Authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Register User

Create a new user account.

```
POST /users/register
```

#### Request Body

```typescript
{
  EMAIL: string;          // Required
  PASSWORD?: string;      // Required if GOOGLE_ID not provided
  GOOGLE_ID?: string;     // Required if PASSWORD not provided
  USERNAME?: string;      // Optional
  YEAR_OF_BIRTH?: number; // Optional
  GENDER?: boolean;       // Optional, true = Male, false = Female
  HEIGHT?: number;        // Optional
  WEIGHT?: number;        // Optional
  GEM?: number;          // Optional, defaults to 0
  EXP?: number;          // Optional, defaults to 0
  USER_GOAL?: number;    // Optional, enum: BUILD_MUSCLE = 0, LOSE_WEIGHT = 1, STAY_HEALTHY = 2
  IMAGE_URL?: string;    // Optional
  REMINDER_NOTI_TIME?: string; // Optional
}
```

#### Password Requirements (When using password authentication)

- Minimum length: 8 characters
- At least 1 lowercase letter
- At least 1 uppercase letter
- At least 1 number

#### Response

```json
{
  "UID": number,
  "EMAIL": string,
  "USERNAME": string,
  // ... other user properties
  "createAt": string
}
```

### Get User Profile

Retrieve the authenticated user's profile information.

```
GET /users/profile
```

#### Response

```json
{
  "userInfo": {
    "UID": number,
    "USERNAME": string,
    "EMAIL": string,
    "YEAR_OF_BIRTH": number,
    "GENDER": boolean,
    "HEIGHT": number,
    "WEIGHT": number,
    "GEM": number,
    "EXP": number,
    "USER_GOAL": number,
    "IMAGE_URL": string,
    "REMINDER_NOTI_TIME": string,
    "createAt": string
  },
  "userLeague": {
    "LB_ID": number,
    "LEAGUE_NAME": string,
    "MIN_EXP": number,
    "MAX_EXP": number
  },
  "loginStats": {
    "dailyStatus": [
			{
				"date": string,
				"hasLogin": boolean,
				"loginCount": number
			}
		],
		"totalLogins":number,
		"uniqueDaysLoggedIn":number,
		"totalDaysInPeriod":number,
		"loginPercentage":number
  },
  "usersAchievement": [
    {
      "imgPath": string,
      "achTitle": string,
      "dateAcheived": string
    }
  ]
}
```

### Get All Users (Paginated)

Retrieve a paginated list of users.

```
GET /users?page={page}&limit={limit}
```

#### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

#### Response

```json
{
  "USERS": [
    {
      "UID": number,
      "USERNAME": string,
      "EMAIL": string,
      // ... other user properties
    }
  ],
  "total": number
}
```

### Get User by ID

Retrieve a specific user by their UID.

```
GET /users/:uid
```

#### Parameters

- `uid`: User ID (path parameter)

#### Response

```json
{
  "UID": number,
  "USERNAME": string,
  "EMAIL": string,
  // ... other user properties
}
```

### Update User

Update user information.

```
PATCH /users/:uid
```

#### Parameters

- `uid`: User ID (path parameter)

#### Request Body

```typescript
{
  USERNAME?: string;
  YEAR_OF_BIRTH?: number;
  GENDER?: boolean;
  HEIGHT?: number;
  WEIGHT?: number;
  USER_GOAL?: number;
  IMAGE_URL?: string;
  REMINDER_NOTI_TIME?: string;
}
```

#### Response

```json
{
  "UID": number,
  "USERNAME": string,
  // ... updated user properties
}
```

### Delete User

Delete a user account.

```
DELETE /users/:uid
```

#### Parameters

- `uid`: User ID (path parameter)

#### Response

```json
{
  "message": "User with UID {uid} successfully deleted",
  "success": true
}
```

## Error Responses

The API may return the following error responses:

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "You can only update your own profile"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "User with ID {uid} not found"
}
```

### 409 Conflict

```json
{
  "statusCode": 409,
  "message": "Email already exists"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

## Notes

1. Gender is represented as a boolean:

   - `true` = Male
   - `false` = Female

2. User Goals are represented as numbers:

   - `0` = BUILD_MUSCLE
   - `1` = LOSE_WEIGHT
   - `2` = STAY_HEALTHY

3. For user registration:

   - Either PASSWORD or GOOGLE_ID must be provided
   - If using PASSWORD, it must meet the password strength requirements
   - EMAIL must be unique in the system

4. All protected endpoints require a valid JWT token in the Authorization header
