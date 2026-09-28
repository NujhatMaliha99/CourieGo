import { useEffect, useState } from 'react';

export default function IntersectionTransaction() {
  const [data, setData] = useState({
    intersection1: [],
    intersection2: [],
    transaction: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/intersection-transaction'
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              'Failed to load Intersection & Transaction data.'
          );
        }

        setData({
          intersection1: result.intersection1 || [],
          intersection2: result.intersection2 || [],
          transaction: result.transaction || [],
        });
      } catch (err) {
        setError(
          err.message || 'Could not connect to the backend.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>
            Intersection & Transaction
          </h1>
          <p>Loading query results...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>
            Intersection & Transaction
          </h1>

          <div style={styles.error}>
            <strong>Error:</strong> {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>
          Intersection & Transaction
        </h1>

        

        {/* QUERY 1 */}
        <section style={styles.card}>
          <span style={styles.badge}>QUERY 01</span>

          <h2 style={styles.cardTitle}>
            Users ∩ Receivers
          </h2>

          <p style={styles.description}>
            Names that exist in both users and receivers.
          </p>

          <QueryTable
            rows={data.intersection1}
            columns={[
              {
                key: 'full_name',
                label: 'Full Name',
              },
            ]}
            emptyText="No matching records found."
          />
        </section>

        {/* QUERY 2 */}
        <section style={styles.card}>
          <span style={styles.badge}>QUERY 02</span>

          <h2 style={styles.cardTitle}>
            Users ∩ Delivery Agents
          </h2>

          <p style={styles.description}>
            Names that exist in both users and delivery_agents.
          </p>

          <QueryTable
            rows={data.intersection2}
            columns={[
              {
                key: 'full_name',
                label: 'Full Name',
              },
            ]}
            emptyText="No matching records found."
          />
        </section>

        {/* QUERY 3 */}
        <section style={styles.card}>
          <span style={styles.badge}>QUERY 03</span>

          <h2 style={styles.cardTitle}>
            Transaction Result
          </h2>

          <p style={styles.description}>
            Transaction result after updating the first pending
            parcel to in_transit.
          </p>

          <QueryTable
            rows={data.transaction}
            columns={[
              { key: 'parcel_id', label: 'Parcel ID' },
              { key: 'tracking_id', label: 'Tracking ID' },
              { key: 'sender_id', label: 'Sender ID' },
              { key: 'receiver_id', label: 'Receiver ID' },
              { key: 'parcel_type', label: 'Parcel Type' },
              { key: 'weight', label: 'Weight' },
              { key: 'charge', label: 'Charge' },
              { key: 'status', label: 'Status' },
              { key: 'created_at', label: 'Created At' },
              { key: 'updated_at', label: 'Updated At' },
            ]}
            emptyText="No transaction result found."
          />
        </section>
      </div>
    </main>
  );
}

function QueryTable({ rows, columns, emptyText }) {
  if (!rows.length) {
    return (
      <div style={styles.empty}>
        {emptyText}
      </div>
    );
  }

  return (
    <div style={styles.tableWrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={styles.th}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={row.parcel_id || index}>
              {columns.map((column) => (
                <td key={column.key} style={styles.td}>
                  {formatValue(
                    row[column.key],
                    column.key
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatValue(value, key) {
  if (value === null || value === undefined) {
    return '-';
  }

  if (
    (key === 'created_at' || key === 'updated_at') &&
    value
  ) {
    return new Date(value).toLocaleString();
  }

  return String(value).replaceAll('_', ' ');
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f7fb',
    padding: '40px 24px',
  },

  container: {
    maxWidth: '1250px',
    margin: '0 auto',
  },

  title: {
    margin: 0,
    fontSize: '32px',
    fontWeight: '800',
    color: '#151528',
  },

  subtitle: {
    margin: '8px 0 28px',
    color: '#687083',
  },

  card: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '18px',
    padding: '24px',
    marginBottom: '22px',
    boxShadow: '0 8px 25px rgba(15, 23, 42, 0.05)',
  },

  badge: {
    display: 'inline-block',
    background: '#eeeeff',
    color: '#0e00a6',
    padding: '6px 10px',
    borderRadius: '7px',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '1px',
  },

  cardTitle: {
    margin: '12px 0 5px',
    fontSize: '22px',
    color: '#17172a',
  },

  description: {
    margin: '0 0 18px',
    color: '#687083',
    fontSize: '14px',
  },

  tableWrap: {
    width: '100%',
    overflowX: 'auto',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '650px',
  },

  th: {
    textAlign: 'left',
    padding: '13px 14px',
    background: '#f8f9fc',
    borderBottom: '1px solid #e5e7eb',
    color: '#303548',
    fontSize: '13px',
    whiteSpace: 'nowrap',
  },

  td: {
    padding: '13px 14px',
    borderBottom: '1px solid #eef0f4',
    color: '#4b5565',
    fontSize: '13px',
    whiteSpace: 'nowrap',
  },

  empty: {
    padding: '20px',
    background: '#f8f9fc',
    borderRadius: '10px',
    color: '#687083',
    textAlign: 'center',
  },

  error: {
    marginTop: '20px',
    padding: '16px',
    background: '#fff1f2',
    border: '1px solid #fecdd3',
    borderRadius: '12px',
    color: '#b42318',
  },
};