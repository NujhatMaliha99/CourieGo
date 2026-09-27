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
  const [data, setData] = useState({ view_data: [], except_data: [], overview_data: [] });
  const [statusRows, setStatusRows] = useState([]);
  const [status, setStatus] = useState('pending');
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
        overview_data: Array.isArray(result.overview_data) ? result.overview_data : [],
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
        <ResultTable columns={[[ 'id', 'User ID' ]]} rows={data.except_data} emptyText="No except rows found." />
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
        <span className="ef-tag">04 &middot; ADVANCED VIEW</span>
        <h2>Parcel delivery and payment overview</h2>
        <p>Rows from <code>dbo.vw_parcel_delivery_overview</code> combine parcel parties, latest tracking events, current assignments, and paid amounts to calculate each balance due.</p>
        <ResultTable
          columns={[
            ['parcel_id', 'Parcel ID'], ['tracking_id', 'Tracking ID'],
            ['parcel_type', 'Type'], ['parcel_status', 'Parcel Status'],
            ['sender_name', 'Sender'], ['receiver_name', 'Receiver'],
            ['latest_event', 'Latest Event'], ['last_known_location', 'Last Location'],
            ['last_event_at', 'Event Time'], ['agent_name', 'Latest Agent'],
            ['vehicle_number', 'Vehicle'], ['assignment_status', 'Assignment'],
            ['payment_count', 'Payments'], ['amount_paid', 'Paid'],
            ['balance_due', 'Balance Due'],
          ]}
          rows={data.overview_data}
          emptyText="No parcel overview rows found."
        />
        <p className="ef-count">{data.overview_data.length} rows</p>
      </section>

    </main>
  );
}