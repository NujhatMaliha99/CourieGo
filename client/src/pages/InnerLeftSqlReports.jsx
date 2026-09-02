import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './InnerLeftSqlReports.css';

const queries = [
  {
    key: 'innerJoin',
    title: '1. INNER JOIN',
    question: 'Display parcel information with matching sender and receiver details.',
    endpoint: '/api/sql-queries/inner-join',
    columns: [
      ['parcel_id', 'Parcel ID'],
      ['tracking_id', 'Tracking ID'],
      ['sender_name', 'Sender'],
      ['receiver_name', 'Receiver'],
      ['parcel_type', 'Type'],
      ['charge', 'Charge'],
      ['status', 'Status'],
    ],
  },
  {
    key: 'leftJoin',
    title: '2. LEFT OUTER JOIN',
    question: 'Display every receiver, including receivers who have no parcel.',
    endpoint: '/api/sql-queries/left-join',
    columns: [
      ['receiver_id', 'Receiver ID'],
      ['receiver_name', 'Receiver'],
      ['receiver_phone', 'Phone'],
      ['parcel_id', 'Parcel ID'],
      ['tracking_id', 'Tracking ID'],
      ['status', 'Status'],
    ],
  },
  {
    key: 'receiverCounts',
    title: '3. AGGREGATE COUNT',
    question: 'Count parcels per receiver and display receivers with at least one parcel.',
    endpoint: '/api/sql-queries/receiver-counts',
    columns: [
      ['receiver_id', 'Receiver ID'],
      ['receiver_name', 'Receiver'],
      ['total_parcels', 'Total Parcels'],
    ],
  },
  {
    key: 'aboveAverageCharge',
    title: '4. AVERAGE-CHARGE SUBQUERY',
    question: 'Display parcels whose charge is greater than the average parcel charge.',
    endpoint: '/api/sql-queries/above-average-charge',
    columns: [
      ['parcel_id', 'Parcel ID'],
      ['tracking_id', 'Tracking ID'],
      ['parcel_type', 'Type'],
      ['charge', 'Charge'],
    ],
  },
  {
    key: 'noPendingReceivers',
    title: '5. NOT EXISTS SUBQUERY',
    question: 'Display receivers who have no parcel with a pending status.',
    endpoint: '/api/sql-queries/no-pending-receivers',
    columns: [
      ['receiver_id', 'Receiver ID'],
      ['receiver_name', 'Receiver'],
      ['phone', 'Phone'],
      ['address', 'Address'],
    ],
  },
];

function formatValue(value, column) {
  if (value === null || value === undefined || value === '') return '—';
  if (column === 'charge') return `BDT ${value}`;
  if (column === 'status') return String(value).replaceAll('_', ' ');
  return value;
}

export default function InnerLeftSqlReports() {
  const [results, setResults] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const loadQueries = useCallback(async () => {
    setLoading(true);
    setErrors({});

    const responses = await Promise.all(
      queries.map(async (query) => {
        try {
          const response = await fetch(query.endpoint);
          const payload = await response.json();

          if (!response.ok) {
            throw new Error(payload.message || 'Query could not be loaded.');
          }

          return { key: query.key, rows: payload.data || [] };
        } catch (error) {
          return { key: query.key, error: error.message };
        }
      })
    );

    const nextResults = {};
    const nextErrors = {};

    responses.forEach((response) => {
      if (response.error) nextErrors[response.key] = response.error;
      else nextResults[response.key] = response.rows;
    });

    setResults(nextResults);
    setErrors(nextErrors);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadQueries();
  }, [loadQueries]);

  return (
    <main className="inner-left-sql-page">
      <header className="inner-left-sql-header">
        <div>
          <p className="sql-eyebrow">10_inner_left_join.sql</p>
          <h1>SQL Query Results</h1>
          <p>These tables are loaded through separate backend APIs that execute your five SQL queries.</p>
        </div>

        <div className="sql-page-actions">
          <Link to="/">
            <button type="button" className="sql-secondary">Back to Parcels</button>
          </Link>
          <button type="button" onClick={loadQueries} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh Queries'}
          </button>
        </div>
      </header>

      {queries.map((query) => {
        const rows = results[query.key] || [];

        return (
          <section className="inner-left-query-card" key={query.key}>
            <div className="inner-left-query-heading">
              <div>
                <h2>{query.title}</h2>
                <p>{query.question}</p>
              </div>
              <span>{loading ? '…' : `${rows.length} row${rows.length === 1 ? '' : 's'}`}</span>
            </div>

            {errors[query.key] ? (
              <p className="sql-query-error">{errors[query.key]}</p>
            ) : !loading && rows.length === 0 ? (
              <p className="sql-query-empty">The query ran successfully but returned no rows.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      {query.columns.map(([column, label]) => (
                        <th key={column}>{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={`${query.key}-${row.parcel_id || row.receiver_id || index}-${index}`}>
                        {query.columns.map(([column]) => (
                          <td key={column}>{formatValue(row[column], column)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}
    </main>
  );
}
