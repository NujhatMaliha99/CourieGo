USE courier_management;
GO

-- 1) Audit table
IF OBJECT_ID('dbo.audit_log', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.audit_log (
        audit_id INT IDENTITY(1,1) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        record_id INT NOT NULL,
        action_type VARCHAR(10) NOT NULL,
        details VARCHAR(500) NULL,
        changed_at DATETIME2 NOT NULL
            CONSTRAINT DF_audit_log_changed_at DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_audit_log PRIMARY KEY (audit_id),
        CONSTRAINT CK_audit_log_action CHECK (action_type IN ('INSERT', 'UPDATE', 'DELETE'))
    );
END;
GO

-- 2) Sender (users) audit
CREATE OR ALTER TRIGGER dbo.trg_users_audit
ON dbo.users
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- INSERT: 
    INSERT INTO dbo.audit_log (entity_type, record_id, action_type, details)
    SELECT r.role_name, i.user_id, 'INSERT', CONCAT('Created: ', i.full_name, ' (', i.email, ')')
    FROM inserted i
    JOIN dbo.roles r ON r.role_id = i.role_id
    LEFT JOIN deleted d ON d.user_id = i.user_id
    WHERE d.user_id IS NULL;

    -- UPDATE: 
    INSERT INTO dbo.audit_log (entity_type, record_id, action_type, details)
    SELECT r.role_name, i.user_id, 'UPDATE',
        CONCAT_WS('; ',
            CASE WHEN i.full_name <> d.full_name THEN CONCAT('name: ', d.full_name, ' -> ', i.full_name) END,
            CASE WHEN i.email <> d.email THEN CONCAT('email: ', d.email, ' -> ', i.email) END,
            CASE WHEN ISNULL(i.phone, '') <> ISNULL(d.phone, '') THEN CONCAT('phone: ', ISNULL(d.phone, '-'), ' -> ', ISNULL(i.phone, '-')) END,
            CASE WHEN ISNULL(i.address, '') <> ISNULL(d.address, '') THEN CONCAT('address: ', ISNULL(d.address, '-'), ' -> ', ISNULL(i.address, '-')) END)
    FROM inserted i
    JOIN deleted d ON d.user_id = i.user_id
    JOIN dbo.roles r ON r.role_id = i.role_id
    WHERE i.full_name <> d.full_name OR i.email <> d.email
       OR ISNULL(i.phone, '') <> ISNULL(d.phone, '')
       OR ISNULL(i.address, '') <> ISNULL(d.address, '');

    -- DELETE:
    INSERT INTO dbo.audit_log (entity_type, record_id, action_type, details)
    SELECT r.role_name, d.user_id, 'DELETE', CONCAT('Deleted: ', d.full_name, ' (', d.email, ')')
    FROM deleted d
    JOIN dbo.roles r ON r.role_id = d.role_id
    LEFT JOIN inserted i ON i.user_id = d.user_id
    WHERE i.user_id IS NULL;
END;
GO

-- 3) Receiver audit
CREATE OR ALTER TRIGGER dbo.trg_receivers_audit
ON dbo.receivers
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.audit_log (entity_type, record_id, action_type, details)
    SELECT 'receiver', i.receiver_id, 'INSERT', CONCAT('Created: ', i.full_name, ' (', i.phone, ')')
    FROM inserted i
    LEFT JOIN deleted d ON d.receiver_id = i.receiver_id
    WHERE d.receiver_id IS NULL;

    INSERT INTO dbo.audit_log (entity_type, record_id, action_type, details)
    SELECT 'receiver', i.receiver_id, 'UPDATE',
        CONCAT_WS('; ',
            CASE WHEN i.full_name <> d.full_name THEN CONCAT('name: ', d.full_name, ' -> ', i.full_name) END,
            CASE WHEN i.phone <> d.phone THEN CONCAT('phone: ', d.phone, ' -> ', i.phone) END,
            CASE WHEN ISNULL(i.email, '') <> ISNULL(d.email, '') THEN CONCAT('email: ', ISNULL(d.email, '-'), ' -> ', ISNULL(i.email, '-')) END,
            CASE WHEN i.address <> d.address THEN CONCAT('address: ', d.address, ' -> ', i.address) END)
    FROM inserted i
    JOIN deleted d ON d.receiver_id = i.receiver_id
    WHERE i.full_name <> d.full_name OR i.phone <> d.phone
       OR ISNULL(i.email, '') <> ISNULL(d.email, '')
       OR i.address <> d.address;

    INSERT INTO dbo.audit_log (entity_type, record_id, action_type, details)
    SELECT 'receiver', d.receiver_id, 'DELETE', CONCAT('Deleted: ', d.full_name, ' (', d.phone, ')')
    FROM deleted d
    LEFT JOIN inserted i ON i.receiver_id = d.receiver_id
    WHERE i.receiver_id IS NULL;
END;
GO

-- 4) Delivery agent audit
CREATE OR ALTER TRIGGER dbo.trg_delivery_agents_audit
ON dbo.delivery_agents
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.audit_log (entity_type, record_id, action_type, details)
    SELECT 'delivery_agent', i.agent_id, 'INSERT', CONCAT('Created: ', i.full_name, ' (', i.phone, ')')
    FROM inserted i
    LEFT JOIN deleted d ON d.agent_id = i.agent_id
    WHERE d.agent_id IS NULL;

    INSERT INTO dbo.audit_log (entity_type, record_id, action_type, details)
    SELECT 'delivery_agent', i.agent_id, 'UPDATE',
        CONCAT_WS('; ',
            CASE WHEN i.full_name <> d.full_name THEN CONCAT('name: ', d.full_name, ' -> ', i.full_name) END,
            CASE WHEN i.phone <> d.phone THEN CONCAT('phone: ', d.phone, ' -> ', i.phone) END,
            CASE WHEN ISNULL(i.email, '') <> ISNULL(d.email, '') THEN CONCAT('email: ', ISNULL(d.email, '-'), ' -> ', ISNULL(i.email, '-')) END,
            CASE WHEN ISNULL(i.address, '') <> ISNULL(d.address, '') THEN CONCAT('address: ', ISNULL(d.address, '-'), ' -> ', ISNULL(i.address, '-')) END,
            CASE WHEN ISNULL(i.vehicle_number, '') <> ISNULL(d.vehicle_number, '') THEN CONCAT('vehicle: ', ISNULL(d.vehicle_number, '-'), ' -> ', ISNULL(i.vehicle_number, '-')) END,
            CASE WHEN ISNULL(i.license_number, '') <> ISNULL(d.license_number, '') THEN CONCAT('license: ', ISNULL(d.license_number, '-'), ' -> ', ISNULL(i.license_number, '-')) END,
            CASE WHEN i.availability_status <> d.availability_status THEN CONCAT('status: ', d.availability_status, ' -> ', i.availability_status) END)
    FROM inserted i
    JOIN deleted d ON d.agent_id = i.agent_id
    WHERE i.full_name <> d.full_name OR i.phone <> d.phone
       OR ISNULL(i.email, '') <> ISNULL(d.email, '')
       OR ISNULL(i.address, '') <> ISNULL(d.address, '')
       OR ISNULL(i.vehicle_number, '') <> ISNULL(d.vehicle_number, '')
       OR ISNULL(i.license_number, '') <> ISNULL(d.license_number, '')
       OR i.availability_status <> d.availability_status;

    INSERT INTO dbo.audit_log (entity_type, record_id, action_type, details)
    SELECT 'delivery_agent', d.agent_id, 'DELETE', CONCAT('Deleted: ', d.full_name, ' (', d.phone, ')')
    FROM deleted d
    LEFT JOIN inserted i ON i.agent_id = d.agent_id
    WHERE i.agent_id IS NULL;
END;
GO

