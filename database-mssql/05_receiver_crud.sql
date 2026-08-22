USE courier_management;
GO

/* Run one marked section at a time in SSMS. */

-- ==================== CREATE ====================
IF EXISTS (SELECT 1 FROM dbo.receivers WHERE phone = '01712345678')
    THROW 50003, 'Demo receiver already exists. Use another phone number.', 1;

INSERT INTO dbo.receivers (full_name, phone, email, address)
OUTPUT INSERTED.*
VALUES ('Nujhat Maliha', '01712345678', 'nujhat@example.com', 'Dhaka');
GO

-- ==================== READ ALL ====================
SELECT *
FROM dbo.receivers
ORDER BY receiver_id DESC;
GO

-- ==================== READ ONE ====================
SELECT *
FROM dbo.receivers
WHERE phone = '01712345678';
GO

-- ==================== UPDATE ====================
UPDATE dbo.receivers
SET full_name = 'Nujhat M.',
    email = 'nujhat.m@example.com',
    address = 'Chattogram'
OUTPUT INSERTED.*
WHERE phone = '01712345678';
GO

-- Confirm that Update was saved.
SELECT *
FROM dbo.receivers
WHERE phone = '01712345678';
GO

-- ==================== DELETE ====================
-- Delete will fail if a parcel still references this receiver.
DELETE FROM dbo.receivers
OUTPUT DELETED.*
WHERE phone = '01712345678';
GO
