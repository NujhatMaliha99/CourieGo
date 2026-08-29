USE courier_management;

-- 1. TOP SENDERS 

SELECT
    s.user_id AS sender_id,
    s.full_name AS sender_name,
    COUNT(p.parcel_id) AS total_parcels,
    SUM(p.charge) AS total_charge
FROM dbo.users AS s
FULL JOIN dbo.parcels AS p
    ON s.user_id = p.sender_id
GROUP BY s.user_id, s.full_name
ORDER BY total_charge DESC;

-- 2.FREQUENT SENDER-RECEIVER PAIRS

SELECT
    s.user_id AS sender_id,
    s.full_name AS sender_name,
    r.receiver_id,
    r.full_name AS receiver_name,
    COUNT(p.parcel_id) AS total_parcels_between_them,
    SUM(p.charge) AS total_charge_between_them
FROM dbo.users AS s
FULL JOIN dbo.parcels AS p
    ON s.user_id = p.sender_id
FULL  JOIN dbo.receivers AS r
    ON p.receiver_id = r.receiver_id
GROUP BY s.user_id, s.full_name, r.receiver_id, r.full_name
HAVING COUNT(p.parcel_id) >= 1
ORDER BY total_parcels_between_them DESC;

-- 3. RECEIVER ADDRESS-WISE PARCEL GROUPING

SELECT
    r.address,
    COUNT(p.parcel_id) AS total_parcels,
    SUM(p.charge) AS total_charge
FROM dbo.receivers AS r
FULL JOIN dbo.parcels AS p
    ON r.receiver_id = p.receiver_id
GROUP BY r.address
ORDER BY total_parcels DESC;

-- 4) SUSPICIOUS RECEIVER DETECTION 

SELECT
    r.receiver_id,
    r.full_name AS receiver_name,
    r.phone,
    COUNT(p.parcel_id) AS total_parcels_received
FROM dbo.receivers AS r
FULL JOIN dbo.parcels AS p
    ON r.receiver_id = p.receiver_id
GROUP BY r.receiver_id, r.full_name, r.phone
HAVING COUNT(p.parcel_id) > 5
ORDER BY total_parcels_received DESC;

-- 5) ZERO-ACTIVITY SENDERS / RECEIVERS

SELECT
    s.user_id AS sender_id,
    s.full_name AS sender_name,
    COUNT(p.parcel_id) AS total_parcels
FROM dbo.users AS s
FULL JOIN dbo.parcels AS p
    ON s.user_id = p.sender_id
GROUP BY s.user_id, s.full_name
HAVING COUNT(p.parcel_id) = 0;

-- Zero-activity receivers

SELECT
    r.receiver_id,
    r.full_name AS receiver_name,
    COUNT(p.parcel_id) AS total_parcels
FROM dbo.receivers AS r
FULL JOIN dbo.parcels AS p
    ON r.receiver_id = p.receiver_id
GROUP BY r.receiver_id, r.full_name
HAVING COUNT(p.parcel_id) = 0;

-- 6. SENDER-WISE AVERAGE PARCEL WEIGHT

SELECT
    s.user_id AS sender_id,
    s.full_name AS sender_name,
    COUNT(p.parcel_id) AS total_parcels,
    AVG(p.weight) AS avg_weight,
    MIN(p.weight) AS min_weight,
    MAX(p.weight) AS max_weight
FROM dbo.users AS s
FULL JOIN dbo.parcels AS p
    ON s.user_id = p.sender_id
GROUP BY s.user_id, s.full_name
HAVING COUNT(p.parcel_id) >= 1
ORDER BY avg_weight DESC;

-- 8.FULL REPORT

SELECT
    s.user_id AS sender_id,
    s.full_name AS sender_name,
    r.receiver_id,
    r.full_name AS receiver_name,
    COUNT(p.parcel_id) AS total_parcels,
    SUM(p.charge) AS total_revenue,
    AVG(p.charge) AS avg_charge_per_parcel
FROM dbo.users AS s
FULL  JOIN dbo.parcels AS p
    ON s.user_id = p.sender_id
FULL  JOIN dbo.receivers AS r
    ON p.receiver_id = r.receiver_id
GROUP BY s.user_id, s.full_name, r.receiver_id, r.full_name
ORDER BY total_revenue DESC;
