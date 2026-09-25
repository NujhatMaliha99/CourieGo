-- Drop existing objects first to prevent 'already exists' errors
DROP VIEW IF EXISTS dbo.vw_parcel_summary;
DROP PROCEDURE IF EXISTS dbo.usp_GetParcelsByStatus;
DROP PROCEDURE IF EXISTS dbo.usp_PerformTransactionDemo;
DROP TRIGGER IF EXISTS trg_parcel_insert_audit;
-- Note: parcel_audit_log table is kept so logs aren't lost. 
-- Uncomment below if you want to drop the table too:
-- DROP TABLE IF EXISTS dbo.parcel_audit_log;

GO

-- 01. VIEW: Create a view for parcel summary combining parcels and senders
CREATE VIEW dbo.vw_parcel_summary AS
SELECT p.parcel_id, p.tracking_id, p.parcel_type, p.status, s.full_name AS sender_name
FROM dbo.parcels AS p
INNER JOIN dbo.users AS s ON p.sender_id = s.user_id;

GO

-- 02. STORED PROCEDURE: Get parcels by Status (Completely different from teammate's tracking ID search)
CREATE PROCEDURE dbo.usp_GetParcelsByStatus
    @status VARCHAR(30)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT parcel_id, tracking_id, parcel_type, weight, charge, status 
    FROM dbo.parcels 
    WHERE status = @status;
END;

GO

-- 03. TABLE: Create a table for storing parcel audit logs automatically
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.parcel_audit_log') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.parcel_audit_log (
        log_id INT IDENTITY(1,1) PRIMARY KEY,
        parcel_id INT,
        action_message VARCHAR(255),
        action_time DATETIME DEFAULT GETDATE()
    );
END;

GO

-- 04. TRIGGER: Trigger to log details automatically after a new parcel is inserted
CREATE TRIGGER trg_parcel_insert_audit
ON dbo.parcels
AFTER INSERT
AS
BEGIN
    INSERT INTO dbo.parcel_audit_log (parcel_id, action_message)
    SELECT parcel_id, 'New parcel created with tracking ID: ' + tracking_id
    FROM inserted;
END;

GO

-- 05. STORED PROCEDURE WITH TRANSACTION: Perform safe parcel insertion using transaction handling (Different from teammate's summary)
CREATE PROCEDURE dbo.usp_PerformTransactionDemo
    @sender_id INT,
    @receiver_id INT,
    @tracking_id VARCHAR(50),
    @parcel_type VARCHAR(50),
    @weight DECIMAL(10,2),
    @charge DECIMAL(10,2),
    @status VARCHAR(30)
AS
BEGIN
    BEGIN TRANSACTION;
    BEGIN TRY
        INSERT INTO dbo.parcels (sender_id, receiver_id, tracking_id, parcel_type, weight, charge, status)
        VALUES (@sender_id, @receiver_id, @tracking_id, @parcel_type, @weight, @charge, @status);
        
        COMMIT TRANSACTION;
        SELECT CAST(SCOPE_IDENTITY() AS INT) AS parcel_id;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;

GO

-- 06. SET-BASED QUERY (UNION): Combine unique users and receivers into a single list
SELECT user_id AS id, full_name FROM dbo.users
UNION
SELECT receiver_id AS id, full_name FROM dbo.receivers;

GO

-- 07. SET-BASED QUERY (INTERSECT): Find users who have sent parcels
SELECT user_id AS id FROM dbo.users
INTERSECT
SELECT sender_id AS id FROM dbo.parcels;

GO

-- 08. SET-BASED QUERY (EXCEPT): Find users who have not sent any parcels
SELECT user_id AS id FROM dbo.users
EXCEPT
SELECT sender_id AS id FROM dbo.parcels;