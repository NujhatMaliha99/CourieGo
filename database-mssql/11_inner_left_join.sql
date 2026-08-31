USE courier_management;

-- INNER JOIN
-- Write an SQL query using INNER JOIN to display parcel information
-- with the matching sender and receiver details.
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

-- LEFT OUTER JOIN
-- Write an SQL query using LEFT OUTER JOIN to display all receivers
-- with their parcel information, including receivers with no parcels.
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

-- AGGREGATE FUNCTION
-- Write an SQL query using COUNT() to calculate the total number of parcels
-- received by each receiver. Display only receivers who have received at least one parcel.
SELECT
    r.receiver_id,
    r.full_name AS receiver_name,
    COUNT(p.parcel_id) AS total_parcels
FROM dbo.receivers AS r
LEFT OUTER JOIN dbo.parcels AS p
    ON r.receiver_id = p.receiver_id
GROUP BY
    r.receiver_id,
    r.full_name
HAVING COUNT(p.parcel_id) >= 1
ORDER BY r.receiver_id;

-- SUB QUERY
-- Write an SQL subquery to display parcels whose charge is greater
-- than the average charge of all parcels.
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

-- SUB QUERY
-- Write an SQL query using a NOT EXISTS subquery to display receivers
-- who have no parcels with a pending status.
SELECT
    r.receiver_id,
    r.full_name AS receiver_name,
    r.phone,
    r.address
FROM dbo.receivers AS r
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.parcels AS p
    WHERE p.receiver_id = r.receiver_id
      AND p.status = 'pending'
)
ORDER BY r.full_name;
