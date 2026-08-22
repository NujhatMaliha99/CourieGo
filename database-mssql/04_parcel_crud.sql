USE courier_management;
GO

/*
  Run one marked section at a time in SSMS.
  Create requires an existing sender and receiver because of foreign keys.
*/

-- ==================== CREATE ====================
DECLARE @sender_id INT = (
    SELECT user_id FROM dbo.users WHERE email = 'sender@example.com'
);
DECLARE @receiver_id INT = (
    SELECT receiver_id FROM dbo.receivers WHERE phone = '01800000000'
);

IF @sender_id IS NULL OR @receiver_id IS NULL
    THROW 50001, 'Run 03_sample_data.sql before creating a parcel.', 1;

IF EXISTS (SELECT 1 FROM dbo.parcels WHERE tracking_id = 'SSMS-PARCEL-001')
    THROW 50002, 'Tracking ID SSMS-PARCEL-001 already exists. Use another tracking ID.', 1;

INSERT INTO dbo.parcels (
    sender_id, receiver_id, tracking_id, parcel_type,
    weight, charge, status
)
OUTPUT INSERTED.*
VALUES (
    @sender_id, @receiver_id, 'SSMS-PARCEL-001', 'Documents',
    1.50, 120.00, 'pending'
);
GO

-- ==================== READ ALL ====================
SELECT *
FROM dbo.parcels
ORDER BY created_at DESC, parcel_id DESC;
GO

-- ==================== READ ONE ====================
SELECT *
FROM dbo.parcels
WHERE tracking_id = 'SSMS-PARCEL-001';
GO

-- ==================== UPDATE ====================
UPDATE dbo.parcels
SET parcel_type = 'Electronics',
    weight = 2.50,
    charge = 250.00,
    status = 'in_transit',
    updated_at = SYSDATETIME()
OUTPUT INSERTED.*
WHERE tracking_id = 'SSMS-PARCEL-001';
GO

-- Confirm that Update was saved.
SELECT *
FROM dbo.parcels
WHERE tracking_id = 'SSMS-PARCEL-001';
GO

-- ==================== DELETE ====================
-- Execute this section only when demonstrating Delete.
DELETE FROM dbo.parcels
OUTPUT DELETED.*
WHERE tracking_id = 'SSMS-PARCEL-001';
GO
