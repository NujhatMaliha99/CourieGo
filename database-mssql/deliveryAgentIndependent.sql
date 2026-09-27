USE courier_management;
GO

/*
  Purpose:
  The original dbo.delivery_agents table (see 02_create_tables.sql) required a
  row to already exist in dbo.users (which itself required dbo.roles) before an
  agent could be created — exactly like how senders piggy-back on dbo.users.

  This migration makes delivery agents INDEPENDENT, the same way dbo.receivers
  is independent: a delivery agent can be created directly, with its own
  full_name / phone / email / address / vehicle_number / license_number, with
  no other table needing to be populated first.

  Run this once. It safely drops the old FK-dependent table (only if it has no
  rows you care about) and recreates it as a standalone table, then re-attaches
  dbo.assignments to the new table.
*/

-- ==================== 1. Detach dbo.assignments from the old table ====================
IF EXISTS (
    SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_assignments_agent'
)
BEGIN
    ALTER TABLE dbo.assignments DROP CONSTRAINT FK_assignments_agent;
END;
GO

-- ==================== 2. Drop the old, dependent delivery_agents table ====================
IF OBJECT_ID('dbo.delivery_agents', 'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.delivery_agents;
END;
GO

-- ==================== 3. Recreate delivery_agents as an INDEPENDENT table ====================
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
GO

-- ==================== 4. Re-attach dbo.assignments to the new table ====================
ALTER TABLE dbo.assignments
    ADD CONSTRAINT FK_assignments_agent FOREIGN KEY (agent_id)
        REFERENCES dbo.delivery_agents(agent_id);
GO