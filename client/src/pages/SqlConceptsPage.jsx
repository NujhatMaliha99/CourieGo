import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './SqlConceptsPage.css';

function ResultTable({ columns, rows, emptyText }) {
  return <div className="sc-table-wrap">
    <table>
      <thead><tr>{columns.map(([key, label]) => <th key={key}>{label}</th>)}</tr></thead>
      <tbody>{rows.length ? rows.map((row, index) => <tr key={index}>
        {columns.map(([key]) => <td key={key}>{row[key] ?? '—'}</td>)}
      </tr>) : <tr><td colSpan={columns.length}>{emptyText}</td></tr>}</tbody>
    </table>
  </div>;
}

const personColumns = [['person_type', 'Type'], ['person_id', 'ID'], ['full_name', 'Name']];
const parcelColumns = [
  ['parcel_id', 'Parcel ID'], ['tracking_id', 'Tracking ID'],
  ['sender_name', 'Sender'], ['receiver_name', 'Receiver'],
  ['parcel_type', 'Type'], ['status', 'Status'], ['charge', 'Charge (BDT)'],
];

export default function SqlConceptsPage() {
  const [comparison, setComparison] = useState({ union: [], union_all: [] });
  const [views, setViews] = useState({ parcel_details: [], receiver_summary: [] });
  const [senders, setSenders] = useState([]);
  const [trackingId, setTrackingId] = useState('');
  const [searchRows, setSearchRows] = useState([]);
  const [senderId, setSenderId] = useState('');
  const [summaryRows, setSummaryRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState('');
  const [searchError, setSearchError] = useState('');
  const [summaryError, setSummaryError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const responses = await Promise.all([
        fetch('/api/sql-concepts/union'),
        fetch('/api/sql-concepts/views'),
        fetch('/api/parcels'),
        fetch('/api/senders'),
      ]);
      const payloads = await Promise.all(responses.map((response) => response.json()));
      if (responses.some((response) => !response.ok)) {
        throw new Error(payloads.find((_, index) => !responses[index].ok)?.message || 'Could not load SQL results.');
      }
      setComparison({ union: payloads[0].union || [], union_all: payloads[0].union_all || [] });
      setViews({ parcel_details: payloads[1].parcel_details || [], receiver_summary: payloads[1].receiver_summary || [] });
      const parcelRows = payloads[2].data || [];
      const senderRows = payloads[3].data || [];
      setSenders(senderRows);
      setSenderId((current) => senderRows.some((sender) => String(sender.user_id) === current)
        ? current : String(senderRows[0]?.user_id || ''));
      setTrackingId((current) => current || parcelRows[0]?.tracking_id || '');
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const searchParcel = async (event) => {
    event.preventDefault();
    setSearching(true);
    setSearchError('');
    setSearchRows([]);
    try {
      const response = await fetch(`/api/sql-concepts/procedures/search?tracking_id=${encodeURIComponent(trackingId.trim())}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Search failed.');
      setSearchRows(payload.data || []);
    } catch (searchFailure) {
      setSearchError(searchFailure.message);
    } finally {
      setSearching(false);
    }
  };

  const loadSenderSummary = async (event) => {
    event.preventDefault();
    setSummarizing(true);
    setSummaryError('');
    setSummaryRows([]);
    try {
      const response = await fetch(`/api/sql-concepts/procedures/sender-summary?sender_id=${encodeURIComponent(senderId)}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Summary failed.');
      setSummaryRows(payload.data || []);
    } catch (summaryFailure) {
      setSummaryError(summaryFailure.message);
    } finally {
      setSummarizing(false);
    }
  };

  return <main className="sc-page">
    <Link to="/" className="sc-back">← Parcel page</Link>
    <header className="sc-header">
      <h1>UNION, VIEW &amp; PROCEDURE</h1>
      <button type="button" onClick={loadData} disabled={loading}>Refresh results</button>
    </header>
    {error && <p className="sc-error" role="alert">{error}</p>}

    <section className="sc-card">
      <span className="sc-tag">01 · UNION</span>
      <h2>Unique sender and receiver rows</h2>
      <p>Repeated rows from parcel links are removed.</p>
      <ResultTable columns={personColumns} rows={comparison.union} emptyText={loading ? 'Loading…' : 'No people found.'} />
      <p className="sc-count">{comparison.union.length} rows</p>
    </section>

    <section className="sc-card">
      <span className="sc-tag">02 · UNION ALL</span>
      <h2>All sender and receiver rows</h2>
      <p>Repeated rows from parcel links remain visible.</p>
      <ResultTable columns={personColumns} rows={comparison.union_all} emptyText={loading ? 'Loading…' : 'No people found.'} />
      <p className="sc-count">{comparison.union_all.length} rows</p>
    </section>

    <section className="sc-card">
      <span className="sc-tag">03 · VIEW</span>
      <h2>Parcel details · dbo.vw_parcel_details</h2>
      <p>One saved view combines parcels with sender and receiver names.</p>
      <ResultTable columns={parcelColumns} rows={views.parcel_details} emptyText={loading ? 'Loading…' : 'No parcels found.'} />
    </section>

    <section className="sc-card">
      <span className="sc-tag">04 · VIEW</span>
      <h2>Receiver summary · dbo.vw_receiver_summary</h2>
      <p>Every receiver is listed, including those with zero parcels.</p>
      <ResultTable columns={[
        ['receiver_id', 'Receiver ID'], ['receiver_name', 'Receiver'],
        ['phone', 'Phone'], ['total_parcels', 'Total parcels'],
      ]} rows={views.receiver_summary} emptyText={loading ? 'Loading…' : 'No receivers found.'} />
    </section>

    <section className="sc-card">
      <span className="sc-tag">05 · PROCEDURE</span>
      <h2>Find parcel · dbo.usp_FindParcelByTrackingId</h2>
      <p>Enter a tracking ID. The backend passes it as a parameter to the SQL procedure.</p>
      <form className="sc-form" onSubmit={searchParcel}>
        <label>Tracking ID
          <input value={trackingId} onChange={(event) => setTrackingId(event.target.value)} maxLength="50" required />
        </label>
        <button type="submit" disabled={searching}>{searching ? 'Searching…' : 'Run search procedure'}</button>
      </form>
      {searchError && <p className="sc-error" role="alert">{searchError}</p>}
      <ResultTable columns={parcelColumns} rows={searchRows} emptyText="Run the procedure to see its result." />
    </section>

    <section className="sc-card">
      <span className="sc-tag">06 · PROCEDURE</span>
      <h2>Sender charge summary · dbo.usp_GetSenderChargeSummary</h2>
      <p>Select a sender to calculate their parcel count, total charge and average charge. This procedure only reads data.</p>
      <form className="sc-form" onSubmit={loadSenderSummary}>
        <label>Sender
          <select value={senderId} onChange={(event) => setSenderId(event.target.value)} required>
            <option value="">Select sender</option>
            {senders.map((sender) => <option key={sender.user_id} value={sender.user_id}>
              #{sender.user_id} · {sender.full_name}
            </option>)}
          </select>
        </label>
        <button type="submit" disabled={summarizing || !senderId}>{summarizing ? 'Calculating…' : 'Run summary procedure'}</button>
      </form>
      {summaryError && <p className="sc-error" role="alert">{summaryError}</p>}
      <ResultTable columns={[
        ['sender_id', 'Sender ID'], ['sender_name', 'Sender'], ['total_parcels', 'Parcels'],
        ['total_charge', 'Total charge (BDT)'], ['average_charge', 'Average charge (BDT)'],
      ]} rows={summaryRows} emptyText="Run the procedure to see this sender's summary." />
    </section>
  </main>;
}
