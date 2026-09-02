const { poolPromise } = require('../config/database');

// 1. Parcel Type-wise Revenue Analysis
async function getParcelTypeRevenue(req, res, next) {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
          p.parcel_type,
          COUNT(p.parcel_id) AS number_of_parcels,
          SUM(p.charge) AS total_revenue,
          AVG(p.charge) AS average_charge
      FROM dbo.parcels AS p
      GROUP BY p.parcel_type
      ORDER BY total_revenue DESC;
    `);

    res.json({
      message: 'Parcel type-wise revenue report retrieved successfully.',
      data: result.recordset
    });
  } catch (error) {
    next(error);
  }
}


// 2. Parcel Type-wise Weight Analysis
async function getParcelTypeWeight(req, res, next) {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
          p.parcel_type,
          COUNT(p.parcel_id) AS number_of_parcels,
          SUM(p.weight) AS total_weight,
          AVG(p.weight) AS average_weight,
          MAX(p.weight) AS heaviest_parcel
      FROM dbo.parcels AS p
      GROUP BY p.parcel_type
      ORDER BY total_weight DESC;
    `);

    res.json({
      message: 'Parcel type-wise weight report retrieved successfully.',
      data: result.recordset
    });
  } catch (error) {
    next(error);
  }
}


// 3. Status-wise Charge Range
async function getStatusChargeRange(req, res, next) {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
          p.status,
          MIN(p.charge) AS minimum_charge,
          MAX(p.charge) AS maximum_charge,
          SUM(p.charge) AS total_charge
      FROM dbo.parcels AS p
      GROUP BY p.status
      ORDER BY total_charge DESC;
    `);

    res.json({
      message: 'Status-wise charge range report retrieved successfully.',
      data: result.recordset
    });
  } catch (error) {
    next(error);
  }
}


// 4. Senders with High Total Charge
async function getHighChargeSenders(req, res, next) {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
          s.user_id AS sender_id,
          s.full_name AS sender_name,
          SUM(p.charge) AS total_charge
      FROM dbo.users AS s
      INNER JOIN dbo.parcels AS p
          ON s.user_id = p.sender_id
      GROUP BY s.user_id, s.full_name
      HAVING SUM(p.charge) > 500
      ORDER BY total_charge DESC;
    `);

    res.json({
      message: 'High charge senders report retrieved successfully.',
      data: result.recordset
    });
  } catch (error) {
    next(error);
  }
}


// 5. Parcels with Above-Average Charge for Their Parcel Type
async function getAboveAverageChargeParcels(req, res, next) {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
          p.parcel_id,
          p.tracking_id,
          p.parcel_type,
          p.charge
      FROM dbo.parcels AS p
      WHERE p.charge > (
          SELECT AVG(p2.charge)
          FROM dbo.parcels AS p2
          WHERE p2.parcel_type = p.parcel_type
      )
      ORDER BY p.parcel_type, p.charge DESC;
    `);

    res.json({
      message: 'Above-average charge parcels report retrieved successfully.',
      data: result.recordset
    });
  } catch (error) {
    next(error);
  }
}


// 6. Senders of the Heaviest Parcels
async function getHeaviestParcelSenders(req, res, next) {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
          s.user_id AS sender_id,
          s.full_name AS sender_name,
          p.parcel_id,
          p.tracking_id,
          p.weight
      FROM dbo.users AS s
      INNER JOIN dbo.parcels AS p
          ON s.user_id = p.sender_id
      WHERE p.weight = (
          SELECT MAX(p2.weight)
          FROM dbo.parcels AS p2
      )
      ORDER BY s.user_id;
    `);

    res.json({
      message: 'Heaviest parcel senders report retrieved successfully.',
      data: result.recordset
    });
  } catch (error) {
    next(error);
  }
}


module.exports = {
  getParcelTypeRevenue,
  getParcelTypeWeight,
  getStatusChargeRange,
  getHighChargeSenders,
  getAboveAverageChargeParcels,
  getHeaviestParcelSenders
};