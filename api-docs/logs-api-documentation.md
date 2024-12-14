# Logs API Documentation

This document outlines the available endpoints for the Logs API.

## Base URL

`/logs`

## Endpoints

### 1. Create a Log

- **URL:** `/`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "UID": number,
    "LOG_NAME": string,
    "DATE": string (YYYY-MM-DD),
    "VALUE": number
  }
  ```
- **Success Response:**
  - **Code:** 201
  - **Content:** Created log object

### 2. Get All Logs

- **URL:** `/`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "LOGS": [ ...array of log objects ] }`

### 3. Get Specific Log

- **URL:** `/:uid/:logName/:date`
- **Method:** `GET`
- **URL Params:**
  - `uid`: number
  - `logName`: string (enum LOG_NAME)
  - `date`: string (YYYY-MM-DD)
- **Success Response:**
  - **Code:** 200
  - **Content:** Log object

### 4. Get Logs by User

- **URL:** `/user/:uid`
- **Method:** `GET`
- **URL Params:**
  - `uid`: number
- **Query Params:**
  - `logName`: string (optional, enum LOG_NAME)
  - `startDate`: string (optional, YYYY-MM-DD)
  - `endDate`: string (optional, YYYY-MM-DD)
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "LOGS": [ ...array of log objects ] }`

### 5. Get Weekly Logs by User

- **URL:** `/userWeekly/:uid`
- **Method:** `GET`
- **URL Params:**
  - `uid`: number
- **Query Params:**
  - `date`: string (optional, YYYY-MM-DD)
  - `logName`: string (optional, enum LOG_NAME)
- **Success Response:**
  - **Code:** 200
  - **Content:** 
    ```json
    {
      "LOGS": [ ...array of log objects ],
      "WeekDateInformation": {
        "dateSelected": string,
        "startOfWeek": string,
        "endOfWeek": string
      }
    }
    ```

### 6. Get Today's Logs by User

- **URL:** `/userToday/:uid`
- **Method:** `GET`
- **URL Params:**
  - `uid`: number
- **Query Params:**
  - `logName`: string (optional, enum LOG_NAME)
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "LOGS": [ ...array of log objects ] }`

### 7. Update a Log

- **URL:** `/:uid/:logName/:date`
- **Method:** `PATCH`
- **URL Params:**
  - `uid`: number
  - `logName`: string (enum LOG_NAME)
  - `date`: string (YYYY-MM-DD)
- **Body:** 
  ```json
  {
    "VALUE": number
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** Updated log object

### 8. Delete a Log

- **URL:** `/:uid/:logName/:date`
- **Method:** `DELETE`
- **URL Params:**
  - `uid`: number
  - `logName`: string (enum LOG_NAME)
  - `date`: string (YYYY-MM-DD)
- **Success Response:**
  - **Code:** 200
  - **Content:** 
    ```json
    {
      "message": string,
      "success": boolean
    }
    ```

## Enums

### LOG_NAME

- `HDL_LOG`
- `LDL_LOG`
- `WEIGHT_LOG`
- `SLEEP_LOG`
- `HEART_RATE_LOG`
- `CAL_BURN_LOG`
- `DRINK_LOG`
- `STEP_LOG`
- `WAIST_LINE_LOG`

## Error Responses

- **Code:** 404 NOT FOUND
  - **Content:** `{ "message": "Log not found", "error": "Not Found" }`

- **Code:** 400 BAD REQUEST
  - **Content:** `{ "message": "Invalid input", "error": "Bad Request" }`

- **Code:** 409 CONFLICT
  - **Content:** `{ "message": "Log already exists", "error": "Conflict" }`

Note: Ensure all date inputs are in the format YYYY-MM-DD.
