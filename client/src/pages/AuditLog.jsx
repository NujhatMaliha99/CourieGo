import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ReceiverManagement.css";

const ENTITIES = ["", "customer", "receiver", "delivery_agent"]; // "customer" = roles table-er name-er sathe mill rakho

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [entity, setEntity] = useState("");
  const [message, setMessage] = useState("");

  const loadLogs = async () => {
    try {
      const url = entity ? `/api/audit-logs?entity=${entity}` : "/api/audit-logs";
      const response = await fetch(url);
      const result = await response.json();
      if (!response.ok) { setMessage(result.message); return; }
      setLogs(result.data || []);
      setMessage("");
    } catch {
      setMessage("Could not connect to the backend.");
    }
  };

  useEffect(() => { loadLogs(); }, [entity]);

  return (
    <div className="receiver-page">
      <header>
        <div><h1>Activity Log</h1><p>Latest changes recorded by database triggers.</p></div>
        <div>
          <Link to="/"><button>Back to Parcel</button></Link>
          <button onClick={loadLogs}>Refresh</button>
        </div>
      </header>

      <div className="card">
        {message && <p className="receiver-message">{message}</p>}
        <select value={entity} onChange={(e) => setEntity(e.target.value)}>
          {ENTITIES.map((x) => <option key={x} value={x}>{x || "All"}</option>)}
        </select>

        {logs.length === 0 ? <p className="empty">No activity found.</p> : (
          <table>
            <thead>
              <tr><th>ID</th><th>Entity</th><th>Record ID</th><th>Action</th><th>Details</th><th>Time</th></tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.audit_id}>
                  <td>{l.audit_id}</td>
                  <td>{l.entity_type}</td>
                  <td>{l.record_id}</td>
                  <td>{l.action_type}</td>
                  <td>{l.details}</td>
                  <td>{new Date(l.changed_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}