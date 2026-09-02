const { sql, poolPromise } = require('../config/database');

async function getDistinctSenderAvgCharge(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
          r.receiver_id,
          r.full_name AS receiver_name,
          COUNT(DISTINCT p.sender_id) AS unique_senders_count,
          ISNULL(MIN(p.charge), 0) AS min_charge,
          ISNULL(AVG(p.charge), 0) AS avg_charge
      FROM dbo.parcels AS p
      RIGHT JOIN dbo.receivers AS r
          ON p.receiver_id = r.receiver_id
      GROUP BY r.receiver_id, r.full_name
      ORDER BY avg_charge DESC;
    `);

    res.status(200).json({
      message: 'Distinct sender count & avg charge retrieved successfully.',
      data: result.recordset
    });
  } catch (error) {
    next(error);
  }
}

async function getReceiverWeightAnalysis(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
          r.receiver_id,
          r.full_name AS receiver_name,
          COUNT(p.parcel_id) AS total_parcels_received,
          SUM(p.weight) AS total_weight,
          AVG(p.weight) AS avg_weight
      FROM dbo.receivers AS r
      INNER JOIN dbo.parcels AS p
          ON r.receiver_id = p.receiver_id
      GROUP BY r.receiver_id, r.full_name
      HAVING COUNT(p.parcel_id) > 1
      ORDER BY avg_weight DESC;
    `);

    res.status(200).json({
      message: 'Receiver weight analysis retrieved successfully.',
      data: result.recordset
    });
  } catch (error) {
    next(error);
  }
}

async function getStatusSummary(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
          p.status,
          COUNT(p.parcel_id) AS total_parcels,
          AVG(p.charge) AS avg_charge,
          MAX(p.weight) AS max_weight
      FROM dbo.parcels AS p
      GROUP BY p.status
      ORDER BY total_parcels DESC;
    `);

    res.status(200).json({
      message: 'Status summary retrieved successfully.',
      data: result.recordset
    });
  } catch (error) {
    next(error);
  }
}

async function getReceiversAboveAvgWeight(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
          r.receiver_id,
          r.full_name AS receiver_name,
          AVG(p.weight) AS receiver_avg_weight
      FROM dbo.receivers AS r
      INNER JOIN dbo.parcels AS p
          ON r.receiver_id = p.receiver_id
      GROUP BY r.receiver_id, r.full_name
      HAVING AVG(p.weight) > (
          SELECT AVG(weight) 
          FROM dbo.parcels
      )
      ORDER BY receiver_avg_weight DESC;
    `);

    res.status(200).json({
      message: 'Receivers above overall average weight retrieved successfully.',
      data: result.recordset
    });
  } catch (error) {
    next(error);
  }
}

async function getSenderChargeAnalysis(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
          s.user_id AS sender_id,
          s.full_name AS sender_name,
          COUNT(p.parcel_id) AS total_sent,
          MIN(p.charge) AS min_charge_sent,
          MAX(p.charge) AS max_charge_sent,
          AVG(p.charge) AS avg_charge_sent
      FROM dbo.users AS s
      INNER JOIN dbo.parcels AS p
          ON s.user_id = p.sender_id
      GROUP BY s.user_id, s.full_name
      ORDER BY max_charge_sent DESC;
    `);

    res.status(200).json({
      message: 'Sender charge analysis retrieved successfully.',
      data: result.recordset
    });
  } catch (error) {
    next(error);
  }
}

async function getReceiverAddressSummary(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
          r.receiver_id,
          r.full_name AS receiver_name,
          r.address AS receiver_address,
          COUNT(p.parcel_id) AS total_parcels_received,
          ISNULL(SUM(p.charge), 0) AS total_charge_spent
      FROM dbo.parcels AS p
      RIGHT JOIN dbo.receivers AS r
          ON p.receiver_id = r.receiver_id
      GROUP BY r.receiver_id, r.full_name, r.address
      ORDER BY total_charge_spent DESC;
    `);

    res.status(200).json({
      message: 'Receiver address summary retrieved successfully.',
      data: result.recordset
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDistinctSenderAvgCharge,
  getReceiverWeightAnalysis,
  getStatusSummary,
  getReceiversAboveAvgWeight,
  getSenderChargeAnalysis,
  getReceiverAddressSummary
};