# CourieGo — Microsoft SQL Server Query Project

This folder is the database-lab version of CourieGo. It uses Microsoft SQL Server and raw T-SQL queries in SQL Server Management Studio (SSMS). React, Express, Postman, and API calls are not required to demonstrate these database operations.

## Run in this order

Open SSMS, connect to the local SQL Server instance, and execute:

1. `01_create_database.sql`
2. `02_create_tables.sql`
3. `03_sample_data.sql` - required roles, sender, and tracking-status reference data only
4. `04_parcel_crud.sql` — run one CRUD section at a time
5. `05_receiver_crud.sql` — run one CRUD section at a time
6. `06_join_queries.sql` - INNER, LEFT, RIGHT and FULL OUTER JOIN
7. `07_aggregate_queries.sql` - COUNT, SUM, AVG, MAX, MIN, GROUP BY and HAVING
8. `08_subqueries.sql` - scalar, IN, NOT EXISTS and correlated subqueries

The first three scripts are safe to run again: they check whether the database, tables, and sample rows already exist.

## CRUD mapping

| Operation | Raw SQL statement |
|---|---|
| Create | `INSERT` |
| Read | `SELECT` |
| Update | `UPDATE` |
| Delete | `DELETE` |

`OUTPUT INSERTED.*` shows the row created or updated. `OUTPUT DELETED.*` shows the row deleted.

## Viva demonstration

For Parcel Management:

1. Select and execute the `CREATE` section in `04_parcel_crud.sql`.
2. Execute `READ ONE` to show the inserted row.
3. Execute `UPDATE`, then its confirmation `SELECT`.
4. Execute `DELETE` last.

Repeat the same process using `05_receiver_crud.sql` for Receiver Management.

## Important constraints

- `PK_parcels` and `PK_receivers` uniquely identify rows.
- `FK_parcels_sender` requires the sender to exist in `users`.
- `FK_parcels_receiver` requires the receiver to exist in `receivers`.
- `UQ_parcels_tracking_id` prevents duplicate tracking IDs.
- `CK_parcels_weight`, `CK_parcels_charge`, and `CK_parcels_status` validate parcel values.

To inspect constraints in SSMS:

```sql
SELECT
    tc.CONSTRAINT_NAME,
    tc.CONSTRAINT_TYPE,
    kcu.TABLE_NAME,
    kcu.COLUMN_NAME
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS tc
LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS kcu
    ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
WHERE tc.TABLE_NAME IN ('parcels', 'receivers');
```

To inspect foreign-key relationships:

```sql
SELECT
    fk.name AS foreign_key_name,
    OBJECT_NAME(fk.parent_object_id) AS child_table,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS child_column,
    OBJECT_NAME(fk.referenced_object_id) AS parent_table,
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS parent_column
FROM sys.foreign_keys AS fk
INNER JOIN sys.foreign_key_columns AS fkc
    ON fk.object_id = fkc.constraint_object_id;
```
