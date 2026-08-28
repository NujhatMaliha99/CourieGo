USE courier_management;
GO

PRINT '1. BASE TABLE DATA';
SELECT user_id AS sender_id, full_name, email
FROM dbo.users
ORDER BY user_id;

SELECT receiver_id, full_name, phone
FROM dbo.receivers
ORDER BY receiver_id;

SELECT parcel_id, sender_id, receiver_id, tracking_id, charge, status
FROM dbo.parcels
ORDER BY parcel_id;
GO

PRINT '2. INNER JOIN - matching parcel, sender and receiver rows';
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

PRINT '3. LEFT OUTER JOIN - every receiver, with or without a parcel';
SELECT
    r.receiver_id,
    r.full_name AS receiver_name,
    p.parcel_id,
    p.tracking_id
FROM dbo.receivers AS r
LEFT OUTER JOIN dbo.parcels AS p
    ON r.receiver_id = p.receiver_id
ORDER BY r.receiver_id, p.parcel_id;
GO

PRINT '4. RIGHT OUTER JOIN - every receiver, with or without a parcel';
SELECT
    p.parcel_id,
    p.tracking_id,
    r.receiver_id,
    r.full_name AS receiver_name
FROM dbo.parcels AS p
RIGHT OUTER JOIN dbo.receivers AS r
    ON p.receiver_id = r.receiver_id
ORDER BY r.receiver_id, p.parcel_id;
GO

PRINT '5. FULL OUTER JOIN - all parcel and receiver rows';
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

PRINT '6. AGGREGATE FUNCTIONS';
SELECT
    COUNT(*) AS total_parcels,
    COALESCE(SUM(charge), 0) AS total_charge,
    COALESCE(AVG(charge), 0) AS average_charge,
    COALESCE(MAX(charge), 0) AS highest_charge,
    COALESCE(MIN(charge), 0) AS lowest_charge
FROM dbo.parcels;
GO

PRINT '7. GROUP BY AND HAVING';
SELECT
    status,
    COUNT(*) AS total_parcels,
    SUM(charge) AS total_charge,
    AVG(charge) AS average_charge
FROM dbo.parcels
GROUP BY status
HAVING COUNT(*) >= 1
ORDER BY total_parcels DESC;
GO

PRINT '8. AGGREGATE WITH LEFT JOIN';
SELECT
    r.receiver_id,
    r.full_name AS receiver_name,
    COUNT(p.parcel_id) AS total_parcels,
    COALESCE(SUM(p.charge), 0) AS total_charge
FROM dbo.receivers AS r
LEFT JOIN dbo.parcels AS p
    ON r.receiver_id = p.receiver_id
GROUP BY r.receiver_id, r.full_name
ORDER BY total_parcels DESC, r.receiver_id;
GO

PRINT '9. SCALAR SUBQUERY - parcels above average charge';
SELECT parcel_id, tracking_id, parcel_type, charge
FROM dbo.parcels
WHERE charge > (
    SELECT AVG(charge)
    FROM dbo.parcels
)
ORDER BY charge DESC;
GO

PRINT '10. IN SUBQUERY - receivers who have parcels';
SELECT receiver_id, full_name, phone
FROM dbo.receivers
WHERE receiver_id IN (
    SELECT DISTINCT receiver_id
    FROM dbo.parcels
)
ORDER BY receiver_id;
GO

PRINT '11. CORRELATED NOT EXISTS SUBQUERY - receivers without parcels';
SELECT r.receiver_id, r.full_name, r.phone
FROM dbo.receivers AS r
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.parcels AS p
    WHERE p.receiver_id = r.receiver_id
)
ORDER BY r.receiver_id;
GO

