# Task Manager API

A RESTful API for managing tasks, built with **Node.js** and **Express.js** using
**in-memory data storage**.

Assignment 1 — Airtribe Backend Engineering Launchpad.

### Features

- **Full CRUD** — create, read, update, and delete tasks
- **Input validation** — non-empty `title` and `description`, strictly boolean
  `completed`, all enforced by middleware before a request reaches a controller
- **Centralised error handling** — every error returns the same JSON shape with
  the correct status code (`400` / `404` / `500`)
- **Filtering** — `GET /tasks?completed=true`
- **Sorting** — by creation date, ascending or descending
- **Priority levels** — `low` / `medium` / `high`, with a dedicated lookup endpoint
- **Layered structure** — routes, controllers, middlewares, and model in separate folders

### Tech stack

| | |
| --- | --- |
| Runtime | Node.js (>= 18) |
| Framework | Express.js 4 |
| Storage | In-memory array (seeded from `task.json`) |
| Testing | tap + supertest |

---

## Setup instructions

**Prerequisites:** Node.js version 18 or higher. Check with `node -v`.

**1. Clone the repository**

```bash
git clone <your-repository-url>
cd task-manager-api
```

**2. Install dependencies**

```bash
npm install
```

This installs Express (runtime) plus tap and supertest (development).

**3. Start the server**

```bash
npm start
```

You should see:

```
Server is listening on 3000
```

**4. Verify it is running**

In a second terminal:

```bash
curl http://localhost:3000/tasks
```

A JSON array of 15 seeded tasks confirms everything works.

**Available scripts**

| Command | Description |
| ------- | ----------- |
| `npm start` | Start the server on port 3000 |
| `npm test` | Run the automated test suite |

The port can be changed with the `PORT` environment variable:
`PORT=4000 npm start`

---

## Data storage

Tasks live in an **in-memory array**. On startup the array is seeded from
[`task.json`](task.json), which is read once and never written back — so every
restart resets the data to the original 15 tasks. This is deliberate: the
assignment calls for in-memory storage, and it keeps the test suite repeatable.

Each task has the following shape:

| Field         | Type      | Notes                                        |
| ------------- | --------- | -------------------------------------------- |
| `id`          | number    | Auto-assigned, `max(id) + 1`                  |
| `title`       | string    | Required, non-empty                           |
| `description` | string    | Required, non-empty                           |
| `completed`   | boolean   | Required, strictly boolean                    |
| `priority`    | string    | `low` \| `medium` \| `high` — defaults to `medium` |
| `createdAt`   | string    | ISO 8601 timestamp                            |

---

## API reference

Base URL: `http://localhost:3000`

All requests and responses use JSON. Requests with a body must send the
`Content-Type: application/json` header.

| Method | Endpoint | Description | Success |
| ------ | -------- | ----------- | ------- |
| `GET` | `/tasks` | Retrieve all tasks (filterable, sortable) | `200` |
| `GET` | `/tasks/:id` | Retrieve a single task by id | `200` |
| `GET` | `/tasks/priority/:level` | Retrieve tasks by priority level | `200` |
| `POST` | `/tasks` | Create a new task | `201` |
| `PUT` | `/tasks/:id` | Update an existing task | `200` |
| `DELETE` | `/tasks/:id` | Delete a task | `200` |

---

### `GET /tasks`

Returns all tasks as an array, **sorted by creation date (oldest first) by
default**. Filtering and sorting can be combined in a single request.

**Query parameters (all optional):**

| Param       | Values             | Description                                    |
| ----------- | ------------------ | ---------------------------------------------- |
| `completed` | `true` \| `false`  | Filter by completion status                    |
| `sort`      | `createdAt`        | Sort field (default `createdAt`)               |
| `order`     | `asc` \| `desc`    | Sort direction (default `asc`)                 |

```bash
curl http://localhost:3000/tasks
curl "http://localhost:3000/tasks?completed=true"
curl "http://localhost:3000/tasks?order=desc"
curl "http://localhost:3000/tasks?completed=true&order=desc"
```

**`200 OK`**

```json
[
  {
    "id": 1,
    "title": "Set up environment",
    "description": "Install Node.js, npm, and git",
    "completed": true,
    "priority": "medium",
    "createdAt": "2026-08-08T05:54:47.658Z"
  }
]
```

---

### `GET /tasks/:id`

Returns a single task.

```bash
curl http://localhost:3000/tasks/1
```

`200 OK` with the task · `404 Not Found` if no such id · `400 Bad Request` if
the id is not a positive integer.

---

### `GET /tasks/priority/:level`

Returns all tasks with the given priority. `:level` must be `low`, `medium`, or
`high`.

```bash
curl http://localhost:3000/tasks/priority/high
```

`200 OK` with an array · `400 Bad Request` for an unknown level.

---

### `POST /tasks`

Creates a task. `title`, `description`, and `completed` are required;
`priority` is optional.

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Ship it","description":"Deploy the API","completed":false,"priority":"high"}'
```

**`201 Created`**

```json
{
  "id": 16,
  "title": "Ship it",
  "description": "Deploy the API",
  "completed": false,
  "priority": "high",
  "createdAt": "2026-08-08T05:55:02.658Z"
}
```

`400 Bad Request` if validation fails.

---

### `PUT /tasks/:id`

Replaces a task. Same validation rules as `POST`. The `id` and `createdAt` of
the existing task are preserved.

```bash
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated","description":"Updated description","completed":true}'
```

`200 OK` with the updated task · `404 Not Found` · `400 Bad Request`.

---

### `DELETE /tasks/:id`

Deletes a task and returns the deleted object.

```bash
curl -X DELETE http://localhost:3000/tasks/1
```

`200 OK` with the deleted task · `404 Not Found` · `400 Bad Request`.

---

## Validation rules

Validation runs as middleware before the controller, so handlers only ever see
well-formed input.

- `title` — must be a **non-empty string**
- `description` — must be a **non-empty string**
- `completed` — must be a **strict boolean**. `"true"` (a string) is rejected
  rather than coerced, since silently accepting it would let bad data into the
  store.
- `priority` — optional; if present must be `low`, `medium`, or `high`
- `:id` — must be a positive integer

---

## Error handling

Every error flows through a single error-handling middleware, so responses have
a consistent shape:

```json
{
  "error": "Invalid task payload",
  "details": [
    "description is required and must be a non-empty string",
    "completed is required and must be a boolean"
  ]
}
```

`details` is only present for validation errors, and lists **all** problems at
once rather than failing on the first.

| Status | When                                                                 |
| ------ | -------------------------------------------------------------------- |
| `400`  | Failed validation, bad query param, non-integer id, malformed JSON   |
| `404`  | Task id does not exist, or the route does not exist                  |
| `500`  | Unexpected server error (details logged, never leaked to the client) |

---

## Project structure

```
.
├── app.js                          # Express setup, middleware, route mounting
├── task.json                       # Seed data (read-only)
├── routes
│   └── taskRoutes.js               # /tasks router
├── controllers
│   └── taskController.js           # Request handlers
├── middlewares
│   ├── validateTask.js             # Body and param validation
│   └── errorHandler.js             # 404 + central error handling
├── models
│   └── taskModel.js                # In-memory task storage
└── test
    └── server.test.js              # tap + supertest suite
```

Concerns are split so each file has one job: routes declare the surface,
middleware guards it, controllers handle requests, and the model owns the data.

---

## How to test the API

There are three ways to test: the automated suite, curl, and Postman.

### 1. Automated test suite

No running server is needed — supertest starts the app itself.

```bash
npm test
```

Expected output:

```
1..10
# { total: 19, pass: 19 }
```

All 10 test cases pass (19 assertions). The suite covers the happy path and the
error path for every endpoint — invalid payloads, unknown ids, and strict type
checking on `completed`.

### 2. Testing with curl

Start the server first (`npm start`), then run these from a second terminal.

**Happy path — full CRUD cycle**

```bash
# Retrieve all tasks
curl http://localhost:3000/tasks

# Retrieve one task
curl http://localhost:3000/tasks/1

# Create a task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Write tests","description":"Cover all endpoints","completed":false,"priority":"high"}'

# Update a task
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated title","description":"Updated description","completed":true}'

# Delete a task
curl -X DELETE http://localhost:3000/tasks/1
```

**Filtering, sorting, and priority**

```bash
curl "http://localhost:3000/tasks?completed=true"           # only completed
curl "http://localhost:3000/tasks?completed=false"          # only incomplete
curl "http://localhost:3000/tasks?order=desc"               # newest first
curl "http://localhost:3000/tasks?completed=true&order=desc" # combined
curl http://localhost:3000/tasks/priority/high              # by priority
```

**Validation and error handling**

Add `-i` to any command to see the status code in the response headers.

```bash
# 400 — empty title
curl -i -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"","description":"Valid","completed":false}'

# 400 — completed sent as a string instead of a boolean
curl -i -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Valid","description":"Valid","completed":"false"}'

# 400 — invalid priority
curl -i -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Valid","description":"Valid","completed":false,"priority":"urgent"}'

# 404 — task does not exist
curl -i http://localhost:3000/tasks/999

# 400 — id is not a number
curl -i http://localhost:3000/tasks/abc

# 404 — route does not exist
curl -i http://localhost:3000/unknown
```

**Expected results**

| Request | Status | Response |
| ------- | ------ | -------- |
| `GET /tasks` | `200` | Array of tasks |
| `GET /tasks/1` | `200` | Single task object |
| `POST /tasks` valid | `201` | Created task with new `id` |
| `PUT /tasks/1` valid | `200` | Updated task |
| `DELETE /tasks/1` | `200` | Deleted task |
| Empty `title` | `400` | `{"error":"Invalid task payload","details":[...]}` |
| `completed:"false"` | `400` | `{"error":"Invalid task payload","details":[...]}` |
| `priority:"urgent"` | `400` | `{"error":"Invalid task payload","details":[...]}` |
| `GET /tasks/999` | `404` | `{"error":"Task with id 999 not found"}` |
| `GET /tasks/abc` | `400` | `{"error":"Task id must be a positive integer"}` |
| `GET /unknown` | `404` | `{"error":"Route not found: GET /unknown"}` |

### 3. Testing with Postman

1. Start the server with `npm start`.
2. Create a new request and set the URL to `http://localhost:3000/tasks`.
3. For `POST` and `PUT`, open the **Body** tab, select **raw**, and choose
   **JSON** from the dropdown. Postman then sets `Content-Type: application/json`
   automatically.
4. Paste a request body, for example:

   ```json
   {
     "title": "Write tests",
     "description": "Cover all endpoints",
     "completed": false,
     "priority": "high"
   }
   ```

5. Click **Send** and check the status code and response body against the table
   above.

To test query parameters, use the **Params** tab and add keys such as
`completed` = `true` or `order` = `desc` — Postman appends them to the URL.

To confirm error handling, send a body with an empty `title`, or with
`"completed": "false"` as a string, and verify a `400` is returned with a
`details` array explaining what failed.
