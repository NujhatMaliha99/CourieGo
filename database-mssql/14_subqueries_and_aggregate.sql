USE courier_management;

GO


-- =========================================================
-- 1. PARCEL TYPE-WISE REVENUE ANALYSIS
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
-- 5. PARCELS WITH ABOVE-AVERAGE CHARGE
--    FOR THEIR OWN PARCEL TYPE
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