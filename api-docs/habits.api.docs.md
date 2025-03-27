# Quest API Documentation

## Base URL

```
/api/quest
```

## Authentication

All endpoints require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Create Quest

Create a new quest in the system.

**Endpoint:** `POST /`  
**Auth Required:** Yes  
**Content-Type:** `multipart/form-data`

**Request Body:**

```typescript
{
  TITLE: string;                    // Required: Quest title
  IMG_URL?: string;                 // Optional: Image URL
  DAY_DURATION: number;             // Required: Duration in days
  DESCRIPTION: string;              // Required: Quest description
  EXP_REWARDS?: number;             // Optional: Experience points reward
  GEM_REWARDS?: number;             // Optional: Gem rewards
  RELATED_HABIT_CATEGORY: string;   // Required: Category of related habit
  EXERCISE_TYPE?: string;           // Optional: Type of exercise
  TRACKING_TYPE: string;            // Required: Type of tracking
  QUEST_TYPE?: string;              // Optional: Type of quest (default: 'normal')
  TARGET_VALUE: number;             // Required: Target value to complete
  file?: File;                      // Optional: Quest image file
}
```

**Enums:**

```typescript
enum HabitCategories {
  Exercise = 'exercise',
  Diet = 'diet',
  Sleep = 'sleep',
}

enum ExerciseType {
  Walking = 'walking',
  Running = 'running',
  Cycling = 'cycling',
  Swimming = 'swimming',
  Strength = 'strength',
  HIIT = 'hiit',
  Yoga = 'yoga',
  // Other = 'other',
}

TrackingType {
  Duration = 'duration', // For timed activities (exercise)
  Distance = 'distance', // For distance-based activities (walking, running)
  Boolean = 'boolean', // For yes/no activities (sleep, diet)
  Count = 'count', // For counted activities (steps, repetitions)
}

enum QuestType {
  NORMAL = 'normal', // Regular tracking quests (minutes, distance, etc.)
  STREAK_BASED = 'streak_based', // Streak achievement quests
  COMPLETION_BASED = 'completion_based', // Challenge completion quests
  START_BASED = 'start_based', // Starting new habits quests
  DAILY_COMPLETION = 'daily_completion', // Daily habit completion quests
}
```

**Response:** `201 Created`

```typescript
{
  QID: number;
  // ... other quest properties
}
```

### Get Quests

Retrieve quests with optional filtering.

**Endpoint:** `GET /`  
**Auth Required:** Yes

**Query Parameters:**

- `filter` (optional): Enum `QuestListFilter` - Filter type ('ALL' | 'DOING' | 'NOT_DOING')
- `category` (optional): Enum `HabitCategories` - Filter by habit category

**Response:** `200 OK`

```typescript
[
  {
    QID: number;
    TITLE: string;
    DESCRIPTION: string;
    // ... other quest properties
    isActive: boolean;
    progressInfo?: {
      startDate: Date;
      endDate: Date;
      currentValue: number;
      targetValue: number;
      progressPercentage: number;
      daysLeft: number;
    }
  }
]
```

### Start Quest

Start a quest for the current user.

**Endpoint:** `POST /start/:questId`  
**Auth Required:** Yes

**URL Parameters:**

- `questId`: number - ID of the quest to start

**Response:** `201 Created`

```typescript
{
  QID: number;
  UID: number;
  START_DATE: Date;
  END_DATE: Date;
  STATUS: QuestStatus;
  PROGRESS_PERCENTAGE: number;
}
```

**Possible Errors:**

- `404 Not Found`: Quest not found
- `409 Conflict`: Quest already active

### Track Quest Progress

Track progress for an active quest.

**Endpoint:** `POST /track`  
**Auth Required:** Yes

**Request Body:**

```typescript
{
  QID: number; // Quest ID
  value: number; // Progress value to add
}
```

**Response:** `201 Created`

```typescript
{
  PROGRESS_ID: number;
  QID: number;
  UID: number;
  TRACK_DATE: Date;
  VALUE_COMPLETED: number;
}
```

**Possible Errors:**

- `404 Not Found`: Active quest not found

### Get Quest Statistics

Get detailed statistics for a specific quest.

**Endpoint:** `GET /stats/:questId`  
**Auth Required:** Yes

**URL Parameters:**

- `questId`: number - ID of the quest

**Response:** `200 OK`

```typescript
{
  startDate: Date;
  endDate: Date;
  status: QuestStatus;
  currentValue: number;
  targetValue: number;
  progressPercentage: number;
  progressHistory: Array<{
    PROGRESS_ID: number;
    TRACK_DATE: Date;
    VALUE_COMPLETED: number;
  }>;
  daysLeft: number;
}
```

**Possible Errors:**

- `404 Not Found`: Quest not found

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

## Notes for Frontend Implementation

1. File Upload:

   - When creating a quest with an image, use `multipart/form-data`
   - Maximum file size: 10MB
   - Supported formats: JPEG, PNG, GIF

2. Progress Tracking:

   - Progress percentage is automatically calculated based on target value
   - Quest status automatically updates to 'completed' when progress reaches 100%
   - Progress values are cumulative

3. Real-time Considerations:

   - Quest progress is synced with habit tracking
   - Consider implementing polling or WebSocket for real-time progress updates

4. Error Handling:
   - Always check response status codes
   - Implement proper error handling for file uploads
   - Handle network timeouts appropriately

## Example Usage

### Creating a Quest

```javascript
const formData = new FormData();
formData.append('TITLE', 'Run 30 Days');
formData.append('DAY_DURATION', '30');
formData.append('DESCRIPTION', 'Run 5km every day for 30 days');
formData.append('RELATED_HABIT_CATEGORY', 'EXERCISE');
formData.append('TRACKING_TYPE', 'DISTANCE');
formData.append('TARGET_VALUE', '150');
formData.append('file', imageFile);

const response = await fetch('/api/quest', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

### Tracking Progress

```javascript
const response = await fetch('/api/quest/track', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    QID: questId,
    value: 5, // e.g., 5km run
  }),
});
```
