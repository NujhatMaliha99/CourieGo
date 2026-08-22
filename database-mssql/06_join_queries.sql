USE courier_management;
GO

-- Parcel details with sender and receiver names.
SELECT
    p.parcel_id,
    p.tracking_id,
    s.full_name AS sender_name,
    r.full_name AS receiver_name,
    r.phone AS receiver_phone,
    p.parcel_type,
    p.weight,
    p.charge,
    p.status,
    p.created_at
FROM dbo.parcels AS p
INNER JOIN dbo.users AS s
    ON p.sender_id = s.user_id
INNER JOIN dbo.receivers AS r
    ON p.receiver_id = r.receiver_id
ORDER BY p.created_at DESC;
GO

-- Number of parcels grouped by status.
SELECT
    status,
    COUNT(*) AS total_parcels
FROM dbo.parcels
GROUP BY status
ORDER BY total_parcels DESC;
GO

-- Total parcel charge for each receiver.
SELECT
    r.receiver_id,
    r.full_name,
    COUNT(p.parcel_id) AS parcel_count,
    COALESCE(SUM(p.charge), 0) AS total_charge
FROM dbo.receivers AS r
LEFT JOIN dbo.parcels AS p
    ON r.receiver_id = p.receiver_id
GROUP BY r.receiver_id, r.full_name
ORDER BY total_charge DESC;
GO

-- Full delivery history for each parcel, when history records exist.
SELECT
    p.tracking_id,
    ts.status_name,
    dh.location,
    dh.remarks,
    dh.recorded_at
FROM dbo.delivery_history AS dh
INNER JOIN dbo.parcels AS p
    ON dh.parcel_id = p.parcel_id
INNER JOIN dbo.tracking_status AS ts
    ON dh.tracking_status_id = ts.tracking_status_id
ORDER BY dh.recorded_at DESC;
GO
