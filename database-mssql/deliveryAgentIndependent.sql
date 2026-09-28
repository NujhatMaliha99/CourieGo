USE courier_management;
GO

/*
  Run once on databases created with the old user_id-based delivery_agents table.
  Existing agent or assignment rows are never deleted by this migration.
  Fresh databases already use the independent table in 02_create_tables.sql.
*/

SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID('dbo.delivery_agents', 'U') IS NOT NULL
       AND COL_LENGTH('dbo.delivery_agents', 'full_name') IS NULL
    BEGIN
        IF EXISTS (SELECT 1 FROM dbo.delivery_agents)
            THROW 50004, 'Delivery agents already exist; migrate their data before replacing the table.', 1;

        IF OBJECT_ID('dbo.assignments', 'U') IS NOT NULL
           AND EXISTS (SELECT 1 FROM dbo.assignments)
            THROW 50005, 'Assignments already exist; migrate their data before replacing the table.', 1;

        IF EXISTS (
            SELECT 1
            FROM sys.foreign_keys
            WHERE referenced_object_id = OBJECT_ID('dbo.delivery_agents')
              AND name <> 'FK_assignments_agent'
        )
            THROW 50006, 'Another foreign key references delivery_agents; review it before migrating.', 1;

        IF EXISTS (
            SELECT 1
            FROM sys.foreign_keys
            WHERE name = 'FK_assignments_agent'
              AND parent_object_id = OBJECT_ID('dbo.assignments')
        )
            ALTER TABLE dbo.assignments DROP CONSTRAINT FK_assignments_agent;

        DROP TABLE dbo.delivery_agents;
    END;

    IF OBJECT_ID('dbo.delivery_agents', 'U') IS NULL
    BEGIN
        CREATE TABLE dbo.delivery_agents (
            agent_id INT IDENTITY(1,1) NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            email VARCHAR(120) NULL,
            address VARCHAR(255) NULL,
            vehicle_number VARCHAR(50) NULL,
            license_number VARCHAR(50) NULL,

            availability_status VARCHAR(30) NOT NULL
                CONSTRAINT DF_delivery_agents_status DEFAULT 'available',
            created_at DATETIME2 NOT NULL
                CONSTRAINT DF_delivery_agents_created_at DEFAULT SYSDATETIME(),

            CONSTRAINT PK_delivery_agents PRIMARY KEY (agent_id),
            CONSTRAINT UQ_delivery_agents_phone UNIQUE (phone),
            CONSTRAINT CK_delivery_agents_status CHECK (
                availability_status IN ('available', 'assigned', 'offline')
            )
        );
    END;

    IF OBJECT_ID('dbo.assignments', 'U') IS NOT NULL
       AND NOT EXISTS (
           SELECT 1
           FROM sys.foreign_keys
           WHERE name = 'FK_assignments_agent'
             AND parent_object_id = OBJECT_ID('dbo.assignments')
       )
        ALTER TABLE dbo.assignments
            ADD CONSTRAINT FK_assignments_agent FOREIGN KEY (agent_id)
                REFERENCES dbo.delivery_agents(agent_id);

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO
