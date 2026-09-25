const { sql, poolPromise } = require('../config/database');

async function getUnionComparison(req, res, next) {
  const senderRows = `
    SELECT s.user_id AS person_id, s.full_name, 'Sender' AS person_type
    FROM dbo.users AS s
    INNER JOIN dbo.roles AS role ON s.role_id = role.role_id
    LEFT JOIN dbo.parcels AS p ON p.sender_id = s.user_id
    WHERE role.role_name = 'customer'
  `;
  const receiverRows = `
    SELECT r.receiver_id AS person_id, r.full_name, 'Receiver' AS person_type
    FROM dbo.receivers AS r
    LEFT JOIN dbo.parcels AS p ON p.receiver_id = r.receiver_id
  `;

  try {
    const pool = await poolPromise;
    const [distinctResult, allResult] = await Promise.all([
      pool.request().query(`${senderRows} UNION ${receiverRows} ORDER BY person_type, full_name;`),
      pool.request().query(`${senderRows} UNION ALL ${receiverRows} ORDER BY person_type, full_name;`),
    ]);
    res.json({ union: distinctResult.recordset, union_all: allResult.recordset });
  } catch (error) {
    next(error);
  }
}

async function getViews(req, res, next) {
  try {
    const pool = await poolPromise;
    const [parcelDetails, receiverSummary] = await Promise.all([
      pool.request().query('SELECT * FROM dbo.vw_parcel_details ORDER BY parcel_id DESC;'),
      pool.request().query('SELECT * FROM dbo.vw_receiver_summary ORDER BY receiver_id;'),
    ]);
    res.json({ parcel_details: parcelDetails.recordset, receiver_summary: receiverSummary.recordset });
  } catch (error) {
    next(error);
  }
}

async function findParcelByTrackingId(req, res, next) {
  const trackingId = typeof req.query.tracking_id === 'string' ? req.query.tracking_id.trim() : '';
  if (!trackingId || trackingId.length > 50) {
    return res.status(400).json({ message: 'Enter a tracking ID of at most 50 characters.' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('tracking_id', sql.VarChar(50), trackingId)
      .execute('dbo.usp_FindParcelByTrackingId');
    res.json({ data: result.recordset });
  } catch (error) {
    next(error);
  }
}

async function getSenderChargeSummary(req, res, next) {
  const senderId = Number(req.query?.sender_id);
  if (!Number.isInteger(senderId) || senderId <= 0 || senderId > 2147483647) {
    return res.status(400).json({ message: 'Choose a valid sender.' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('sender_id', sql.Int, senderId)
      .execute('dbo.usp_GetSenderChargeSummary');
    res.json({ data: result.recordset });
  } catch (error) {
    next(error);
  }
}

module.exports = { getUnionComparison, getViews, findParcelByTrackingId, getSenderChargeSummary };
