const { sql, poolPromise } = require('../config/database');

// 1. RIGHT JOIN WITH DISTINCT SENDER COUNT & AVG CHARGE
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

// 2. RECEIVER-WISE PARCEL WEIGHT ANALYSIS
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

// 3. STATUS-WISE CHARGE AND WEIGHT SUMMARY
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

// 4. RECEIVERS WHO RECEIVED HIGHER THAN OVERALL AVERAGE WEIGHT
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

// 5. SENDER-WISE MINIMUM & MAXIMUM CHARGE ANALYSIS
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

// 6. RIGHT JOIN WITH RECEIVER ADDRESS & TOTAL CHARGE SUMMARY
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

// 7. TOP SENDERS
async function getTopSenders(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TOP 10 s.user_id AS sender_id, s.full_name AS sender_name, 
             COUNT(p.parcel_id) AS total_parcels, SUM(p.charge) AS total_charge
      FROM dbo.users s
      LEFT JOIN dbo.parcels p ON s.user_id = p.sender_id
      GROUP BY s.user_id, s.full_name
      ORDER BY total_parcels DESC;
    `);
    res.status(200).json({ data: result.recordset });
  } catch (error) {
    next(error);
  }
}

// 8. SENDER - RECEIVER PAIRS
async function getSenderReceiverPairs(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT p.sender_id, s.full_name AS sender_name, 
             p.receiver_id, r.full_name AS receiver_name, 
             COUNT(p.parcel_id) AS total_parcels_between_them, 
             SUM(p.charge) AS total_charge_between_them
      FROM dbo.parcels p
      JOIN dbo.users s ON p.sender_id = s.user_id
      JOIN dbo.receivers r ON p.receiver_id = r.receiver_id
      GROUP BY p.sender_id, s.full_name, p.receiver_id, r.full_name;
    `);
    res.status(200).json({ data: result.recordset });
  } catch (error) {
    next(error);
  }
}

// 9. RECEIVER ADDRESS-WISE REPORT
async function getReceiverAddressReport(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT r.address, COUNT(p.parcel_id) AS total_parcels, SUM(p.charge) AS total_charge
      FROM dbo.receivers r
      LEFT JOIN dbo.parcels p ON r.receiver_id = p.receiver_id
      GROUP BY r.address;
    `);
    res.status(200).json({ data: result.recordset });
  } catch (error) {
    next(error);
  }
}

// 10. SUSPICIOUS RECEIVERS
async function getSuspiciousReceivers(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT r.receiver_id, r.full_name AS receiver_name, r.phone, COUNT(p.parcel_id) AS total_parcels_received
      FROM dbo.receivers r
      JOIN dbo.parcels p ON r.receiver_id = p.receiver_id
      GROUP BY r.receiver_id, r.full_name, r.phone
      HAVING COUNT(p.parcel_id) > 2;
    `);
    res.status(200).json({ data: result.recordset });
  } catch (error) {
    next(error);
  }
}

// 11. ZERO ACTIVITY SENDERS
async function getZeroActivitySenders(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT s.user_id AS sender_id, s.full_name AS sender_name, 0 AS total_parcels
      FROM dbo.users s
      WHERE s.user_id NOT IN (SELECT DISTINCT sender_id FROM dbo.parcels WHERE sender_id IS NOT NULL);
    `);
    res.status(200).json({ data: result.recordset });
  } catch (error) {
    next(error);
  }
}

// 12. ZERO ACTIVITY RECEIVERS
async function getZeroActivityReceivers(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT r.receiver_id, r.full_name AS receiver_name, 0 AS total_parcels
      FROM dbo.receivers r
      WHERE r.receiver_id NOT IN (SELECT DISTINCT receiver_id FROM dbo.parcels WHERE receiver_id IS NOT NULL);
    `);
    res.status(200).json({ data: result.recordset });
  } catch (error) {
    next(error);
  }
}

// 13. SENDER WEIGHT REPORT
async function getSenderWeightReport(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT s.user_id AS sender_id, s.full_name AS sender_name, 
             COUNT(p.parcel_id) AS total_parcels, 
             AVG(p.weight) AS avg_weight, 
             MIN(p.weight) AS min_weight, 
             MAX(p.weight) AS max_weight
      FROM dbo.users s
      JOIN dbo.parcels p ON s.user_id = p.sender_id
      GROUP BY s.user_id, s.full_name;
    `);
    res.status(200).json({ data: result.recordset });
  } catch (error) {
    next(error);
  }
}

// 14. FULL REPORT
async function getFullReport(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT p.sender_id, s.full_name AS sender_name, 
             p.receiver_id, r.full_name AS receiver_name, 
             COUNT(p.parcel_id) AS total_parcels, 
             SUM(p.charge) AS total_revenue, 
             AVG(p.charge) AS avg_charge_per_parcel
      FROM dbo.parcels p
      JOIN dbo.users s ON p.sender_id = s.user_id
      JOIN dbo.receivers r ON p.receiver_id = r.receiver_id
      GROUP BY p.sender_id, s.full_name, p.receiver_id, r.full_name;
    `);
    res.status(200).json({ data: result.recordset });
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
  getReceiverAddressSummary,
  getTopSenders,
  getSenderReceiverPairs,
  getReceiverAddressReport,
  getSuspiciousReceivers,
  getZeroActivitySenders,
  getZeroActivityReceivers,
  getSenderWeightReport,
  getFullReport
};