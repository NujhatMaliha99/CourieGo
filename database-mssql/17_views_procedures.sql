USE courier_management;
GO

-- VIEW 1: Each parcel with its sender and receiver from the frontend data.
CREATE OR ALTER VIEW dbo.vw_parcel_details
AS
SELECT
    p.parcel_id,
    p.tracking_id,
    s.full_name AS sender_name,
    r.full_name AS receiver_name,
    p.parcel_type,
    p.status,
    p.charge
FROM dbo.parcels AS p
INNER JOIN dbo.users AS s ON p.sender_id = s.user_id
INNER JOIN dbo.receivers AS r ON p.receiver_id = r.receiver_id;
GO

-- VIEW 2: All receivers, including those without parcels.
CREATE OR ALTER VIEW dbo.vw_receiver_summary
AS
SELECT
    r.receiver_id,
    r.full_name AS receiver_name,
    r.phone,
    COUNT(p.parcel_id) AS total_parcels
FROM dbo.receivers AS r
LEFT JOIN dbo.parcels AS p ON p.receiver_id = r.receiver_id
GROUP BY r.receiver_id, r.full_name, r.phone;
GO

-- PROCEDURE 1: Search by the tracking ID entered on the frontend.
CREATE OR ALTER PROCEDURE dbo.usp_FindParcelByTrackingId
    @tracking_id VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT parcel_id, tracking_id, sender_name, receiver_name,
           parcel_type, status, charge
    FROM dbo.vw_parcel_details
    WHERE tracking_id = @tracking_id;
END;
GO

-- Remove the old status-changing procedure if this script is re-run.
DROP PROCEDURE IF EXISTS dbo.usp_UpdateParcelStatus;
GO

-- PROCEDURE 2: Read-only sender parcel and charge summary.
CREATE OR ALTER PROCEDURE dbo.usp_GetSenderChargeSummary
    @sender_id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        s.user_id AS sender_id,
        s.full_name AS sender_name,
        COUNT(p.parcel_id) AS total_parcels,
        COALESCE(SUM(p.charge), 0) AS total_charge,
        COALESCE(AVG(p.charge), 0) AS average_charge
    FROM dbo.users AS s
    INNER JOIN dbo.roles AS role ON s.role_id = role.role_id
    LEFT JOIN dbo.parcels AS p ON p.sender_id = s.user_id
    WHERE s.user_id = @sender_id AND role.role_name = 'customer'
    GROUP BY s.user_id, s.full_name;
END;
GO
