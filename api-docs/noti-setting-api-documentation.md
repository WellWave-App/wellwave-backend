# Notification Settings API Documentation

Base URL: `localhost:3000`

## Authentication

All endpoints are protected with JWT Authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Get Notification Setting

Retrieves a specific notification setting for the authenticated user.

```
GET /noti-setting/get-noti/:notificationType
```

#### Parameters

- `notificationType` (path parameter): Type of notification to retrieve
  - Valid values: `BEDTIME`, `WATER_RANGE`, `WATER_PLAN`

#### Response

```json
{
  "UID": number,
  "NOTIFICATION_TYPE": string,
  "IS_ACTIVE": boolean,
  "CREATE_AT": string,
  // Additional fields based on notification type
}
```

### Set Bedtime Notification

Configure bedtime notification settings.

```
POST /noti-setting/set-bed-time
```

#### Request Body

```typescript
{
  UID: number;          // Required
  IS_ACTIVE?: boolean;  // Optional
  BEDTIME?: string;     // Optional, format: "HH:mm" (00:00-23:59)
  WAKE_TIME?: string;   // Optional, format: "HH:mm" (00:00-23:59)
}
```

#### Response

```json
{
  "settingType": "BEDTIME",
  "isActive": boolean,
  "setting": {
    "UID": number,
    "NOTIFICATION_TYPE": "BEDTIME",
    "BEDTIME": string,    // Format: "HH:mm:ss"
    "WAKE_TIME": string   // Format: "HH:mm:ss"
  }
}
```

### Set Water Range Notification

Configure water intake time range settings.

```
POST /noti-setting/set-water-range
```

#### Request Body

```typescript
{
  UID: number;              // Required
  START_TIME?: string;      // Optional, format: "HH:mm" (00:00-23:59)
  END_TIME?: string;        // Optional, format: "HH:mm" (00:00-23:59)
  GLASSES_PER_DAY?: number; // Optional, positive number
  INTERVAL_MINUTES?: number;// Optional, positive number
  IS_ACTIVE?: boolean;      // Optional
}
```

#### Response

```json
{
  "settingType": "WATER_RANGE",
  "isActive": boolean,
  "setting": {
    "UID": number,
    "NOTIFICATION_TYPE": "WATER_RANGE",
    "START_TIME": string,        // Format: "HH:mm:ss"
    "END_TIME": string,         // Format: "HH:mm:ss"
    "GLASSES_PER_DAY": number,
    "INTERVAL_MINUTES": number
  }
}
```

### Set Water Plan Notification

Configure specific water intake notifications.

```
POST /noti-setting/set-water-plan
```

#### Request Body

```typescript
{
  UID: number;          // Required
  GLASS_NUMBER: number; // Optional(Require), positive number,
  NOTI_TIME?: string;  // Optional, format: "HH:mm" (00:00-23:59)
  IS_ACTIVE?: boolean; // Optional ส่งมาทุกรอบก็ได้ ถ้าไม่ส่งมา default = false
}
```

#### Response

```json
{
  "settingType": "WATER_PLAN",
  "isActive": boolean,
  "setting": [
    {
      "UID": number,
      "NOTIFICATION_TYPE": "WATER_PLAN",
      "GLASS_NUMBER": number,
      "NOTI_TIME": string      // Format: "HH:mm:ss"
    }
    // ... array of all water plan settings for the user
  ]
}
```

#### Request Body For Toggle IS_ACTIVE of WATER_PLAN

```typescript
{
  UID: number;          // Required
  IS_ACTIVE?: boolean; // Optional
}
```

#### Response

```json
{
  "settingType": "WATER_PLAN",
  "isActive": boolean,
  "setting": [
    {
      "UID": number,
      "NOTIFICATION_TYPE": "WATER_PLAN",
      "GLASS_NUMBER": number,
      "NOTI_TIME": string      // Format: "HH:mm:ss"
    }
    // ... array of all water plan settings for the user
  ]
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

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Not found notification {type} setting"
}
```

### 409 Conflict

```json
{
  "statusCode": 409,
  "message": "This {type} setting of user with UID:{uid} already exist"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Failed to update settings",
  "error": "Error message details"
}
```

## Time Format Notes

- Input times should be in 24-hour "HH:mm" format (e.g., "13:30", "09:15")
- Response times will be in "HH:mm:ss" format (e.g., "13:30:00", "09:15:00")
- All times use 24-hour format (00:00-23:59)
