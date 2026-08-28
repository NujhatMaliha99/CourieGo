USE courier_management;
GO

-- INNER JOIN
-- Returns only parcels that have matching Sender and Receiver records.
-- Foreign keys:
-- parcels.sender_id  -> users.user_id
-- parcels.receiver_id -> receivers.receiver_id
SELECT
    p.parcel_id,
    p.tracking_id,
    s.user_id AS sender_id,
    s.full_name AS sender_name,
    r.receiver_id,
    r.full_name AS receiver_name,
    p.parcel_type,
    p.charge,
    p.status
FROM dbo.parcels AS p
INNER JOIN dbo.users AS s
    ON p.sender_id = s.user_id
INNER JOIN dbo.receivers AS r
    ON p.receiver_id = r.receiver_id
ORDER BY p.parcel_id;
GO

-- LEFT OUTER JOIN
-- Returns every Receiver. Parcel columns are NULL when a Receiver has no Parcel.
SELECT
    r.receiver_id,
    r.full_name AS receiver_name,
    r.phone AS receiver_phone,
    p.parcel_id,
    p.tracking_id,
    p.status
FROM dbo.receivers AS r
LEFT OUTER JOIN dbo.parcels AS p
    ON r.receiver_id = p.receiver_id
ORDER BY r.receiver_id, p.parcel_id;
GO
