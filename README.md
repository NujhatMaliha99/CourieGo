# CourieGo Parcel Management

A minimal courier parcel management project built with React, Vite, Node.js, Express, and MySQL.

This repository currently contains only the **Create** part of parcel CRUD. Other teammates can add Read, Update, and Delete in separate feature branches.

## Features

- Create a parcel from the React frontend
- Store parcel data in MySQL
- Validate parcel request data
- Handle duplicate tracking IDs and invalid foreign keys

## Technology

- Node.js
- Express.js
- MySQL
- React and Vite

## Project Structure

```text
database/       MySQL schema
postman/        Postman collection
client/         React frontend
src/config/     MySQL connection
src/controllers Parcel controller
src/middleware/ Request validation
src/routes/     API routes
```

## Setup

1. Install Node.js and MySQL Server.
2. Open MySQL Workbench.
3. Run [`database/schema.sql`](database/schema.sql).
4. Copy `.env.example` to `.env`.
5. Add your MySQL credentials to `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=courier_management
```

6. Install backend and frontend dependencies:

```powershell
npm install
npm --prefix client install
```

7. Start the backend:

```powershell
npm start
```

8. In another terminal, start React:

```powershell
npm run client
```

Open [http://localhost:5173](http://localhost:5173) in a browser.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/parcels` | Create a parcel |
| `GET` | `/api/health` | Check API status |

## Sample Parcel

```json
{
  "sender_id": 1,
  "receiver_id": 1,
  "tracking_id": "CG-2026-001",
  "parcel_type": "Documents",
  "weight": 0.75,
  "charge": 120,
  "status": "pending"
}
```

Allowed statuses: `pending`, `picked_up`, `in_transit`, `out_for_delivery`, `delivered`, and `cancelled`.

## Notes

- The database schema creates sample sender `1` and receiver `1` for parcel testing.
- `.env` is ignored by Git and must not be uploaded.
- The included Postman collection can be used to test parcel creation.
