# Quest API Documentation

## Base URL

`/api/quest`

## Authentication

All endpoints require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Create Quest

`POST /`

Creates a new quest.

**Request Body**: `multipart/form-data`

```typescript
{
  TITLE: string;              // Quest title
  IMG_URL?: string;           // Image URL (optional)
  DAY_DURATION: number;       // Duration in days
  DESCRIPTION: string;        // Quest description
  EXP_REWARDS?: number;       // Experience points reward
  GEM_REWARDS?: number;       // Gem rewards
  RELATED_HABIT_CATEGORY: HabitCategories;  // Related habit category
  EXERCISE_TYPE?: ExerciseType;             // Exercise type (optional)
  TRACKING_TYPE: TrackingType;              // How progress is tracked
  QUEST_TYPE?: QuestType;                   // Quest type (default: 'normal')
  TARGET_VALUE: number;                     // Target value to complete
  file?: File;                              // Quest image file (optional)
}
```

**Response**: `Quest` object

### Get Quests

`GET /`

Retrieves quests with optional filtering.

**Query Parameters**:

- `filter`: (optional) - Options: 'all' | 'doing' | 'not_doing'
- `category`: (optional) - HabitCategory enum value

**Response**:

```typescript
{
  ...quest,
  isActive: boolean,
  progressInfo?: {
    startDate: Date;
    endDate: Date;
    currentValue: number;
    targetValue: number;
    progressPercentage: number;
    daysLeft: number;
  }
}[]
```

### Start Quest

`POST /start/:questId`

Starts a quest for the current user.

**Parameters**:

- `questId`: number - Quest ID to start

**Response**: `UserQuests` object

### Track Progress

`POST /track`

Records progress for an active quest.

**Request Body**:

```typescript
{
  QID: number; // Quest ID
  value: number; // Progress value to add
}
```

**Response**: `QuestProgress` object

### Get Quest Stats

`GET /stats/:questId`

Retrieves detailed statistics for a specific quest.

**Parameters**:

- `questId`: number - Quest ID

**Response**:

```typescript
{
  startDate: Date;
  endDate: Date;
  status: QuestStatus;
  currentValue: number;
  targetValue: number;
  progressPercentage: number;
  progressHistory: QuestProgress[];
  daysLeft: number;
}
```

## Enums

### QuestType

```typescript
enum QuestType {
  NORMAL = 'normal',
  STREAK_BASED = 'streak_based',
  COMPLETION_BASED = 'completion_based',
  START_BASED = 'start_based',
  DAILY_COMPLETION = 'daily_completion',
}
```

### QuestStatus

```typescript
enum QuestStatus {
  Active = 'active',
  Completed = 'completed',
  Failed = 'failed',
}
```

### TrackingType

```typescript
enum TrackingType {
  Duration = 'duration',
  Distance = 'distance',
  Count = 'count',
}
```

### HabitCategories

```typescript
enum HabitCategories {
  Exercise = 'exercise',
  Meditation = 'meditation',
  Reading = 'reading',
  Learning = 'learning',
  // Add other categories as needed
}
```

## Error Responses

- 400: Bad Request - Invalid input
- 401: Unauthorized - Invalid/missing token
- 404: Not Found - Quest not found
- 409: Conflict - Quest already active
