const { executeQuery } = require('../config/database');

// Query 1: RIGHT JOIN - Receiver Spending Summary
exports.getReceiverChargeSummary = async (req, res) => {
  try {
    const query = `
      SELECT 
        r.receiver_id,
        r.full_name AS receiver_name,
        r.address AS receiver_address,
        COUNT(p.parcel_id) AS total_parcels_received,
        ISNULL(SUM(p.charge), 0) AS total_charge_spent
      FROM dbo.parcels p
      RIGHT JOIN dbo.receivers r ON p.receiver_id = r.receiver_id
      GROUP BY r.receiver_id, r.full_name, r.address
      ORDER BY ISNULL(SUM(p.charge), 0) DESC;
    `;
    const result = await executeQuery(query);
    const dataRows = Array.isArray(result) ? result : (result.recordset || []);
    res.status(200).json({ success: true, data: dataRows });
  } catch (error) {
    console.error("Error in getReceiverChargeSummary:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Query 2: GROUP BY & Aggregates - Parcel Status Summary
exports.getParcelStatusSummary = async (req, res) => {
  try {
    const query = `
      SELECT 
        status,
        COUNT(parcel_id) AS total_parcels,
        AVG(charge) AS avg_charge,
        MAX(weight) AS max_weight
      FROM dbo.parcels
      GROUP BY status;
    `;
    const result = await executeQuery(query);
    const dataRows = Array.isArray(result) ? result : (result.recordset || []);
    res.status(200).json({ success: true, data: dataRows });
  } catch (error) {
    console.error("Error in getParcelStatusSummary:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Query 3: INNER JOIN - Sender Activity Metrics (Fixed: Used dbo.users instead of Senders)
exports.getSenderActivitySummary = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.user_id AS sender_id,
        u.full_name AS sender_name,
        COUNT(p.parcel_id) AS total_sent_parcels,
        ISNULL(SUM(p.charge), 0) AS total_revenue_generated
      FROM dbo.users u
      INNER JOIN dbo.parcels p ON u.user_id = p.sender_id
      GROUP BY u.user_id, u.full_name
      ORDER BY COUNT(p.parcel_id) DESC;
    `;
    const result = await executeQuery(query);
    const dataRows = Array.isArray(result) ? result : (result.recordset || []);
    res.status(200).json({ success: true, data: dataRows });
  } catch (error) {
    console.error("Error in getSenderActivitySummary:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Query 4: HAVING Clause - Frequent Receivers
exports.getFrequentReceivers = async (req, res) => {
  try {
    const query = `
      SELECT 
        r.receiver_id,
        r.full_name AS receiver_name,
        COUNT(p.parcel_id) AS total_parcels
      FROM dbo.receivers r
      JOIN dbo.parcels p ON r.receiver_id = p.receiver_id
      GROUP BY r.receiver_id, r.full_name
      HAVING COUNT(p.parcel_id) >= 1;
    `;
    const result = await executeQuery(query);
    const dataRows = Array.isArray(result) ? result : (result.recordset || []);
    res.status(200).json({ success: true, data: dataRows });
  } catch (error) {
    console.error("Error in getFrequentReceivers:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Query 5: Subquery - Parcels Charged Above Overall Average
exports.getAboveAverageChargeParcels = async (req, res) => {
  try {
    const query = `
      SELECT 
        parcel_id,
        tracking_id,
        parcel_type,
        charge,
        status
      FROM dbo.parcels
      WHERE charge >= (SELECT AVG(charge) FROM dbo.parcels)
      ORDER BY charge DESC;
    `;
    const result = await executeQuery(query);
    const dataRows = Array.isArray(result) ? result : (result.recordset || []);
    res.status(200).json({ success: true, data: dataRows });
  } catch (error) {
    console.error("Error in getAboveAverageChargeParcels:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};