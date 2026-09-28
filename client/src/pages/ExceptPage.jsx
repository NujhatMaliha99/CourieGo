import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './SqlConceptsPage.css';

export default function ExceptPage() {
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
      const response = await fetch('/api/except/all');
      const payload = await response.json();
      
      if (!response.ok) {
        throw new Error(payload.message || 'Could not load EXCEPT results.');
      }
      
      setData({
        pureSenders: payload.pureSenders || [],
        inactiveCustomers: payload.inactiveCustomers || [],
        idleAgents: payload.idleAgents || [],
        unregisteredReceivers: payload.unregisteredReceivers || [],
        sendersNeverReceived: payload.sendersNeverReceived || [],
      });
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <main className="sc-page">
      <Link to="/" className="sc-back">← Parcel page</Link>
      <header className="sc-header">
        <h1>SQL EXCEPT Queries (Difference Operations)</h1>
        <button type="button" onClick={loadData} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh All Results'}
        </button>
      </header>

      {error && <p className="sc-error" role="alert">{error}</p>}

      {/* Query 1 */}
      <section className="sc-card">
        <span className="sc-tag">EXCEPT · Query 1</span>
        <h2>1. 100% Pure Senders</h2>
        <p>Finds registered customers who have ONLY sent parcels — they have never been a receiver nor a delivery agent.</p>
        
        <div className="sc-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone Number</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {data.pureSenders.length ? data.pureSenders.map((row, index) => (
                <tr key={index}>
                  <td>{row.full_name || '—'}</td>
                  <td>{row.phone || '—'}</td>
                  <td>{row.email || '—'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3}>{loading ? 'Loading...' : 'No records found.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="sc-count">{data.pureSenders.length} pure sender(s) found</p>
      </section>

      {/* Query 2 */}
      <section className="sc-card">
        <span className="sc-tag">EXCEPT · Query 2</span>
        <h2>2. Inactive Registered Customers</h2>
        <p>Finds customers who registered an account on the platform but have NEVER sent a single parcel yet.</p>
        
        <div className="sc-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Phone Number</th>
              </tr>
            </thead>
            <tbody>
              {data.inactiveCustomers.length ? data.inactiveCustomers.map((row, index) => (
                <tr key={index}>
                  <td>{row.full_name || '—'}</td>
                  <td>{row.email || '—'}</td>
                  <td>{row.phone || '—'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3}>{loading ? 'Loading...' : 'No inactive customers found.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="sc-count">{data.inactiveCustomers.length} inactive customer(s) found</p>
      </section>

      {/* Query 3 */}
      <section className="sc-card">
        <span className="sc-tag">EXCEPT · Query 3</span>
        <h2>3. Idle Delivery Agents</h2>
        <p>Finds delivery agents in the system who currently have ZERO parcel delivery assignments.</p>
        
        <div className="sc-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Agent Name</th>
                <th>Phone Number</th>
                <th>Availability Status</th>
              </tr>
            </thead>
            <tbody>
              {data.idleAgents.length ? data.idleAgents.map((row, index) => (
                <tr key={index}>
                  <td>{row.full_name || '—'}</td>
                  <td>{row.phone || '—'}</td>
                  <td>{row.availability_status || '—'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3}>{loading ? 'Loading...' : 'No idle agents found.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="sc-count">{data.idleAgents.length} idle delivery agent(s) found</p>
      </section>

      {/* Query 4 */}
      <section className="sc-card">
        <span className="sc-tag">EXCEPT · Query 4</span>
        <h2>4. Unregistered Receivers</h2>
        <p>Finds parcel receivers who received packages but do NOT have a registered user account in the system.</p>
        
        <div className="sc-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Receiver Name</th>
                <th>Phone Number</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {data.unregisteredReceivers.length ? data.unregisteredReceivers.map((row, index) => (
                <tr key={index}>
                  <td>{row.full_name || '—'}</td>
                  <td>{row.phone || '—'}</td>
                  <td>{row.address || '—'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3}>{loading ? 'Loading...' : 'No unregistered receivers found.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="sc-count">{data.unregisteredReceivers.length} unregistered receiver(s) found</p>
      </section>

      {/* Query 5 */}
      <section className="sc-card">
        <span className="sc-tag">EXCEPT · Query 5</span>
        <h2>5. Active Senders Who Never Received a Parcel</h2>
        <p>Finds users who have sent at least one parcel, but have NEVER been a receiver of any parcel.</p>
        
        <div className="sc-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sender Name</th>
                <th>Phone Number</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {data.sendersNeverReceived.length ? data.sendersNeverReceived.map((row, index) => (
                <tr key={index}>
                  <td>{row.full_name || '—'}</td>
                  <td>{row.phone || '—'}</td>
                  <td>{row.email || '—'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3}>{loading ? 'Loading...' : 'No matching senders found.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="sc-count">{data.sendersNeverReceived.length} sender(s) found</p>
      </section>
    </main>
  );
}

