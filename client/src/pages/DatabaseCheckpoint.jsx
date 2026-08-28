import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ReceiverManagement.css';

function ResultTable({ title, rows }) {
  const columns = rows.length ? Object.keys(rows[0]) : [];
  return (
    <section className="card" style={{ marginBottom: 20 }}>
      <h2>{title}</h2>
      {!rows.length ? <p className="empty">No matching data.</p> : (
        <div className="table-wrap">
          <table>
            <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
            <tbody>{rows.map((row, index) => (
              <tr key={index}>{columns.map((column) => <td key={column}>{row[column] ?? 'NULL'}</td>)}</tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function DatabaseCheckpoint() {
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState('');

  const loadReport = async () => {
    setMessage('Loading live SQL Server data...');
    try {
      const response = await fetch('/api/reports/checkpoint');
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setReport(result.data);
      setMessage('Live results loaded from SQL Server.');
    } catch (error) {
      setMessage(error.message || 'Could not load checkpoint report.');
    }
  };

  useEffect(() => { loadReport(); }, []);

  const aggregateRows = report?.aggregate ? [report.aggregate] : [];

  return (
    <div className="receiver-page">
      <header>
        <div><h1>Database Checkpoint</h1><p>JOIN, aggregate and subquery results from frontend-created data.</p></div>
        <div><Link to="/"><button>Back to Parcel</button></Link><button onClick={loadReport}>Refresh Results</button></div>
      </header>
      {message && <p className="receiver-message">{message}</p>}
      {report && <>
        <ResultTable title="INNER JOIN: Parcel + Sender + Receiver" rows={report.innerJoin} />
        <ResultTable title="LEFT OUTER JOIN" rows={report.leftJoin} />
        <ResultTable title="RIGHT OUTER JOIN" rows={report.rightJoin} />
        <ResultTable title="FULL OUTER JOIN" rows={report.fullJoin} />
        <ResultTable title="Aggregate Functions" rows={aggregateRows} />
        <ResultTable title="GROUP BY and HAVING" rows={report.groupedAggregate} />
        <ResultTable title="Subquery: Charge Above Average" rows={report.aboveAverageCharge} />
        <ResultTable title="Subquery: Receivers Without Parcels" rows={report.receiversWithoutParcels} />
      </>}
    </div>
  );
}
