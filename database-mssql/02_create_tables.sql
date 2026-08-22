USE courier_management;
GO

IF OBJECT_ID('dbo.roles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.roles (
        role_id INT IDENTITY(1,1) NOT NULL,
        role_name VARCHAR(50) NOT NULL,
        CONSTRAINT PK_roles PRIMARY KEY (role_id),
        CONSTRAINT UQ_roles_role_name UNIQUE (role_name)
    );
END;
GO

IF OBJECT_ID('dbo.users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.users (
        user_id INT IDENTITY(1,1) NOT NULL,
        role_id INT NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(120) NOT NULL,
        phone VARCHAR(20) NULL,
        address VARCHAR(255) NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_users_created_at DEFAULT SYSDATETIME(),
        CONSTRAINT PK_users PRIMARY KEY (user_id),
        CONSTRAINT UQ_users_email UNIQUE (email),
        CONSTRAINT FK_users_role FOREIGN KEY (role_id) REFERENCES dbo.roles(role_id)
    );
END;
GO

IF OBJECT_ID('dbo.login', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.login (
        login_id INT IDENTITY(1,1) NOT NULL,
        user_id INT NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        last_login DATETIME2 NULL,
        CONSTRAINT PK_login PRIMARY KEY (login_id),
        CONSTRAINT UQ_login_user UNIQUE (user_id),
        CONSTRAINT FK_login_user FOREIGN KEY (user_id)
            REFERENCES dbo.users(user_id) ON DELETE CASCADE
    );
END;
GO

IF OBJECT_ID('dbo.receivers', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.receivers (
        receiver_id INT IDENTITY(1,1) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(120) NULL,
        address VARCHAR(255) NOT NULL,
        CONSTRAINT PK_receivers PRIMARY KEY (receiver_id)
    );
END;
GO

IF OBJECT_ID('dbo.parcels', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.parcels (
        parcel_id INT IDENTITY(1,1) NOT NULL,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        tracking_id VARCHAR(50) NOT NULL,
        parcel_type VARCHAR(50) NOT NULL,
        weight DECIMAL(10,2) NOT NULL,
        charge DECIMAL(10,2) NOT NULL,
        status VARCHAR(30) NOT NULL CONSTRAINT DF_parcels_status DEFAULT 'pending',
        created_at DATETIME2 NOT NULL CONSTRAINT DF_parcels_created_at DEFAULT SYSDATETIME(),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_parcels_updated_at DEFAULT SYSDATETIME(),
        CONSTRAINT PK_parcels PRIMARY KEY (parcel_id),
        CONSTRAINT UQ_parcels_tracking_id UNIQUE (tracking_id),
        CONSTRAINT FK_parcels_sender FOREIGN KEY (sender_id) REFERENCES dbo.users(user_id),
        CONSTRAINT FK_parcels_receiver FOREIGN KEY (receiver_id) REFERENCES dbo.receivers(receiver_id),
        CONSTRAINT CK_parcels_weight CHECK (weight > 0),
        CONSTRAINT CK_parcels_charge CHECK (charge >= 0),
        CONSTRAINT CK_parcels_status CHECK (status IN (
            'pending', 'picked_up', 'in_transit',
            'out_for_delivery', 'delivered', 'cancelled'
        ))
    );
END;
GO

IF OBJECT_ID('dbo.payments', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.payments (
        payment_id INT IDENTITY(1,1) NOT NULL,
        parcel_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(30) NULL,
        payment_status VARCHAR(30) NOT NULL CONSTRAINT DF_payments_status DEFAULT 'unpaid',
        paid_at DATETIME2 NULL,
        CONSTRAINT PK_payments PRIMARY KEY (payment_id),
        CONSTRAINT FK_payments_parcel FOREIGN KEY (parcel_id)
            REFERENCES dbo.parcels(parcel_id) ON DELETE CASCADE,
        CONSTRAINT CK_payments_amount CHECK (amount >= 0),
        CONSTRAINT CK_payments_status CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'refunded'))
    );
END;
GO

IF OBJECT_ID('dbo.delivery_agents', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.delivery_agents (
        agent_id INT IDENTITY(1,1) NOT NULL,
        user_id INT NOT NULL,
        vehicle_number VARCHAR(50) NULL,
        availability_status VARCHAR(30) NOT NULL
            CONSTRAINT DF_delivery_agents_status DEFAULT 'available',
        CONSTRAINT PK_delivery_agents PRIMARY KEY (agent_id),
        CONSTRAINT UQ_delivery_agents_user UNIQUE (user_id),
        CONSTRAINT FK_delivery_agents_user FOREIGN KEY (user_id)
            REFERENCES dbo.users(user_id) ON DELETE CASCADE,
        CONSTRAINT CK_delivery_agents_status CHECK (
            availability_status IN ('available', 'assigned', 'offline')
        )
    );
END;
GO

IF OBJECT_ID('dbo.assignments', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.assignments (
        assignment_id INT IDENTITY(1,1) NOT NULL,
        parcel_id INT NOT NULL,
        agent_id INT NOT NULL,
        assigned_at DATETIME2 NOT NULL CONSTRAINT DF_assignments_assigned_at DEFAULT SYSDATETIME(),
        completed_at DATETIME2 NULL,
        CONSTRAINT PK_assignments PRIMARY KEY (assignment_id),
        CONSTRAINT FK_assignments_parcel FOREIGN KEY (parcel_id)
            REFERENCES dbo.parcels(parcel_id) ON DELETE CASCADE,
        CONSTRAINT FK_assignments_agent FOREIGN KEY (agent_id)
            REFERENCES dbo.delivery_agents(agent_id)
    );
END;
GO

IF OBJECT_ID('dbo.tracking_status', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.tracking_status (
        tracking_status_id INT IDENTITY(1,1) NOT NULL,
        status_name VARCHAR(50) NOT NULL,
        description VARCHAR(255) NULL,
        CONSTRAINT PK_tracking_status PRIMARY KEY (tracking_status_id),
        CONSTRAINT UQ_tracking_status_name UNIQUE (status_name)
    );
END;
GO

IF OBJECT_ID('dbo.delivery_history', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.delivery_history (
        history_id INT IDENTITY(1,1) NOT NULL,
        parcel_id INT NOT NULL,
        tracking_status_id INT NOT NULL,
        location VARCHAR(150) NULL,
        remarks VARCHAR(255) NULL,
        recorded_at DATETIME2 NOT NULL
            CONSTRAINT DF_delivery_history_recorded_at DEFAULT SYSDATETIME(),
        CONSTRAINT PK_delivery_history PRIMARY KEY (history_id),
        CONSTRAINT FK_delivery_history_parcel FOREIGN KEY (parcel_id)
            REFERENCES dbo.parcels(parcel_id) ON DELETE CASCADE,
        CONSTRAINT FK_delivery_history_status FOREIGN KEY (tracking_status_id)
            REFERENCES dbo.tracking_status(tracking_status_id)
    );
END;
GO
