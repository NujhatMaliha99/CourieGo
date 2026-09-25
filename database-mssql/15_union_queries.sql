USE courier_management;

-- UNION removes duplicate sender/receiver rows from parcel joins.
SELECT s.user_id AS person_id, s.full_name, 'Sender' AS person_type
FROM dbo.users AS s
INNER JOIN dbo.roles AS role ON s.role_id = role.role_id
LEFT JOIN dbo.parcels AS p ON p.sender_id = s.user_id
WHERE role.role_name = 'customer'
UNION
SELECT r.receiver_id AS person_id, r.full_name, 'Receiver' AS person_type
FROM dbo.receivers AS r
LEFT JOIN dbo.parcels AS p ON p.receiver_id = r.receiver_id
ORDER BY person_type, full_name;

-- UNION ALL keeps repeated rows from multiple parcels.
SELECT s.user_id AS person_id, s.full_name, 'Sender' AS person_type
FROM dbo.users AS s
INNER JOIN dbo.roles AS role ON s.role_id = role.role_id
LEFT JOIN dbo.parcels AS p ON p.sender_id = s.user_id
WHERE role.role_name = 'customer'
UNION ALL
SELECT r.receiver_id AS person_id, r.full_name, 'Receiver' AS person_type
FROM dbo.receivers AS r
LEFT JOIN dbo.parcels AS p ON p.receiver_id = r.receiver_id
ORDER BY person_type, full_name;
