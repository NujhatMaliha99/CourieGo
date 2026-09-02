const { poolPromise } = require('../config/database');

async function runQuery(res, next, message, query) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(query);

    return res.status(200).json({
      message,
      data: result.recordset,
    });
  } catch (error) {
    return next(error);
  }
}

function getMatchingParcelDetails(req, res, next) {
  return runQuery(res, next, 'Matching parcel, sender, and receiver details retrieved.', `
    SELECT
      p.parcel_id,
      p.tracking_id,
      s.user_id AS sender_id,
      s.full_name AS sender_name,
      r.receiver_id,
      r.full_name AS receiver_name,
      p.parcel_type,
      p.charge,
      p.status
    FROM dbo.parcels AS p
    INNER JOIN dbo.users AS s
      ON p.sender_id = s.user_id
    INNER JOIN dbo.receivers AS r
      ON p.receiver_id = r.receiver_id
    ORDER BY p.parcel_id;
  `);
}

function getAllReceiversWithParcels(req, res, next) {
  return runQuery(res, next, 'All receivers and parcel information retrieved.', `
    SELECT
      r.receiver_id,
      r.full_name AS receiver_name,
      r.phone AS receiver_phone,
      p.parcel_id,
      p.tracking_id,
      p.status
    FROM dbo.receivers AS r
    LEFT OUTER JOIN dbo.parcels AS p
      ON r.receiver_id = p.receiver_id
    ORDER BY r.receiver_id, p.parcel_id;
  `);
}

function getReceiverParcelCounts(req, res, next) {
  return runQuery(res, next, 'Receiver parcel counts retrieved.', `
    SELECT
      r.receiver_id,
      r.full_name AS receiver_name,
      COUNT(p.parcel_id) AS total_parcels
    FROM dbo.receivers AS r
    LEFT OUTER JOIN dbo.parcels AS p
      ON r.receiver_id = p.receiver_id
    GROUP BY r.receiver_id, r.full_name
    HAVING COUNT(p.parcel_id) >= 1
    ORDER BY r.receiver_id;
  `);
}

function getAboveAverageChargeParcels(req, res, next) {
  return runQuery(res, next, 'Above-average charge parcels retrieved.', `
    SELECT
      parcel_id,
      tracking_id,
      parcel_type,
      charge
    FROM dbo.parcels
    WHERE charge > (
      SELECT AVG(charge)
      FROM dbo.parcels
    )
    ORDER BY charge DESC;
  `);
}

function getReceiversWithoutPendingParcels(req, res, next) {
  return runQuery(res, next, 'Receivers without pending parcels retrieved.', `
    SELECT
      r.receiver_id,
      r.full_name AS receiver_name,
      r.phone,
      r.address
    FROM dbo.receivers AS r
    WHERE NOT EXISTS (
      SELECT 1
      FROM dbo.parcels AS p
      WHERE p.receiver_id = r.receiver_id
        AND p.status = 'pending'
    )
    ORDER BY r.full_name;
  `);
}

module.exports = {
  getMatchingParcelDetails,
  getAllReceiversWithParcels,
  getReceiverParcelCounts,
  getAboveAverageChargeParcels,
  getReceiversWithoutPendingParcels,
};
