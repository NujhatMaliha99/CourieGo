USE courier_management;
GO

-- 01. VIEW: Create a view for parcel summary combining parcels and senders
CREATE OR ALTER VIEW dbo.vw_parcel_summary AS
SELECT dbo.parcels.parcel_id, dbo.parcels.tracking_id, dbo.parcels.parcel_type, dbo.parcels.status, dbo.users.full_name AS sender_name
FROM dbo.parcels
INNER JOIN dbo.users ON dbo.parcels.sender_id = dbo.users.user_id;

GO

-- 02. VIEW: Combine parcel, delivery, assignment, and payment details
CREATE OR ALTER VIEW dbo.vw_parcel_delivery_overview
AS
WITH payment_totals AS (
    SELECT
        parcel_id,
        COUNT(*) AS payment_count,
        SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) AS amount_paid
    FROM dbo.payments
    GROUP BY parcel_id
),
ranked_events AS (
    SELECT
        history.parcel_id,
        tracking.status_name AS latest_event,
        history.location AS last_known_location,
        history.recorded_at AS last_event_at,
        ROW_NUMBER() OVER (
            PARTITION BY history.parcel_id
            ORDER BY history.recorded_at DESC, history.history_id DESC
        ) AS row_number
    FROM dbo.delivery_history AS history
    INNER JOIN dbo.tracking_status AS tracking
        ON tracking.tracking_status_id = history.tracking_status_id
),
ranked_assignments AS (
    SELECT
        assignment.parcel_id,
        agent.full_name AS agent_name,
        agent.vehicle_number,
        assignment.completed_at,
        ROW_NUMBER() OVER (
            PARTITION BY assignment.parcel_id
            ORDER BY
                CASE WHEN assignment.completed_at IS NULL THEN 0 ELSE 1 END,
                assignment.assigned_at DESC,
                assignment.assignment_id DESC
        ) AS row_number
    FROM dbo.assignments AS assignment
    INNER JOIN dbo.delivery_agents AS agent
        ON agent.agent_id = assignment.agent_id
)
SELECT
    parcel.parcel_id,
    parcel.tracking_id,
    parcel.parcel_type,
    parcel.status AS parcel_status,
    sender.full_name AS sender_name,
    receiver.full_name AS receiver_name,
    event.latest_event,
    event.last_known_location,
    event.last_event_at,
    assignment.agent_name,
    assignment.vehicle_number,
    CASE
        WHEN assignment.parcel_id IS NULL THEN 'Unassigned'
        WHEN assignment.completed_at IS NULL THEN 'Active'
        ELSE 'Completed'
    END AS assignment_status,
    COALESCE(payment.payment_count, 0) AS payment_count,
    COALESCE(payment.amount_paid, 0) AS amount_paid,
    CASE
        WHEN parcel.charge > COALESCE(payment.amount_paid, 0)
            THEN parcel.charge - COALESCE(payment.amount_paid, 0)
        ELSE 0
    END AS balance_due
FROM dbo.parcels AS parcel
INNER JOIN dbo.users AS sender
    ON sender.user_id = parcel.sender_id
INNER JOIN dbo.receivers AS receiver
    ON receiver.receiver_id = parcel.receiver_id
LEFT JOIN ranked_events AS event
    ON event.parcel_id = parcel.parcel_id AND event.row_number = 1
LEFT JOIN ranked_assignments AS assignment
    ON assignment.parcel_id = parcel.parcel_id AND assignment.row_number = 1
LEFT JOIN payment_totals AS payment
    ON payment.parcel_id = parcel.parcel_id;

GO

-- 03. STORED PROCEDURE: Get parcels by status
CREATE OR ALTER PROCEDURE dbo.usp_GetParcelsByStatus
    @status VARCHAR(30)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT parcel_id, tracking_id, parcel_type, weight, charge, status 
    FROM dbo.parcels 
    WHERE status = @status;
END;

GO

-- 04. SET-BASED QUERY (EXCEPT): Find users who have not sent any parcels
SELECT user_id AS id FROM dbo.users
EXCEPT
SELECT sender_id AS id FROM dbo.parcels;
