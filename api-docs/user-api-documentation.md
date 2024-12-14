# User Management and Authentication API Documentation

## Authentication

Most endpoints require JWT authentication. The JWT token is stored in an HTTP-only cookie named 'access_token'.

## Authentication Endpoints

### 1. Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth required**: No
- **Request body**:
  ```json
  {
    "EMAIL": "user@example.com",
    "PASSWORD": "YourPassword123!"
  }
  ```
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "message": "Login Successfully"
    }
    ```
  - **Cookie**: Sets an HTTP-only cookie named `access_token` containing the JWT
- **Error Response**:
  - **Code**: 401 UNAUTHORIZED
  - **Content**: `{ "statusCode": 401, "message": "Unauthorized" }`

### 2. Google OAuth Login (use this for Login)

- **URL**: `/auth/google`
- **Method**: `GET`
- **Auth required**: No
- **Description**: Initiates Google OAuth2.0 authentication process

### 3. Google OAuth Callback (callback of /auth/google)

- **URL**: `/auth/google/callback`
- **Method**: `GET`
- **Auth required**: No
- **Description**: Handles the Google OAuth2.0 callback
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "message": "Login Successfully"
    }
    ```
  - **Cookie**: Sets an HTTP-only cookie named `access_token` containing the JWT

### 4. Logout

- **URL**: `/auth/logout`
- **Method**: `GET`
- **Auth required**: No
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "message": "Successfully logged out"
    }
    ```
  - **Cookie**: Clears the `access_token` cookie

## User Management Endpoints

### 1. Register a New User With Email Password

- **URL**: `/users/register`
- **Method**: `POST`
- **Auth required**: No
- **Request body**:
  ```json
  {
    "EMAIL": "user@example.com",
    "PASSWORD": "StrongPassword123!"
  }
  ```
- **Success Response**:
  - **Code**: 201 CREATED
  - **Content**: Created user object (excluding PASSWORD)

### 2. Get User Profile (get current user by acces_token)

- **URL**: `/users/profile`
- **Method**: `GET`
- **Auth required**: Yes (JWT in 'access_token' cookie)
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: User profile object

### 3. Get All Users (Paginated)

- **URL**: `/users`
- **Method**: `GET`
- **Auth required**: Yes (JWT in 'access_token' cookie)
- **Query Parameters**:
  - `page` (optional, default: 1)
  - `limit` (optional, default: 10)
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "USERS": [
        /* array of user objects */
      ],
      "total": 100 // Total number of users
    }
    ```

### 4. Get User by ID

- **URL**: `/users/:uid`
- **Method**: `GET`
- **Auth required**: Yes (JWT in 'access_token' cookie)
- **URL Parameters**: `uid=[integer]`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: User object
- **Error Response**:
  - **Code**: 404 NOT FOUND
  - **Content**: `{ "message": "User with ID <uid> not found" }`

### 5. Update User

- **URL**: `/users/:uid`
- **Method**: `PATCH`
- **Auth required**: Yes (JWT in 'access_token' cookie)
- **URL Parameters**: `uid=[integer]`
- **Request body**: Any of the following fields (all optional)
  ```json
  {
    "USERNAME": "string",
    "EMAIL": "string",
    "YEAR_OF_BIRTH": "number",
    "GENDER": "boolean",
    "HEIGHT": "number",
    "WEIGHT": "number",
    "GEM": "number",
    "EXP": "number",
    "USER_GOAL": "number",
    "IMAGE_URL": "string",
    "REMINDER_NOTI_TIME": "string"
  }
  ```
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Updated user object
- **Error Response**:
  - **Code**: 403 FORBIDDEN
  - **Content**: `{ "message": "You can only update your own profile" }`

### 6. Delete User

- **URL**: `/users/:uid`
- **Method**: `DELETE`
- **Auth required**: Yes (JWT in 'access_token' cookie)
- **URL Parameters**: `uid=[integer]`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "message": "User with UID {uid} successfully deleted",
      "success": true
    }
    ```
- **Error Response**:
  - **Code**: 404 NOT FOUND
  - **Content**: `{ "message": "User with ID <uid> not found" }`

## Error Handling

Common error responses:

- 400 Bad Request: The request was unacceptable, often due to missing a required parameter.
- 401 Unauthorized: No valid API key provided.
- 403 Forbidden: The API key doesn't have permissions to perform the request.
- 404 Not Found: The requested resource doesn't exist.
- 500, 502, 503, 504 Server Errors: Something went wrong on the API's end.

## Data Models

### User Object

```typescript
{
  UID: number;
  USERNAME?: string;
  EMAIL: string;
  GOOGLE_ID?: string;
  YEAR_OF_BIRTH?: number;
  GENDER?: boolean;
  HEIGHT?: number;
  WEIGHT?: number;
  GEM: number;
  EXP: number;
  USER_GOAL?: USER_GOAL;
  REMINDER_NOTI_TIME?: string;
  IMAGE_URL?: string;
  createAt: Date;
}
```

### USER_GOAL Enum

```typescript
enum USER_GOAL {
  BUILD_MUSCLE = 0,
  LOSE_WEIGHT = 1,
  STAY_HEALTHY = 2,
}
```

### GENDER

```typescript
MALE = true;
FEMALE = false;
```

## Authentication Flow

1. User registers via the `/users/register` endpoint.
2. User logs in via the `/auth/login` endpoint, providing EMAIL and PASSWORD
   a. if Google Sign in use `/auth/goole/` instead.
3. Upon successful login, the server sets an HTTP-only cookie named 'access_token' containing a JWT.
4. For subsequent authenticated requests, the client doesn't need to do anything special - the browser will automatically send the cookie with each request.
5. The server extracts the JWT from the cookie, validates it, and identifies the user for protected routes.

## Notes

- The `GENDER` field uses boolean values: `true` for MALE, `false` for FEMALE.
- Password is not returned in any response for security reasons.
- Users can only update their own profile.
- The `create` method in the service is used for both registration and creation, but the controller exposes it as `/register`.
- Google OAuth2.0 login will create a new user account if the email is not already registered.
- JWT tokens are stored in HTTP-only cookies for enhanced security.
- The Google OAuth2.0 callback URL is set to `http://localhost:3000/auth/google/callback`. This should be updated for production environments.
- When using Google login, some user information (like YEAR_OF_BIRTH and GENDER) may be populated from the Google profile if available.
- Ensure your frontend is configured to send credentials (cookies) with cross-origin requests if your API is hosted on a different domain than your frontend application.
