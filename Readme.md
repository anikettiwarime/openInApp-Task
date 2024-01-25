# Task Manager API Documentation

Welcome to the documentation for the Task Manager API. This API provides functionalities for managing tasks, subtasks, user authentication, and more. Below, you'll find details about the key features, input requirements, utility functions, and scheduled tasks (cron jobs) implemented in the API.

## Features

### User Authentication

- **Register User**
  - **Endpoint:** `/api/v1/users/register`
  - **Input:**
    - `phone_number` (String, required): User's phone number.
    - `priority` (Number): User priority (0, 1, or 2).

- **Login User**
  - **Endpoint:** `/api/v1/users/login`
  - **Input:**
    - `phone_number` (String, required): User's phone number.
  - **Output:**
    - User details, access token, and refresh token.

- **Logout User**
  - **Endpoint:** `/api/v1/users/logout`
  - **Authentication:** Requires a valid access token.
  - **Output:** Success message on successful logout.

- **Refresh Access Token**
  - **Endpoint:** `/api/v1/users/refresh-token`
  - **Authentication:** Requires a valid access token.
  - **Output:** New access token and refresh token.

- **Get Current User**
  - **Endpoint:** `/api/v1/users/current-user`
  - **Authentication:** Requires a valid access token.
  - **Output:** User details.

<!-- - **Update User**
  - **Endpoint:** `/api/v1/users/update`
  - **Authentication:** Requires a valid access token.
  - **Input:**
    - `fullname` (String): User's full name.
    - `email` (String): User's email address.
  - **Output:** Updated user details. -->

### Task Management

- **Create Task**
  - **Endpoint:** `/api/v1/tasks`
  - **Authentication:** Requires a valid access token.
  - **Input:**
    - `title` (String, required): Task title.
    - `description` (String, required): Task description.
    - `due_date` (Date, required): Due date of the task.
  - **Output:** Created task details with priority.

- **Get All User Tasks**
  - **Endpoint:** `/api/v1/tasks`
  - **Authentication:** Requires a valid access token.
  - **Query Parameters:**
    - `page` (Number): Page number for pagination.
    - `limit` (Number): Number of tasks per page.
    - `priority` (Number): Task priority (0, 1, 2, or 3).
    - `due_date` (Date): Due date of the tasks (YYYY-MM-DD).
    - `status` (String): Task status ('TODO', 'IN_PROGRESS', 'DONE').
  - **Output:** Paginated list of tasks.

- **Update Task**
  - **Endpoint:** `/api/v1/tasks/:task_id`
  - **Authentication:** Requires a valid access token.
  - **Params:**
    - `task_id` (String, required): ID of the task to be updated.
  - **Input:**
    - `due_date` (Date): New due date for the task.
    - `status` (String): New status for the task ('TODO', 'IN_PROGRESS', 'DONE').
  - **Output:** Updated task details.

- **Delete Task**
  - **Endpoint:** `/api/v1/tasks/:task_id`
  - **Authentication:** Requires a valid access token.
  - **Params:**
    - `task_id` (String, required): ID of the task to be deleted.
  - **Output:** Deleted task details with all subtasks.

### Subtask Management

- **Create Subtask**
  - **Endpoint:** `/api/v1/subtasks`
  - **Authentication:** Requires a valid access token.
  - **Input:**
    - `task_id` (String, required): ID of the parent task.
    - `title` (String, required): Subtask title.
    - `description` (String): Subtask description.
  - **Output:** Created subtask details.

- **Get All Subtasks**
  - **Endpoint:** `/api/v1/subtasks`
  - **Authentication:** Requires a valid access token.
  - **Output:** List of subtasks for all user tasks.

- **Get Subtask**
  - **Endpoint:** `/api/v1/subtasks/:sub_task_id`
  - **Authentication:** Requires a valid access token.
  - **Params:**
    - `sub_task_id` (String, required): ID of the subtask.
  - **Output:** Details of the specified subtask.

- **Update Subtask**
  - **Endpoint:** `/api/v1/subtasks/:sub_task_id`
  - **Authentication:** Requires a valid access token.
  - **Params:**
    - `sub_task_id` (String, required): ID of the subtask to be updated.
  - **Input:**
    - `status` (Number, required): Updated status of the subtask (0 for incomplete, 1 for complete).
  - **Output:** Updated subtask details and updated parent task status.

- **Delete Subtask**
  - **Endpoint:** `/api/v1/subtasks/:sub_task_id`
  - **Authentication:** Requires a valid access token.
  - **Params:**
    - `sub_task_id` (String, required): ID of the subtask to be deleted.
  - **Output:** Deleted subtask details.

## Utility Functions

### JWT Verification Middleware

- **Middleware Function:** `verifyJWT`
- **Description:** Verifies the provided access token, retrieves user details, and adds them to the request object.
- **Usage:** Applied as middleware to routes requiring authentication.

### Async Handler

- **Function:** `asyncHandler(requestHandler)`
- **Description:** Wraps asynchronous request handlers, catching any unhandled promise rejections and passing them to the next middleware.
- **Usage:** Wrap asynchronous route handlers.

## Scheduled Tasks (Cron Jobs)

### Call Due Date Passed Users

- **Task Schedule:** Everyday at 12:00 PM (server time).
- **Task Details:** Calls users with tasks whose due date has passed and the status is not 'DONE', providing a reminder for their task.

### Update Task Priority

- **Task Schedule:** Everyday at midnight (server time).
- **Task Details:** Updates task priorities based on due dates, ensuring tasks are prioritized accurately.

## Installation Instructions

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/anikettiwarime/openInApp-Task
   ```

2. **Install Dependencies:**
   ```bash
   cd openInApp-Task
   npm install
   ```

3. **Set up Environment Variables:**
   ```bash
   copy .env.sample
   ```

   Edit the `.env` file and add your configuration details.

4. **Start the Server:**
   ```bash
   npm start
   ```

   The server will run on the specified port, and the cron jobs will be scheduled accordingly.

## Conclusion

This documentation provides an overview of the Task Manager API's features, input requirements, utility functions, and scheduled tasks. Explore the routes and functionalities to effectively manage tasks and subtasks. If you encounter any issues, please feel free to reach out to me at [@anikettiwarime](https://www.linkedin.com/in/anikettiwarime/).

