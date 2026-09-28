SELECT full_name
FROM dbo.users

INTERSECT

SELECT full_name
FROM dbo.receivers

ORDER BY full_name;








SELECT full_name
FROM dbo.users

INTERSECT

SELECT full_name
FROM dbo.delivery_agents

ORDER BY full_name;






USE courier_management;
GO




SELECT
    parcel_id,
    tracking_id,
    sender_id,
    receiver_id,
    parcel_type,
    weight,
    charge,
    status
FROM dbo.parcels
ORDER BY parcel_id;




BEGIN TRY

    BEGIN TRANSACTION;


    DECLARE @ParcelID INT;

    SELECT TOP 1
        @ParcelID = parcel_id
    FROM dbo.parcels
    WHERE status = 'pending'
    ORDER BY parcel_id;

    -- Update parcel status
    UPDATE dbo.parcels
    SET
        status = 'in_transit',
        updated_at = SYSDATETIME()
    WHERE parcel_id = @ParcelID;

    SELECT
        parcel_id,
        tracking_id,
        sender_id,
        receiver_id,
        parcel_type,
        weight,
        charge,
        status,
        updated_at
    FROM dbo.parcels
    WHERE parcel_id = @ParcelID;

    COMMIT TRANSACTION;

    PRINT 'Parcel status updated successfully.';

END TRY

BEGIN CATCH

    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    PRINT 'Transaction Failed.';
    PRINT 'Error: ' + ERROR_MESSAGE();

END CATCH;



SELECT
    parcel_id,
    tracking_id,
    sender_id,
    receiver_id,
    parcel_type,
    weight,
    charge,
    status,
    updated_at
FROM dbo.parcels
ORDER BY parcel_id;
GO