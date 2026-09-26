import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ExtraFeaturesPage.css';

function ResultTable({ columns, rows, emptyText }) {
  return (
    <div className="ef-table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map(([key, label]) => <th key={key}>{label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row, index) => (
            <tr key={index}>
              {columns.map(([key]) => <td key={key}>{row[key] ?? '-'}</td>)}
            </tr>
          )) : (
            <tr><td colSpan={columns.length}>{emptyText}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function ExtraFeaturesPage() {
  const [data, setData] = useState({ view_data: [], except_data: [] });
  const [statusRows, setStatusRows] = useState([]);
  const [status, setStatus] = useState('pending');
  const [transactionForm, setTransactionForm] = useState({
    sender_id: '1', receiver_id: '1', tracking_id: '', parcel_type: 'Documents',
    weight: '', charge: '', status: 'pending',
  });
  const [transactionResult, setTransactionResult] = useState(null);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadFeatures = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/extra-features/features');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Could not load advanced SQL features.');
      }

      setData({
        view_data: Array.isArray(result.view_data) ? result.view_data : [],
        except_data: Array.isArray(result.except_data) ? result.except_data : [],
      });

      const statusResponse = await fetch(`/api/extra-features/parcels-by-status?status=${encodeURIComponent(status)}`);
      const statusResult = await statusResponse.json();
      if (!statusResponse.ok) throw new Error(statusResult.message || 'Could not load status results.');
      setStatusRows(Array.isArray(statusResult.data) ? statusResult.data : []);
    } catch (err) {
      console.error('Failed to load advanced SQL features:', err);
      setError(err.message || 'Could not load advanced SQL features.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeatures();
  }, [status]);

  const updateTransactionField = ({ target }) => {
    setTransactionForm((current) => ({ ...current, [target.name]: target.value }));
  };

  const runTransaction = async (event) => {
    event.preventDefault();
    setTransactionLoading(true);
    setError('');
    setTransactionResult(null);
    try {
      const response = await fetch('/api/extra-features/transaction-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionForm),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Transaction failed.');
      setTransactionResult(result);
      await loadFeatures();
    } catch (transactionError) {
      setError(transactionError.message);
    } finally {
      setTransactionLoading(false);
    }
  };

  if (loading) {
    return <div className="ef-loading">Loading...</div>;
  }

  return (
    <main className="ef-page">
      <Link to="/" className="ef-back">&larr; Parcel page</Link>
      <header className="ef-header">
        <h1>Advanced Database Features</h1>
        <button type="button" onClick={loadFeatures} disabled={loading}>Refresh results</button>
      </header>

      {error && <p className="ef-error" role="alert">{error}</p>}

      <section className="ef-card">
        <span className="ef-tag">01 &middot; VIEW</span>
        <h2>Parcel summary view</h2>
        <p>Rows returned from <code>dbo.vw_parcel_summary</code>.</p>
        <ResultTable
          columns={[
            ['parcel_id', 'Parcel ID'], ['tracking_id', 'Tracking ID'],
            ['parcel_type', 'Type'], ['status', 'Status'], ['sender_name', 'Sender'],
          ]}
          rows={data.view_data}
          emptyText="No view rows found."
        />
        <p className="ef-count">{data.view_data.length} rows</p>
      </section>

      <section className="ef-card">
        <span className="ef-tag">02 &middot; EXCEPT</span>
        <h2>Users who have not sent parcels</h2>
        <p>Users present in the users table but absent from parcels.</p>
        <ResultTable columns={[['id', 'User ID']]} rows={data.except_data} emptyText="No except rows found." />
        <p className="ef-count">{data.except_data.length} rows</p>
      </section>

      <section className="ef-card">
        <span className="ef-tag">03 &middot; STORED PROCEDURE</span>
        <h2>Parcels by status</h2>
        <p>Results from <code>dbo.usp_GetParcelsByStatus</code>.</p>
        <label className="ef-control">
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="pending">Pending</option>
            <option value="picked_up">Picked up</option>
            <option value="in_transit">In transit</option>
            <option value="out_for_delivery">Out for delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <ResultTable columns={[
          ['parcel_id', 'Parcel ID'], ['tracking_id', 'Tracking ID'], ['parcel_type', 'Type'],
          ['weight', 'Weight'], ['charge', 'Charge'], ['status', 'Status'],
        ]} rows={statusRows} emptyText="No parcels match this status." />
        <p className="ef-count">{statusRows.length} rows</p>
      </section>

      <section className="ef-card">
        <span className="ef-tag">04 &middot; TRANSACTION + TRIGGER</span>
        <h2>Run transaction demo</h2>
        <p>Executes <code>dbo.usp_PerformTransactionDemo</code>; the insert trigger writes the audit log.</p>
        <form className="ef-form" onSubmit={runTransaction}>
          {[
            ['sender_id', 'Sender ID', 'number'], ['receiver_id', 'Receiver ID', 'number'],
            ['tracking_id', 'Tracking ID', 'text'], ['parcel_type', 'Parcel type', 'text'],
            ['weight', 'Weight', 'number'], ['charge', 'Charge', 'number'],
          ].map(([name, label, type]) => (
            <label key={name}>{label}
              <input name={name} type={type} value={transactionForm[name]} onChange={updateTransactionField} required />
            </label>
          ))}
          <label>Status
            <select name="status" value={transactionForm.status} onChange={updateTransactionField}>
              <option value="pending">Pending</option>
              <option value="picked_up">Picked up</option>
              <option value="in_transit">In transit</option>
              <option value="delivered">Delivered</option>
            </select>
          </label>
          <button type="submit" disabled={transactionLoading}>
            {transactionLoading ? 'Running...' : 'Run transaction'}
          </button>
        </form>
        {transactionResult && (
          <div className="ef-success">
            <strong>{transactionResult.message}</strong>
            <ResultTable columns={[['parcel_id', 'Created Parcel ID']]} rows={transactionResult.procedure_data || []} emptyText="Procedure completed; rerun the SQL script to return the created ID." />
            <ResultTable
              columns={[
                ['log_id', 'Audit Log ID'], ['parcel_id', 'Parcel ID'],
                ['action_message', 'Trigger Action'], ['action_time', 'Time'],
              ]}
              rows={transactionResult.audit_data || []}
              emptyText="No audit row was returned."
            />
          </div>
        )}
      </section>

    </main>
  );
}