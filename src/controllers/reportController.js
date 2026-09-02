const { sql, poolPromise } = require('../config/database');


// 1. TOP SENDERS
async function getTopSenders(req, res, next) {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
          s.user_id AS sender_id,
          s.full_name AS sender_name,
          COUNT(p.parcel_id) AS total_parcels,
          SUM(p.charge) AS total_charge
      FROM dbo.users AS s
      FULL JOIN dbo.parcels AS p
          ON s.user_id = p.sender_id
      GROUP BY s.user_id, s.full_name
      ORDER BY total_charge DESC;
    `);

    res.status(200).json({
      message: 'Top senders retrieved successfully.',
      data: result.recordset
    });

  } catch (error) {
    next(error);
  }
}


// 2. TOP SENDERS - SUBQUERY
async function getTopSendersSubquery(req, res, next) {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
          s.user_id AS sender_id,
          s.full_name AS sender_name,
          COUNT(p.parcel_id) AS total_parcels,
          SUM(p.charge) AS total_revenue
      FROM dbo.users AS s
      FULL JOIN dbo.parcels AS p
          ON s.user_id = p.sender_id
      GROUP BY s.user_id, s.full_name
      HAVING SUM(p.charge) > (
          SELECT AVG(total_charge)
          FROM (
              SELECT SUM(charge) AS total_charge
              FROM dbo.parcels
              GROUP BY sender_id
          ) AS r
      )
      ORDER BY total_revenue DESC;
    `);

    res.status(200).json({
      message: 'Top senders subquery report retrieved successfully.',
      data: result.recordset
    });

  } catch (error) {
    next(error);
  }
}


// 3. SENDER-RECEIVER PAIRS
async function getSenderReceiverPairs(req, res, next) {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
          s.user_id AS sender_id,
          s.full_name AS sender_name,
          r.receiver_id,
          r.full_name AS receiver_name,
          COUNT(p.parcel_id) AS total_parcels_between_them,
          SUM(p.charge) AS total_charge_between_them
      FROM dbo.users AS s
      FULL JOIN dbo.parcels AS p
          ON s.user_id = p.sender_id
      FULL JOIN dbo.receivers AS r
          ON p.receiver_id = r.receiver_id
      GROUP BY
          s.user_id,
          s.full_name,
          r.receiver_id,
          r.full_name
      HAVING COUNT(p.parcel_id) >= 1
      ORDER BY total_parcels_between_them DESC;
    `);

    res.status(200).json({
      message: 'Sender receiver pairs retrieved successfully.',
      data: result.recordset
    });

  } catch (error) {
    next(error);
  }
}


// 4. RECEIVER ADDRESS-WISE
async function getReceiverAddressReport(req, res, next) {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
          r.address,
          COUNT(p.parcel_id) AS total_parcels,
          SUM(p.charge) AS total_charge
      FROM dbo.receivers AS r
      FULL JOIN dbo.parcels AS p
          ON r.receiver_id = p.receiver_id
      GROUP BY r.address
      ORDER BY total_parcels DESC;
    `);

    res.status(200).json({
      message: 'Receiver address report retrieved successfully.',
      data: result.recordset
    });

  } catch (error) {
    next(error);
  }
}


// 5. SUSPICIOUS RECEIVERS
async function getSuspiciousReceivers(req, res, next) {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
          r.receiver_id,
          r.full_name AS receiver_name,
          r.phone,
          COUNT(p.parcel_id) AS total_parcels_received
      FROM dbo.receivers AS r
      FULL JOIN dbo.parcels AS p
          ON r.receiver_id = p.receiver_id
      GROUP BY
          r.receiver_id,
          r.full_name,
          r.phone
      HAVING COUNT(p.parcel_id) > 5
      ORDER BY total_parcels_received DESC;
    `);

    res.status(200).json({
      message: 'Suspicious receivers retrieved successfully.',
      data: result.recordset
    });

  } catch (error) {
    next(error);
  }
}


// 6. ZERO ACTIVITY SENDERS
async function getZeroActivitySenders(req, res, next) {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
          s.user_id AS sender_id,
          s.full_name AS sender_name,
          COUNT(p.parcel_id) AS total_parcels
      FROM dbo.users AS s
      FULL JOIN dbo.parcels AS p
          ON s.user_id = p.sender_id
      GROUP BY
          s.user_id,
          s.full_name
      HAVING COUNT(p.parcel_id) = 0;
    `);

    res.status(200).json({
      message: 'Zero activity senders retrieved successfully.',
      data: result.recordset
    });

  } catch (error) {
    next(error);
  }
}


// 7. ZERO ACTIVITY RECEIVERS
async function getZeroActivityReceivers(req, res, next) {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
          r.receiver_id,
          r.full_name AS receiver_name,
          COUNT(p.parcel_id) AS total_parcels
      FROM dbo.receivers AS r
      FULL JOIN dbo.parcels AS p
          ON r.receiver_id = p.receiver_id
      GROUP BY
          r.receiver_id,
          r.full_name
      HAVING COUNT(p.parcel_id) = 0;
    `);

    res.status(200).json({
      message: 'Zero activity receivers retrieved successfully.',
      data: result.recordset
    });

  } catch (error) {
    next(error);
  }
}


// 8. SENDER-WISE AVERAGE WEIGHT
async function getSenderWeightReport(req, res, next) {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
          s.user_id AS sender_id,
          s.full_name AS sender_name,
          COUNT(p.parcel_id) AS total_parcels,
          AVG(p.weight) AS avg_weight,
          MIN(p.weight) AS min_weight,
          MAX(p.weight) AS max_weight
      FROM dbo.users AS s
      FULL JOIN dbo.parcels AS p
          ON s.user_id = p.sender_id
      GROUP BY
          s.user_id,
          s.full_name
      HAVING COUNT(p.parcel_id) >= 1
      ORDER BY avg_weight DESC;
    `);

    res.status(200).json({
      message: 'Sender weight report retrieved successfully.',
      data: result.recordset
    });

  } catch (error) {
    next(error);
  }
}


// 9. FULL REPORT
async function getFullReport(req, res, next) {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
          s.user_id AS sender_id,
          s.full_name AS sender_name,
          r.receiver_id,
          r.full_name AS receiver_name,
          COUNT(p.parcel_id) AS total_parcels,
          SUM(p.charge) AS total_revenue,
          AVG(p.charge) AS avg_charge_per_parcel
      FROM dbo.users AS s
      FULL JOIN dbo.parcels AS p
          ON s.user_id = p.sender_id
      FULL JOIN dbo.receivers AS r
          ON p.receiver_id = r.receiver_id
      GROUP BY
          s.user_id,
          s.full_name,
          r.receiver_id,
          r.full_name
      ORDER BY total_revenue DESC;
    `);

    res.status(200).json({
      message: 'Full report retrieved successfully.',
      data: result.recordset
    });

  } catch (error) {
    next(error);
  }
}


module.exports = {
  getTopSenders,
  getTopSendersSubquery,
  getSenderReceiverPairs,
  getReceiverAddressReport,
  getSuspiciousReceivers,
  getZeroActivitySenders,
  getZeroActivityReceivers,
  getSenderWeightReport,
  getFullReport
};