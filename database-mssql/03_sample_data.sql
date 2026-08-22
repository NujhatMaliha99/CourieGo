USE courier_management;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE role_name = 'customer')
    INSERT INTO dbo.roles (role_name) VALUES ('customer');

IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE role_name = 'delivery_agent')
    INSERT INTO dbo.roles (role_name) VALUES ('delivery_agent');

IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE role_name = 'admin')
    INSERT INTO dbo.roles (role_name) VALUES ('admin');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = 'sender@example.com')
BEGIN
    INSERT INTO dbo.users (role_id, full_name, email, phone, address)
    SELECT role_id, 'Sample Sender', 'sender@example.com', '01700000000', 'Dhaka'
    FROM dbo.roles
    WHERE role_name = 'customer';
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.receivers WHERE phone = '01800000000')
BEGIN
    INSERT INTO dbo.receivers (full_name, phone, email, address)
    VALUES ('Sample Receiver', '01800000000', 'receiver@example.com', 'Chattogram');
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.tracking_status WHERE status_name = 'pending')
    INSERT INTO dbo.tracking_status (status_name, description)
    VALUES ('pending', 'Parcel information has been created');

IF NOT EXISTS (SELECT 1 FROM dbo.tracking_status WHERE status_name = 'picked_up')
    INSERT INTO dbo.tracking_status (status_name, description)
    VALUES ('picked_up', 'Parcel has been collected');

IF NOT EXISTS (SELECT 1 FROM dbo.tracking_status WHERE status_name = 'in_transit')
    INSERT INTO dbo.tracking_status (status_name, description)
    VALUES ('in_transit', 'Parcel is moving between locations');

IF NOT EXISTS (SELECT 1 FROM dbo.tracking_status WHERE status_name = 'out_for_delivery')
    INSERT INTO dbo.tracking_status (status_name, description)
    VALUES ('out_for_delivery', 'Parcel is with the delivery agent');

IF NOT EXISTS (SELECT 1 FROM dbo.tracking_status WHERE status_name = 'delivered')
    INSERT INTO dbo.tracking_status (status_name, description)
    VALUES ('delivered', 'Parcel was delivered');

IF NOT EXISTS (SELECT 1 FROM dbo.tracking_status WHERE status_name = 'cancelled')
    INSERT INTO dbo.tracking_status (status_name, description)
    VALUES ('cancelled', 'Parcel delivery was cancelled');
GO

SELECT * FROM dbo.roles;
SELECT * FROM dbo.users;
SELECT * FROM dbo.receivers;
SELECT * FROM dbo.tracking_status;
GO
