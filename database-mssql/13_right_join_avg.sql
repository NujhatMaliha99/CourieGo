USE courier_management;
GO

-- 1. RIGHT JOIN WITH DISTINCT SENDER COUNT & AVG CHARGE
SELECT 
    r.receiver_id,
    r.full_name AS receiver_name,
    COUNT(DISTINCT p.sender_id) AS unique_senders_count,
    ISNULL(MIN(p.charge), 0) AS min_charge,
    ISNULL(AVG(p.charge), 0) AS avg_charge
FROM dbo.parcels AS p
RIGHT JOIN dbo.receivers AS r
    ON p.receiver_id = r.receiver_id
GROUP BY r.receiver_id, r.full_name
ORDER BY avg_charge DESC;
GO


-- 2. RECEIVER-WISE PARCEL WEIGHT ANALYSIS
SELECT 
    r.receiver_id,
    r.full_name AS receiver_name,
    COUNT(p.parcel_id) AS total_parcels_received,
    SUM(p.weight) AS total_weight,
    AVG(p.weight) AS avg_weight
FROM dbo.receivers AS r
INNER JOIN dbo.parcels AS p
    ON r.receiver_id = p.receiver_id
GROUP BY r.receiver_id, r.full_name
HAVING COUNT(p.parcel_id) > 1
ORDER BY avg_weight DESC;
GO


-- 3. STATUS-WISE CHARGE AND WEIGHT SUMMARY
SELECT 
    p.status,
    COUNT(p.parcel_id) AS total_parcels,
    AVG(p.charge) AS avg_charge,
    MAX(p.weight) AS max_weight
FROM dbo.parcels AS p
GROUP BY p.status
ORDER BY total_parcels DESC;
GO


-- 4. RECEIVERS WHO RECEIVED HIGHER THAN OVERALL AVERAGE WEIGHT
SELECT 
    r.receiver_id,
    r.full_name AS receiver_name,
    AVG(p.weight) AS receiver_avg_weight
FROM dbo.receivers AS r
INNER JOIN dbo.parcels AS p
    ON r.receiver_id = p.receiver_id
GROUP BY r.receiver_id, r.full_name
HAVING AVG(p.weight) > (
    SELECT AVG(weight) 
    FROM dbo.parcels
)
ORDER BY receiver_avg_weight DESC;
GO


-- 5. SENDER-WISE MINIMUM & MAXIMUM CHARGE ANALYSIS
SELECT 
    s.user_id AS sender_id,
    s.full_name AS sender_name,
    COUNT(p.parcel_id) AS total_sent,
    MIN(p.charge) AS min_charge_sent,
    MAX(p.charge) AS max_charge_sent,
    AVG(p.charge) AS avg_charge_sent
FROM dbo.users AS s
INNER JOIN dbo.parcels AS p
    ON s.user_id = p.sender_id
GROUP BY s.user_id, s.full_name
ORDER BY max_charge_sent DESC;
GO

-- 6. RIGHT JOIN WITH RECEIVER ADDRESS & TOTAL CHARGE SUMMARY
SELECT 
    r.receiver_id,
    r.full_name AS receiver_name,
    r.address AS receiver_address,
    COUNT(p.parcel_id) AS total_parcels_received,
    ISNULL(SUM(p.charge), 0) AS total_charge_spent
FROM dbo.parcels AS p
RIGHT JOIN dbo.receivers AS r
    ON p.receiver_id = r.receiver_id
GROUP BY r.receiver_id, r.full_name, r.address
ORDER BY total_charge_spent DESC;
GO