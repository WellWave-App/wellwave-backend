# Quest API Documentation

## Endpoints Overview

All endpoints are prefixed with `/quests`

## Get All Quests

### Request

```http
GET /quests
```

### Response

```typescript
{
  data: QuestEntity[]
}
```

## Get Available Quests

Retrieves quests available to a specific user with their active status.

### Request

```http
GET /quests/available/:userId
```

Query Parameters:

- `filterType` (optional): `ALL` or `DOING`

### Response

```typescript
{
  data: {
    QID: number;
    QUEST_NAME: string;
    QUEST_DESCRIPTION: string;
    QUEST_TYPE: QUEST_TYPE;
    QUEST_DAY_DURATION: number;
    RQ_ACTIVITY_TARGET_TIME?: string;
    RQ_SUCCESS_HABIT?: number;
    GEM_REWARDS: number;
    EXP_REWARDS: number;
    isActive: boolean;
  }[]
}
```

## Get User Active Quests

Retrieves all active quests for a specific user with progress information.

### Request

```http
GET /quests/active/:userId
```

### Response

```typescript
{
  data: {
    QID: number;
    QUEST_NAME: string;
    QUEST_TYPE: QUEST_TYPE;
    startDate: Date;
    endDate: Date;
    progress: {
      current: number;
      target: number;
      percentage: number;
    }
    daysLeft: number;
    isExpired: boolean;
  }
  [];
}
```

## Get Specific User Quest

Retrieves detailed information about a specific quest for a user including progress.

### Request

```http
GET /quests/:userId/quests/:questId
```

### Response

```typescript
{
  data: {
    questId: number;
    questName: string;
    questType: QUEST_TYPE;
    description: string;
    startDate: Date;
    endDate: Date;
    daysLeft: number;
    isExpired: boolean;
    requirements: {
      activityTargetTime?: string;
      successHabit?: number;
    };
    rewards: {
      gem: number;
      exp: number;
    };
    progress: {
      current: number;
      target: number;
      percentage: number;
    };
  }
}
```

## Create Quest

Creates a new quest.

### Request

```http
POST /quests
```

Body:

```typescript
{
  QUEST_NAME: string;
  QUEST_DESCRIPTION: string;
  QUEST_TYPE: QUEST_TYPE;
  QUEST_DAY_DURATION: number;
  RQ_ACTIVITY_TARGET_TIME?: string;
  RQ_SUCCESS_HABIT?: number;
  GEM_REWARDS: number;
  EXP_REWARDS: number;
}
```

### Response

```typescript
{
  data: QuestEntity;
}
```

## Update Quest

Updates an existing quest. Cannot update quests with active participants.

### Request

```http
PUT /quests/:questId
```

Body:

```typescript
{
  QUEST_NAME?: string;
  QUEST_DESCRIPTION?: string;
  QUEST_TYPE?: QUEST_TYPE;
  QUEST_DAY_DURATION?: number;
  RQ_ACTIVITY_TARGET_TIME?: string;
  RQ_SUCCESS_HABIT?: number;
  GEM_REWARDS?: number;
  EXP_REWARDS?: number;
}
```

### Response

```typescript
{
  data: QuestEntity;
}
```

## Delete Quest

Deletes a quest. Cannot delete quests with active participants.

### Request

```http
DELETE /quests/:questId
```

### Response

```typescript
{
  message: 'Quest deleted successfully';
}
```

## Join Quest

Allows a user to join a quest.

### Request

```http
POST /quests/join
```

Body:

```typescript
{
  UID: number;
  QID: number;
}
```

### Response

```typescript
{
  data: UserQuestEntity;
}
```

## Enums

### QUEST_TYPE

```typescript
enum QUEST_TYPE {
  EXERCISE_DURATION = 'EXERCISE_DURATION',
  EXERCISE_STREAK = 'EXERCISE_STREAK',
  EXERCISE_SESSIONS = 'EXERCISE_SESSIONS',
  DIET_STREAK = 'DIET_STREAK',
  DIET_SESSIONS = 'DIET_SESSIONS',
  WATER_INTAKE = 'WATER_INTAKE',
  SLEEP_DURATION = 'SLEEP_DURATION',
  SLEEP_STREAK = 'SLEEP_STREAK',
  SLEEP_QUALITY = 'SLEEP_QUALITY',
  DAILY_ALL = 'DAILY_ALL',
  WEEKLY_GOAL = 'WEEKLY_GOAL',
}
```

### QuestFilterType

```typescript
enum QuestFilterType {
  ALL = 'ALL',
  DOING = 'DOING',
}
```

## Error Responses

All endpoints may return the following errors:

### 400 Bad Request

```typescript
{
  statusCode: 400,
  message: string,
  error: "Bad Request"
}
```

### 404 Not Found

```typescript
{
  statusCode: 404,
  message: string,
  error: "Not Found"
}
```

### 500 Internal Server Error

```typescript
{
  statusCode: 500,
  message: string,
  error: "Internal Server Error"
}
```
