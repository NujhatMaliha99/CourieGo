USE courier_management;
GO


-- =========================================================
-- 1. PARCEL TYPE-WISE REVENUE ANALYSIS
-- Calculates total revenue and average charge for
-- each parcel type.
-- =========================================================

SELECT
    p.parcel_type,
    COUNT(p.parcel_id) AS number_of_parcels,
    SUM(p.charge) AS total_revenue,
    AVG(p.charge) AS average_charge
FROM dbo.parcels AS p
GROUP BY p.parcel_type
ORDER BY total_revenue DESC;
GO


-- =========================================================
-- 2. PARCEL TYPE-WISE WEIGHT ANALYSIS
-- Shows total, average and highest weight for each
-- type of parcel.
-- =========================================================

SELECT
    p.parcel_type,
    COUNT(p.parcel_id) AS number_of_parcels,
    SUM(p.weight) AS total_weight,
    AVG(p.weight) AS average_weight,
    MAX(p.weight) AS heaviest_parcel
FROM dbo.parcels AS p
GROUP BY p.parcel_type
ORDER BY total_weight DESC;
GO


-- =========================================================
-- 3. STATUS-WISE CHARGE RANGE
-- Shows minimum, maximum and total charge for
-- each parcel status.
-- =========================================================

SELECT
    p.status,
    MIN(p.charge) AS minimum_charge,
    MAX(p.charge) AS maximum_charge,
    SUM(p.charge) AS total_charge
FROM dbo.parcels AS p
GROUP BY p.status
ORDER BY total_charge DESC;
GO


-- =========================================================
-- 4. SENDERS WITH HIGH TOTAL CHARGE
-- Finds senders whose total parcel charge is greater
-- than 500.
-- Uses SUM with GROUP BY and HAVING.
-- =========================================================

SELECT
    s.user_id AS sender_id,
    s.full_name AS sender_name,
    SUM(p.charge) AS total_charge
FROM dbo.users AS s
INNER JOIN dbo.parcels AS p
    ON s.user_id = p.sender_id
GROUP BY s.user_id, s.full_name
HAVING SUM(p.charge) > 500
ORDER BY total_charge DESC;
GO


-- =========================================================
-- 5. PARCELS WITH ABOVE-AVERAGE CHARGE FOR THEIR
-- OWN PARCEL TYPE
-- Finds parcels whose charge is greater than the
-- average charge of the same parcel type.
-- Uses a correlated subquery.
-- =========================================================

SELECT
    p.parcel_id,
    p.tracking_id,
    p.parcel_type,
    p.charge
FROM dbo.parcels AS p
WHERE p.charge > (
    SELECT AVG(p2.charge)
    FROM dbo.parcels AS p2
    WHERE p2.parcel_type = p.parcel_type
)
ORDER BY p.parcel_type, p.charge DESC;
GO


-- =========================================================
-- 6. SENDERS OF THE HEAVIEST PARCELS
-- Finds the sender(s) who sent the heaviest parcel
-- in the database.
-- Uses MAX inside a subquery.
-- =========================================================

SELECT
    s.user_id AS sender_id,
    s.full_name AS sender_name,
    p.parcel_id,
    p.tracking_id,
    p.weight
FROM dbo.users AS s
INNER JOIN dbo.parcels AS p
    ON s.user_id = p.sender_id
WHERE p.weight = (
    SELECT MAX(p2.weight)
    FROM dbo.parcels AS p2
)
ORDER BY s.user_id;
GO


-- =========================================================
-- 7. RECEIVERS WITH ABOVE-AVERAGE PARCEL COUNT
-- Finds receivers who received more parcels than
-- the average number of parcels received per receiver.
-- Uses aggregate function inside a subquery.
-- =========================================================

SELECT
    r.receiver_id,
    r.full_name AS receiver_name,
    COUNT(p.parcel_id) AS received_parcels
FROM dbo.receivers AS r
LEFT JOIN dbo.parcels AS p
    ON r.receiver_id = p.receiver_id
GROUP BY r.receiver_id, r.full_name
HAVING COUNT(p.parcel_id) > (
    SELECT AVG(receiver_parcel_count)
    FROM (
        SELECT
            receiver_id,
            COUNT(*) AS receiver_parcel_count
        FROM dbo.parcels
        GROUP BY receiver_id
    ) AS receiver_counts
)
ORDER BY received_parcels DESC;
GO


-- =========================================================
-- 8. PARCEL TYPES WITH HIGH AVERAGE WEIGHT
-- Finds parcel types whose average weight is greater
-- than the overall average parcel weight.
-- Uses GROUP BY with a subquery.
-- =========================================================

SELECT
    p.parcel_type,
    COUNT(p.parcel_id) AS number_of_parcels,
    AVG(p.weight) AS average_weight
FROM dbo.parcels AS p
GROUP BY p.parcel_type
HAVING AVG(p.weight) > (
    SELECT AVG(weight)
    FROM dbo.parcels
)
ORDER BY average_weight DESC;
GO