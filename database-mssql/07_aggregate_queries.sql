USE courier_management;
GO

-- Aggregate functions on all parcels.
SELECT
    COUNT(*) AS total_parcels,
    COALESCE(SUM(charge), 0) AS total_charge,
    COALESCE(AVG(charge), 0) AS average_charge,
    COALESCE(MAX(charge), 0) AS highest_charge,
    COALESCE(MIN(charge), 0) AS lowest_charge
FROM dbo.parcels;
GO

-- Aggregate functions with GROUP BY: parcel summary for each status.
SELECT
    status,
    COUNT(*) AS total_parcels,
    SUM(charge) AS total_charge,
    AVG(charge) AS average_charge
FROM dbo.parcels
GROUP BY status
ORDER BY total_parcels DESC;
GO

-- LEFT JOIN with aggregate functions: includes receivers with zero parcels.
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

-- HAVING filters groups after aggregation.
SELECT
    receiver_id,
    COUNT(*) AS total_parcels
FROM dbo.parcels
GROUP BY receiver_id
HAVING COUNT(*) >= 1
ORDER BY total_parcels DESC;
GO

