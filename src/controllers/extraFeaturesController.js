const { sql, poolPromise } = require('../config/database');

async function getAllExtraFeatures(req, res, next) {
  try {
    const pool = await poolPromise;
    const [viewRes, exceptRes, overviewRes] = await Promise.all([
      pool.request().query('SELECT * FROM dbo.vw_parcel_summary'),
      pool.request().query('SELECT user_id AS id FROM dbo.users EXCEPT SELECT sender_id AS id FROM dbo.parcels'),
      pool.request().query('SELECT * FROM dbo.vw_parcel_delivery_overview ORDER BY parcel_id DESC')
    ]);

    return res.status(200).json({
      view_data: viewRes.recordset,
      except_data: exceptRes.recordset,
      overview_data: overviewRes.recordset,
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

module.exports = {
  getAllExtraFeatures,
  getParcelsByStatus,
};