const { sql, poolPromise } = require('../../config/database');

async function getAllExtraFeatures(req, res, next) {
  try {
    const pool = await poolPromise;
    const [viewRes, exceptRes] = await Promise.all([
      pool.request().query('SELECT * FROM dbo.vw_parcel_summary'),
      pool.request().query('SELECT user_id AS id FROM dbo.users EXCEPT SELECT sender_id AS id FROM dbo.parcels')
    ]);

    return res.status(200).json({
      view_data: viewRes.recordset,
      except_data: exceptRes.recordset
    });
  } catch (error) {
    next(error);
  }
}

async function getParcelsByStatus(req, res, next) {
  try {
    const status = String(req.query.status || '').trim();
    if (!status) {
      return res.status(400).json({ message: 'A parcel status is required.' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('status', sql.VarChar(30), status)
      .execute('dbo.usp_GetParcelsByStatus');

    return res.status(200).json({ status, data: result.recordset });
  } catch (error) {
    next(error);
  }
}

async function runProcedureAndTransaction(req, res, next) {
  try {
    const { sender_id, receiver_id, tracking_id, parcel_type, weight, charge, status } = req.body;
    const pool = await poolPromise;

    const requiredFields = { sender_id, receiver_id, tracking_id, parcel_type, weight, charge, status };
    const missingField = Object.entries(requiredFields).find(([, value]) => value === undefined || value === '');
    if (missingField) {
      return res.status(400).json({ message: `${missingField[0]} is required.` });
    }

    const transResult = await pool.request()
      .input('sender_id', sql.Int, Number(sender_id))
      .input('receiver_id', sql.Int, Number(receiver_id))
      .input('tracking_id', sql.VarChar(50), tracking_id)
      .input('parcel_type', sql.VarChar(50), parcel_type)
      .input('weight', sql.Decimal(10,2), Number(weight))
      .input('charge', sql.Decimal(10,2), Number(charge))
      .input('status', sql.VarChar(30), status)
      .execute('dbo.usp_PerformTransactionDemo');

    const parcelId = transResult.recordset?.[0]?.parcel_id;
    const auditResult = parcelId
      ? await pool.request()
        .input('parcel_id', sql.Int, parcelId)
        .query(`
          SELECT TOP 1 log_id, parcel_id, action_message, action_time
          FROM dbo.parcel_audit_log
          WHERE parcel_id = @parcel_id
          ORDER BY log_id DESC
        `)
      : { recordset: [] };

    return res.status(200).json({
      message: 'Transaction completed and the insert trigger created an audit log.',
      procedure_data: transResult.recordset,
      audit_data: auditResult.recordset,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllExtraFeatures,
  getParcelsByStatus,
  runProcedureAndTransaction,
};