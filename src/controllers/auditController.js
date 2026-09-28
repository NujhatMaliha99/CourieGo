const { sql, poolPromise } = require('../config/database');


exports.getAuditLogs = async (req, res) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    const conditions = [];

    if (req.query.entity) {
      request.input('entity', sql.VarChar(50), req.query.entity);
      conditions.push('entity_type = @entity');
    }
    if (req.query.action) {
      request.input('action', sql.VarChar(10), req.query.action.toUpperCase());
      conditions.push('action_type = @action');
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    request.input('limit', sql.Int, limit);

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await request.query(`
      SELECT TOP (@limit) audit_id, entity_type, record_id, action_type, details, changed_at
      FROM dbo.audit_log
      ${where}
      ORDER BY changed_at DESC, audit_id DESC
    `);

    res.json({ data: result.recordset });
  } catch (err) {
    console.error('Audit log error:', err);   // ager code-e error hide hocchilo
    res.status(500).json({ message: 'Could not load activity log.' });
  }
};