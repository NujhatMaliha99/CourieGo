USE courier_management;
GO

-- =========================================================
-- 1. RIGHT OUTER JOIN
-- Returns all users (senders) and their parcels.
-- Shows senders even if they haven't sent any parcel yet.
-- =========================================================
SELECT
    u.user_id AS sender_id,
    u.full_name AS sender_name,
    u.email,
    p.parcel_id,
    p.tracking_id,
    p.parcel_type,
    p.weight,
    p.charge,
    p.status
FROM dbo.parcels AS p
RIGHT OUTER JOIN dbo.users AS u
    ON p.sender_id = u.user_id
ORDER BY u.user_id;
GO

-- =========================================================
-- 2. AVG AGGREGATE FUNCTION WITH RIGHT JOIN (Weight Analysis)
-- Calculates the average parcel weight (AVG) per sender.
-- Uses ISNULL to show 0 for senders without parcels.
-- =========================================================
SELECT
    u.user_id AS sender_id,
    u.full_name AS sender_name,
    COUNT(p.parcel_id) AS total_parcels,
    ISNULL(AVG(p.weight), 0) AS average_weight_kg
FROM dbo.parcels AS p
RIGHT JOIN dbo.users AS u
    ON p.sender_id = u.user_id
GROUP BY u.user_id, u.full_name
ORDER BY average_weight_kg DESC;
GO

-- =========================================================
-- 3. RIGHT JOIN WITH HAVING CLAUSE
-- Filters senders whose average parcel weight exceeds 1.0 kg.
-- =========================================================
SELECT
    u.user_id AS sender_id,
    u.full_name AS sender_name,
    COUNT(p.parcel_id) AS total_parcels,
    AVG(p.weight) AS average_weight_kg
FROM dbo.parcels AS p
RIGHT JOIN dbo.users AS u
    ON p.sender_id = u.user_id
GROUP BY u.user_id, u.full_name
HAVING AVG(p.weight) > 1.0
ORDER BY average_weight_kg DESC;
GO

-- =========================================================
-- 4. SUBQUERY WITH AVG FUNCTION
-- Finds parcels whose weight is greater than the overall average parcel weight.
-- =========================================================
SELECT
    p.parcel_id,
    p.tracking_id,
    u.full_name AS sender_name,
    p.weight,
    p.charge,
    p.status
FROM dbo.parcels AS p
INNER JOIN dbo.users AS u
    ON p.sender_id = u.user_id
WHERE p.weight > (
    SELECT AVG(weight)
    FROM dbo.parcels
)
ORDER BY p.weight DESC;
GO