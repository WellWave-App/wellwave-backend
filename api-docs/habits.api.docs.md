# Habits API Documentation

## Base URL

`/habit`

## Authentication

All endpoints require JWT Bearer token authentication.

```
Authorization: Bearer <token>
```

## Endpoints

### Create Habit

`POST /habit`

- Role required: ADMIN, MODERATOR
- Content-Type: multipart/form-data

**Request Body:**

```typescript
{
  TITLE: string;
  DESCRIPTION?: string;
  ADVICE?: string;
  CATEGORY: "exercise" | "diet" | "sleep";
  EXERCISE_TYPE?: "walking" | "running" | "cycling" | "swimming" | "strength" | "hiit" | "yoga" | "other";
  TRACKING_TYPE: "duration" | "distance" | "boolean" | "count";
  EXP_REWARD?: number;
  GEM_REWARD?: number;
  DEFAULT_DURATION_MINUTES?: number;
  DEFAULT_DAYS_GOAL?: number;
  CONDITIONS?: {
    DIABETES_CONDITION: boolean;
    OBESITY_CONDITION: boolean;
    DYSLIPIDEMIA_CONDITION: boolean;
    HYPERTENSION_CONDITION: boolean;
  };
  THUMBNAIL_URL?: string;
  IS_DAILY: boolean;
  file?: File; // Max size: 10MB, Types: jpeg/png/gif
}
```

### Get Habits List

`GET /habit`

- Role required: ADMIN, MODERATOR, USER

**Query Parameters:**

```typescript
{
  filter?: "ALL" | "DOING" | "NOT_DOING";
  category?: "exercise" | "diet" | "sleep";
  page?: number;
  limit?: number;
  pagination?: boolean;
}
```

### Start Habit Challenge

`POST /habit/challenge`

- Role required: ADMIN, MODERATOR, USER

**Request Body:**

```typescript
{
  UID?: number;
  HID: number;
  DAILY_MINUTE_GOAL?: number;
  DAYS_GOAL?: number;
  IS_NOTIFICATION_ENABLED?: boolean;
  WEEKDAYS_NOTI?: {
    Sunday: boolean;
    Monday: boolean;
    Tuesday: boolean;
    Wednesday: boolean;
    Thursday: boolean;
    Friday: boolean;
    Saturday: boolean;
  };
}
```

### Track Habit Progress

`POST /habit/track`

- Role required: ADMIN, MODERATOR, USER

**Request Body:**

```typescript
{
  CHALLENGE_ID: number;
  TRACK_DATE?: string; // YYYY-MM-DD format
  DURATION_MINUTES?: number; // Required for duration tracking type
  DISTANCE_KM?: number;      // Required for distance tracking type
  COUNT_VALUE?: number;      // Required for count tracking type
  COMPLETED?: boolean;       // Required for boolean tracking type
  MOOD_FEEDBACK?: "ท้อแท้" | "กดดัน" | "เฉยๆ" | "พอใจ" | "สดใส";
}
```

### Get User Habits

`GET /habit/user`

- Role required: ADMIN, MODERATOR, USER

**Query Parameters:**

```typescript
{
  status?: "active" | "completed" | "failed" | "cancled";
  page?: number;
  limit?: number;
  pagination?: boolean;
}
```

### Get Habit Challenge Statistics

`GET /habit/stats/:challengeId`

- Role required: ADMIN, MODERATOR, USER

**Response:**

```typescript
{
  totalDays: number;
  completedDays: number;
  currentStreak: number;
  totalValue: number;
  progressPercentage: number;
  status: 'active' | 'completed' | 'failed' | 'cancled';
  dailyTracks: Array<{
    TRACK_ID: number;
    CHALLENGE_ID: number;
    TRACK_DATE: string;
    COMPLETED: boolean;
    DURATION_MINUTES?: number;
    DISTANCE_KM?: number;
    COUNT_VALUE?: number;
    MOOD_FEEDBACK?: string;
  }>;
}
```

### Get Daily Habits

`GET /habit/daily`

- Role required: ADMIN, MODERATOR, USER

**Response:**

```typescript
{
  data: Array<{
    CHALLENGE_ID: number;
    HID: number;
    TITLE: string;
    THUMBNAIL_URL: string;
    EXP_REWARD: number;
  }>;
  meta: {
    total: number;
  }
}
```

## Error Responses

### Common Error Status Codes

- 400: Bad Request - Invalid input data
- 401: Unauthorized - Missing or invalid JWT token
- 403: Forbidden - Insufficient role permissions
- 404: Not Found - Resource not found
- 409: Conflict - Resource conflict (e.g., active challenge already exists)
- 500: Internal Server Error

### Error Response Format

```typescript
{
  statusCode: number;
  message: string | string[];
  error: string;
}
```
