const { poolPromise } = require('../config/database');

async function getCheckpointReport(req, res, next) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT p.parcel_id, p.tracking_id, s.full_name AS sender_name,
             r.full_name AS receiver_name, p.parcel_type, p.status
      FROM dbo.parcels AS p
      INNER JOIN dbo.users AS s ON p.sender_id = s.user_id
      INNER JOIN dbo.receivers AS r ON p.receiver_id = r.receiver_id
      ORDER BY p.parcel_id;

      SELECT r.receiver_id, r.full_name AS receiver_name,
             p.parcel_id, p.tracking_id
      FROM dbo.receivers AS r
      LEFT OUTER JOIN dbo.parcels AS p ON r.receiver_id = p.receiver_id
      ORDER BY r.receiver_id, p.parcel_id;

      SELECT p.parcel_id, p.tracking_id,
             r.receiver_id, r.full_name AS receiver_name
      FROM dbo.parcels AS p
      RIGHT OUTER JOIN dbo.receivers AS r ON p.receiver_id = r.receiver_id
      ORDER BY r.receiver_id, p.parcel_id;

      SELECT p.parcel_id, p.tracking_id,
             r.receiver_id, r.full_name AS receiver_name
      FROM dbo.parcels AS p
      FULL OUTER JOIN dbo.receivers AS r ON p.receiver_id = r.receiver_id
      ORDER BY r.receiver_id, p.parcel_id;

      SELECT COUNT(*) AS total_parcels,
             COALESCE(SUM(charge), 0) AS total_charge,
             COALESCE(AVG(charge), 0) AS average_charge,
             COALESCE(MAX(charge), 0) AS highest_charge,
             COALESCE(MIN(charge), 0) AS lowest_charge
      FROM dbo.parcels;

      SELECT status, COUNT(*) AS total_parcels,
             SUM(charge) AS total_charge, AVG(charge) AS average_charge
      FROM dbo.parcels
      GROUP BY status
      HAVING COUNT(*) >= 1
      ORDER BY total_parcels DESC;

      SELECT parcel_id, tracking_id, parcel_type, charge
      FROM dbo.parcels
      WHERE charge > (SELECT AVG(charge) FROM dbo.parcels)
      ORDER BY charge DESC;

      SELECT r.receiver_id, r.full_name, r.phone
      FROM dbo.receivers AS r
      WHERE NOT EXISTS (
        SELECT 1 FROM dbo.parcels AS p
        WHERE p.receiver_id = r.receiver_id
      )
      ORDER BY r.receiver_id;
    `);

    const sets = result.recordsets;
    return res.status(200).json({
      message: 'Database checkpoint report retrieved successfully.',
      data: {
        innerJoin: sets[0],
        leftJoin: sets[1],
        rightJoin: sets[2],
        fullJoin: sets[3],
        aggregate: sets[4][0],
        groupedAggregate: sets[5],
        aboveAverageCharge: sets[6],
        receiversWithoutParcels: sets[7],
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getCheckpointReport };
