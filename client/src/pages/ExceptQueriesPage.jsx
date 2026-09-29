import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './Reports.css';

export default function ExceptQueriesPage() {
  const [data, setData] = useState({
    pureSenders: [],
    inactiveCustomers: [],
    idleAgents: [],
    unregisteredReceivers: [],
    sendersNeverReceived: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/except-queries/all');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch EXCEPT queries data from SQL Server.');
      }

      setData({
        pureSenders: result.pureSenders || [],
        inactiveCustomers: result.inactiveCustomers || [],
        idleAgents: result.idleAgents || [],
        unregisteredReceivers: result.unregisteredReceivers || [],
        sendersNeverReceived: result.sendersNeverReceived || [],
      });
    } catch (err) {
      setError(err.message || 'Could not connect to the backend server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="reports-page">
        <h1>SQL EXCEPT Queries</h1>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <header className="reports-header">
        <div>
          <h1>SQL EXCEPT Queries</h1>
          <p>Reports using SQL Server EXCEPT operator for set operations and data filtering.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button type="button" onClick={loadData}>
            Refresh
          </button>
          <Link to="/">
            <button type="button">Back to Parcel</button>
          </Link>
        </div>
      </header>

      {error && <p className="report-message">Database Error: {error}</p>}

      {/* QUERY 1 */}
      <section className="report-card">
        <h2>1. 100% Pure Senders</h2>
        <p style={{ color: '#607d8b', marginBottom: '16px' }}>
          Customers who are neither registered as Receivers nor as Delivery Agents in the system.
        </p>

        {data.pureSenders.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Phone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {data.pureSenders.map((row, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td><strong>{row.full_name}</strong></td>
                  <td>{row.phone || '—'}</td>
                  <td>{row.email || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#78909c' }}>No pure senders found matching criteria.</p>
        )}
      </section>

      {/* QUERY 2 */}
      <section className="report-card">
        <h2>2. Inactive Registered Customers</h2>
        <p style={{ color: '#607d8b', marginBottom: '16px' }}>
          Users who registered as customers in the system but have never created or sent any parcel.
        </p>

        {data.inactiveCustomers.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {data.inactiveCustomers.map((row, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td><strong>{row.full_name}</strong></td>
                  <td>{row.email || '—'}</td>
                  <td>{row.phone || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#78909c' }}>All registered customers have active parcel shipments.</p>
        )}
      </section>

      {/* QUERY 3 */}
      <section className="report-card">
        <h2>3. Idle Delivery Agents</h2>
        <p style={{ color: '#607d8b', marginBottom: '16px' }}>
          Delivery agents who currently have no active or historical parcel assignments.
        </p>

        {data.idleAgents.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Phone</th>
                <th>Availability Status</th>
              </tr>
            </thead>
            <tbody>
              {data.idleAgents.map((row, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td><strong>{row.full_name}</strong></td>
                  <td>{row.phone || '—'}</td>
                  <td>
                    <span style={{ textTransform: 'capitalize' }}>
                      {row.availability_status || 'available'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#78909c' }}>All delivery agents currently have parcel assignments.</p>
        )}
      </section>

      {/* QUERY 4 */}
      <section className="report-card">
        <h2>4. Unregistered Receivers</h2>
        <p style={{ color: '#607d8b', marginBottom: '16px' }}>
          Parcel receivers recorded in parcel deliveries who do not have a registered user account.
        </p>

        {data.unregisteredReceivers.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Phone</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {data.unregisteredReceivers.map((row, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td><strong>{row.full_name}</strong></td>
                  <td>{row.phone || '—'}</td>
                  <td>{row.address || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#78909c' }}>No unregistered receivers found.</p>
        )}
      </section>

      {/* QUERY 5 */}
      <section className="report-card">
        <h2>5. Pure Senders vs Receivers</h2>
        <p style={{ color: '#607d8b', marginBottom: '16px' }}>
          Registered customers who have sent parcels but have never received any parcel as a recipient.
        </p>

        {data.sendersNeverReceived.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Phone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {data.sendersNeverReceived.map((row, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td><strong>{row.full_name}</strong></td>
                  <td>{row.phone || '—'}</td>
                  <td>{row.email || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#78909c' }}>No senders found who match this criteria.</p>
        )}
      </section>
    </div>
  );
}
