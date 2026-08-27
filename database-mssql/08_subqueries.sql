USE courier_management;
GO

-- 1. Scalar subquery: parcels costing more than the average charge.
SELECT
    parcel_id,
    tracking_id,
    parcel_type,
    charge
FROM dbo.parcels
WHERE charge > (
    SELECT AVG(charge)
    FROM dbo.parcels
)
ORDER BY charge DESC;
GO

-- 2. IN subquery: receivers who have at least one parcel.
SELECT
    receiver_id,
    full_name,
    phone
FROM dbo.receivers
WHERE receiver_id IN (
    SELECT DISTINCT receiver_id
    FROM dbo.parcels
)
ORDER BY receiver_id;
GO

-- 3. NOT EXISTS correlated subquery: receivers who have no parcel.
SELECT
    r.receiver_id,
    r.full_name,
    r.phone
FROM dbo.receivers AS r
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.parcels AS p
    WHERE p.receiver_id = r.receiver_id
)
ORDER BY r.receiver_id;
GO

-- 4. Correlated subquery: parcel count beside each receiver.
SELECT
    r.receiver_id,
    r.full_name,
    (
        SELECT COUNT(*)
        FROM dbo.parcels AS p
        WHERE p.receiver_id = r.receiver_id
    ) AS total_parcels
FROM dbo.receivers AS r
ORDER BY r.receiver_id;
GO

