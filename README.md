# CourieGo — Microsoft SQL Server

Courier management project using React, Express, raw parameterized T-SQL, and Microsoft SQL Server Express. SQL Server Management Studio (SSMS) is used to inspect and demonstrate the database.

## Database

- Server: `DESKTOP-N4MRI66\\SQLEXPRESS`
- Database: `courier_management`
- Authentication: Windows Authentication
- Full SSMS scripts: [`database-mssql/`](database-mssql/README.md)

Execute the numbered scripts in `database-mssql` when creating the database on another computer.

## Application flow

```text
React frontend -> Express routes -> parameterized raw T-SQL -> SQL Server
                                                         -> viewed in SSMS
```

The backend uses `mssql/msnodesqlv8` and Windows Authentication. No MySQL installation or password is required.

## Setup

1. Install Node.js, SQL Server Express, and SSMS.
2. Run `database-mssql/01_create_database.sql`, `02_create_tables.sql`, and `03_sample_data.sql` in SSMS.
3. Install dependencies:

```powershell
npm install
npm --prefix client install
```

4. Start the backend:

```powershell
npm start
```

5. Start the frontend in another PowerShell window:

```powershell
npm run client
```

Open `http://localhost:5173`.

## Endpoints

| Method | Endpoint | Operation |
|---|---|---|
| `GET` | `/api/parcels` | Read all parcels |
| `GET` | `/api/parcels/:id` | Read one parcel |
| `POST` | `/api/parcels` | Create parcel |
| `PUT` | `/api/parcels/:id` | Update parcel |
| `GET` | `/api/receivers` | Read all receivers |
| `GET` | `/api/receivers/:id` | Read one receiver |
| `POST` | `/api/receivers` | Create receiver |
| `PUT` | `/api/receivers/:id` | Update receiver |

Delete is available as a raw SQL demonstration in the numbered SSMS CRUD scripts.

## Optional environment settings

Defaults work on this computer. On another computer, create `.env` with:

```env
PORT=5000
DB_SERVER=COMPUTER-NAME\\SQLEXPRESS
DB_NAME=courier_management
```
