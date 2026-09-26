const { sql, poolPromise } = require('../config/database');

async function getAllAssignments(req, res, next) {
  try {
    const pool = await poolPromise;
    const onlyActive = req.query.active === 'true';

    const result = await pool.request().query(`
      SELECT
        a.assignment_id,
        a.parcel_id,
        a.agent_id,
        a.assigned_at,
        a.completed_at,
        p.tracking_id,
        p.status AS parcel_status,
        u.full_name AS agent_name
      FROM dbo.assignments a
      JOIN dbo.parcels p ON p.parcel_id = a.parcel_id
      JOIN dbo.delivery_agents da ON da.agent_id = a.agent_id
      JOIN dbo.users u ON u.user_id = da.user_id
      ${onlyActive ? 'WHERE a.completed_at IS NULL' : ''}
      ORDER BY a.assigned_at DESC
    `);

    return res.status(200).json({
      message: 'Assignments retrieved successfully.',
      data: result.recordset,
    });
  } catch (error) {
    next(error);
  }
}

async function getAssignmentById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Assignment ID must be a positive integer.' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('assignment_id', sql.Int, id)
      .query(`
        SELECT
          a.assignment_id,
          a.parcel_id,
          a.agent_id,
          a.assigned_at,
          a.completed_at,
          p.tracking_id,
          p.status AS parcel_status,
          u.full_name AS agent_name
        FROM dbo.assignments a
        JOIN dbo.parcels p ON p.parcel_id = a.parcel_id
        JOIN dbo.delivery_agents da ON da.agent_id = a.agent_id
        JOIN dbo.users u ON u.user_id = da.user_id
        WHERE a.assignment_id = @assignment_id
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    return res.status(200).json({
      message: 'Assignment retrieved successfully.',
      data: result.recordset[0],
    });
  } catch (error) {
    next(error);
  }
}

// Creates an assignment and, in the same transaction, moves the delivery
// agent to 'assigned' and the parcel to 'picked_up'.
async function createAssignment(req, res, next) {
  const parcel_id = Number(req.body.parcel_id);
  const agent_id = Number(req.body.agent_id);

  if (!Number.isInteger(parcel_id) || parcel_id <= 0 || !Number.isInteger(agent_id) || agent_id <= 0) {
    return res.status(400).json({ message: 'parcel_id and agent_id must be positive integers.' });
  }

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const parcelLookup = await new sql.Request(transaction)
      .input('parcel_id', sql.Int, parcel_id)
      .query('SELECT status FROM dbo.parcels WHERE parcel_id = @parcel_id');

    if (!parcelLookup.recordset.length) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Parcel not found.' });
    }

    const parcelStatus = parcelLookup.recordset[0].status;
    if (parcelStatus === 'delivered' || parcelStatus === 'cancelled') {
      await transaction.rollback();
      return res.status(400).json({ message: `Cannot assign an agent to a ${parcelStatus} parcel.` });
    }

    const activeLookup = await new sql.Request(transaction)
      .input('parcel_id', sql.Int, parcel_id)
      .query('SELECT assignment_id FROM dbo.assignments WHERE parcel_id = @parcel_id AND completed_at IS NULL');

    if (activeLookup.recordset.length) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Parcel already has an active assignment.' });
    }

    const agentLookup = await new sql.Request(transaction)
      .input('agent_id', sql.Int, agent_id)
      .query('SELECT availability_status FROM dbo.delivery_agents WHERE agent_id = @agent_id');

    if (!agentLookup.recordset.length) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Delivery agent not found.' });
    }

    if (agentLookup.recordset[0].availability_status !== 'available') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Delivery agent is not available.' });
    }

    const assignmentResult = await new sql.Request(transaction)
      .input('parcel_id', sql.Int, parcel_id)
      .input('agent_id', sql.Int, agent_id)
      .query(`
        INSERT INTO dbo.assignments (parcel_id, agent_id)
        OUTPUT INSERTED.*
        VALUES (@parcel_id, @agent_id)
      `);

    await new sql.Request(transaction)
      .input('agent_id', sql.Int, agent_id)
      .query(`
        UPDATE dbo.delivery_agents
        SET availability_status = 'assigned'
        WHERE agent_id = @agent_id
      `);

    await new sql.Request(transaction)
      .input('parcel_id', sql.Int, parcel_id)
      .query(`
        UPDATE dbo.parcels
        SET status = 'picked_up', updated_at = SYSDATETIME()
        WHERE parcel_id = @parcel_id
      `);

    await transaction.commit();

    return res.status(201).json({
      message: 'Delivery agent assigned successfully.',
      data: assignmentResult.recordset[0],
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

// Marks an assignment completed and, in the same transaction, frees the
// delivery agent and marks the parcel 'delivered'.
async function completeAssignment(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'Assignment ID must be a positive integer.' });
  }

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const lookup = await new sql.Request(transaction)
      .input('assignment_id', sql.Int, id)
      .query('SELECT parcel_id, agent_id, completed_at FROM dbo.assignments WHERE assignment_id = @assignment_id');

    if (!lookup.recordset.length) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    const { parcel_id, agent_id, completed_at } = lookup.recordset[0];

    if (completed_at) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Assignment is already completed.' });
    }

    const assignmentResult = await new sql.Request(transaction)
      .input('assignment_id', sql.Int, id)
      .query(`
        UPDATE dbo.assignments
        SET completed_at = SYSDATETIME()
        OUTPUT INSERTED.*
        WHERE assignment_id = @assignment_id
      `);

    await new sql.Request(transaction)
      .input('agent_id', sql.Int, agent_id)
      .query(`
        UPDATE dbo.delivery_agents
        SET availability_status = 'available'
        WHERE agent_id = @agent_id
      `);

    await new sql.Request(transaction)
      .input('parcel_id', sql.Int, parcel_id)
      .query(`
        UPDATE dbo.parcels
        SET status = 'delivered', updated_at = SYSDATETIME()
        WHERE parcel_id = @parcel_id
      `);

    await transaction.commit();

    return res.status(200).json({
      message: 'Assignment marked as completed.',
      data: assignmentResult.recordset[0],
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

module.exports = {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  completeAssignment,
};