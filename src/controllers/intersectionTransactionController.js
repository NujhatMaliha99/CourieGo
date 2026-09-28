const { poolPromise, sql } = require('../config/database');

async function getIntersectionTransaction(req, res, next) {
  let transaction;

  try {
    const pool = await poolPromise;

    const intersection1Result = await pool.request().query(`
      SELECT full_name
      FROM dbo.users

      INTERSECT

      SELECT full_name
      FROM dbo.receivers

      ORDER BY full_name;
    `);

    const intersection2Result = await pool.request().query(`
      SELECT full_name
      FROM dbo.users

      INTERSECT

      SELECT full_name
      FROM dbo.delivery_agents

      ORDER BY full_name;
    `);

   
    transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
      const updateRequest = new sql.Request(transaction);

      await updateRequest.query(`
        UPDATE dbo.parcels
        SET
          status = 'in_transit',
          updated_at = SYSDATETIME()
        WHERE parcel_id = (
          SELECT TOP 1 parcel_id
          FROM dbo.parcels
          WHERE status = 'pending'
          ORDER BY parcel_id
        );
      `);

      await transaction.commit();
    } catch (transactionError) {
      await transaction.rollback();
      throw transactionError;
    }

    const transactionResult = await pool.request().query(`
      SELECT
        parcel_id,
        tracking_id,
        sender_id,
        receiver_id,
        parcel_type,
        weight,
        charge,
        status,
        created_at,
        updated_at
      FROM dbo.parcels
      ORDER BY parcel_id DESC;
    `);

    
    res.json({
      intersection1: intersection1Result.recordset,
      intersection2: intersection2Result.recordset,
      transaction: transactionResult.recordset,
    });

  } catch (error) {
    next(error);
  }
}

module.exports = {
  getIntersectionTransaction,
};