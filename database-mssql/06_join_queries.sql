USE courier_management;
GO

-- 1. INNER JOIN
-- Only parcels that have matching sender and receiver records.
SELECT
    p.parcel_id,
    p.tracking_id,
    s.full_name AS sender_name,
    r.full_name AS receiver_name,
    p.parcel_type,
    p.status
FROM dbo.parcels AS p
INNER JOIN dbo.users AS s
    ON p.sender_id = s.user_id
INNER JOIN dbo.receivers AS r
    ON p.receiver_id = r.receiver_id
ORDER BY p.parcel_id;
GO

-- 2. LEFT OUTER JOIN
-- Shows every receiver, including receivers who have no parcel.
SELECT
    r.receiver_id,
    r.full_name AS receiver_name,
    p.parcel_id,
    p.tracking_id,
    p.status
FROM dbo.receivers AS r
LEFT OUTER JOIN dbo.parcels AS p
    ON r.receiver_id = p.receiver_id
ORDER BY r.receiver_id;
GO

-- 3. RIGHT OUTER JOIN
-- Shows every receiver, including receivers who have no parcel.
SELECT
    p.parcel_id,
    p.tracking_id,
    r.receiver_id,
    r.full_name AS receiver_name
FROM dbo.parcels AS p
RIGHT OUTER JOIN dbo.receivers AS r
    ON p.receiver_id = r.receiver_id
ORDER BY r.receiver_id;
GO

-- 4. FULL OUTER JOIN
-- Shows all parcels and all receivers, whether they match or not.
SELECT
    p.parcel_id,
    p.tracking_id,
    r.receiver_id,
    r.full_name AS receiver_name
FROM dbo.parcels AS p
FULL OUTER JOIN dbo.receivers AS r
    ON p.receiver_id = r.receiver_id
ORDER BY r.receiver_id, p.parcel_id;
GO
