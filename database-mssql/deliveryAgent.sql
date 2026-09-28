USE courier_management;
GO


-- ==================== CREATE ====================
IF EXISTS (SELECT 1 FROM dbo.delivery_agents WHERE phone = '01911223344')
    THROW 50004, 'Demo delivery agent already exists. Use another phone number.', 1;

INSERT INTO dbo.delivery_agents (full_name, phone, email, address, vehicle_number, license_number)
OUTPUT INSERTED.*
VALUES ('Rafiq Islam', '01911223344', 'rafiq@example.com', 'Mirpur, Dhaka', 'DHK-METRO-GA-1234', 'DL-556677');
GO

-- ==================== READ ALL ====================
SELECT *
FROM dbo.delivery_agents
ORDER BY agent_id DESC;
GO

-- ==================== READ ONE ====================
SELECT *
FROM dbo.delivery_agents
WHERE phone = '01911223344';
GO

-- ==================== UPDATE ====================
UPDATE dbo.delivery_agents
SET full_name = 'Rafiqul Islam',
    availability_status = 'assigned',
    vehicle_number = 'DHK-METRO-GA-9999'
OUTPUT INSERTED.*
WHERE phone = '01911223344';
GO

-- Confirm that Update was saved.
SELECT *
FROM dbo.delivery_agents
WHERE phone = '01911223344';
GO

-- ==================== DELETE ====================
-- Delete will fail if an assignment still references this agent.
DELETE FROM dbo.delivery_agents
OUTPUT DELETED.*
WHERE phone = '01911223344';
GO