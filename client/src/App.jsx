import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ReceiverManagement from './pages/ReceiverManagement';
import SenderManagement from './pages/SenderManagement';

const emptyForm = {
  sender_id: 1,
  receiver_id: 1,
  tracking_id: '',
  parcel_type: 'Documents',
  weight: '',
  charge: '',
  status: 'pending',
};

function ParcelPage() {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [parcels, setParcels] = useState([]);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [editingParcel, setEditingParcel] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editMessage, setEditMessage] = useState('');
  const [senders, setSenders] = useState([]);
  const [receivers, setReceivers] = useState([]);

  // Read One (Search State)
  const [searchId, setSearchId] = useState('');
  const [singleParcel, setSingleParcel] = useState(null);
  const [searchMessage, setSearchMessage] = useState('');

  // Feature 1: Filter State
  const [statusFilter, setStatusFilter] = useState('all');

  // Analytics States (All 5 Queries)
  const [receiverSummary, setReceiverSummary] = useState([]);
  const [statusSummary, setStatusSummary] = useState([]);
  const [senderSummary, setSenderSummary] = useState([]);
  const [frequentReceivers, setFrequentReceivers] = useState([]);
  const [aboveAverageParcels, setAboveAverageParcels] = useState([]);

  const loadParcels = async () => {
    try {
      const response = await fetch('/api/parcels');
      const result = await response.json();
      setParcels(Array.isArray(result) ? result : result.data || []);
    } catch (error) {
      console.error('Error loading parcels:', error);
    }
  };

  const loadForeignKeyOptions = async () => {
    try {
      const [senderResponse, receiverResponse] = await Promise.all([
        fetch('/api/senders'),
        fetch('/api/receivers'),
      ]);

      const senderResult = await senderResponse.json();
      const receiverResult = await receiverResponse.json();

      const senderRows = senderResult.data || senderResult || [];
      const receiverRows = receiverResult.data || receiverResult || [];

      setSenders(senderRows);
      setReceivers(receiverRows);

      setForm((current) => ({
        ...current,
        sender_id: senderRows.some(
          (row) => String(row.user_id) === String(current.sender_id)
        )
          ? current.sender_id
          : senderRows[0]?.user_id || '',

        receiver_id: receiverRows.some(
          (row) => String(row.receiver_id) === String(current.receiver_id)
        )
          ? current.receiver_id
          : receiverRows[0]?.receiver_id || '',
      }));
    } catch {
      setMessage('Could not load sender or receiver list.');
    }
  };

  // Fetch Analytics Data (Updated for all 5 queries)
  const loadAnalytics = async () => {
    try {
      const [res1, res2, res3, res4, res5] = await Promise.all([
        fetch('/api/analytics/receiver-charge-summary'),
        fetch('/api/analytics/parcel-status-summary'),
        fetch('/api/analytics/sender-activity-summary'),
        fetch('/api/analytics/frequent-receivers'),
        fetch('/api/analytics/above-average-charge-parcels'),
      ]);

      const data1 = await res1.json();
      const data2 = await res2.json();
      const data3 = await res3.json();
      const data4 = await res4.json();
      const data5 = await res5.json();

      setReceiverSummary(Array.isArray(data1) ? data1 : data1.data || []);
      setStatusSummary(Array.isArray(data2) ? data2 : data2.data || []);
      setSenderSummary(Array.isArray(data3) ? data3 : data3.data || []);
      setFrequentReceivers(Array.isArray(data4) ? data4 : data4.data || []);
      setAboveAverageParcels(Array.isArray(data5) ? data5 : data5.data || []);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  useEffect(() => {
    loadParcels();
    loadForeignKeyOptions();
    loadAnalytics();
  }, []);

  const searchParcelById = async (event) => {
    event.preventDefault();
    setSingleParcel(null);
    setSearchMessage('');

    if (!searchId) return;

    try {
      const response = await fetch(`/api/parcels/${searchId}`);
      const result = await response.json();

      if (response.ok) {
        setSingleParcel(result.data || result);
      } else {
        setSearchMessage(result.message || 'Parcel not found.');
      }
    } catch (error) {
      setSearchMessage('Error searching parcel.');
    }
  };

  const change = ({ target }) =>
    setForm({ ...form, [target.name]: target.value });

  const startEdit = (parcel) => {
    setEditingParcel(parcel);

    setEditForm({
      sender_id: parcel.sender_id,
      receiver_id: parcel.receiver_id,
      tracking_id: parcel.tracking_id,
      parcel_type: parcel.parcel_type,
      weight: parcel.weight,
      charge: parcel.charge,
      status: parcel.status,
    });

    setEditMessage('');
  };

  const editChange = ({ target }) =>
    setEditForm({ ...editForm, [target.name]: target.value });

  const cancelEdit = () => {
    setEditingParcel(null);
    setEditForm(null);
    setEditMessage('');
  };

  const submitEdit = async (event) => {
    event.preventDefault();
    setEditSaving(true);

    try {
      const response = await fetch(
        `/api/parcels/${editingParcel.parcel_id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editForm),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setEditMessage(result.errors?.join(' ') || result.message);
        return;
      }

      cancelEdit();
      setMessage(`Parcel updated. ID: ${result.data?.parcel_id || editingParcel.parcel_id}`);

      await loadParcels();
      await loadAnalytics();
    } catch {
      setEditMessage('Could not update parcel in SQL Server.');
    } finally {
      setEditSaving(false);
    }
  };

  const createParcel = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/parcels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      setMessage(
        response.ok
          ? `Parcel created. ID: ${result.data?.parcel_id || result.data?.id}`
          : result.message
      );

      if (response.ok) {
        setForm((current) => ({
          ...emptyForm,
          sender_id: current.sender_id,
          receiver_id: current.receiver_id,
        }));

        await loadParcels();
        await loadAnalytics();
      }
    } catch (error) {
      setMessage('Failed to create parcel.');
    }

    setSaving(false);
  };

  const deleteParcel = async (parcelId) => {
    if (!window.confirm('Are you sure you want to delete this parcel?')) {
      return;
    }

    try {
      const response = await fetch(`/api/parcels/${parcelId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || 'Failed to delete parcel.');
        return;
      }

      setMessage('Parcel deleted successfully.');

      await loadParcels();
      await loadAnalytics();
    } catch {
      setMessage('Could not connect to the SQL Server backend.');
    }
  };

  const filteredParcels = parcels.filter(
    (p) => statusFilter === 'all' || p.status === statusFilter
  );

  return (
    <main>
      <header>
        <h1>CourieGo - Create Parcel</h1>
        <p>Add a new parcel to the courier database.</p>

        <Link to="/receivers">
          <button>Receiver Management</button>
        </Link>
        {' '}
        <Link to="/senders">
          <button>Sender Management</button>
        </Link>
      </header>

      <form onSubmit={createParcel}>
        <select
          name="sender_id"
          value={form.sender_id}
          onChange={change}
          required
        >
          <option value="">Select Sender</option>
          {senders.map((sender) => (
            <option key={sender.user_id} value={sender.user_id}>
              {sender.user_id} - {sender.full_name}
            </option>
          ))}
        </select>

        <select
          name="receiver_id"
          value={form.receiver_id}
          onChange={change}
          required
        >
          <option value="">Select Receiver</option>
          {receivers.map((receiver) => (
            <option
              key={receiver.receiver_id}
              value={receiver.receiver_id}
            >
              {receiver.receiver_id} - {receiver.full_name}
            </option>
          ))}
        </select>

        <input
          name="tracking_id"
          minLength="3"
          value={form.tracking_id}
          onChange={change}
          placeholder="Tracking ID"
          required
        />

        <input
          name="parcel_type"
          value={form.parcel_type}
          onChange={change}
          placeholder="Parcel type"
          required
        />

        <input
          name="weight"
          type="number"
          min="0.01"
          step="0.01"
          value={form.weight}
          onChange={change}
          placeholder="Weight"
          required
        />

        <input
          name="charge"
          type="number"
          min="0"
          step="0.01"
          value={form.charge}
          onChange={change}
          placeholder="Charge"
          required
        />

        <select
          name="status"
          value={form.status}
          onChange={change}
        >
          <option value="pending">Pending</option>
          <option value="picked_up">Picked up</option>
          <option value="in_transit">In transit</option>
          <option value="out_for_delivery">Out for delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button disabled={saving}>
          {saving ? 'Creating...' : 'Create Parcel'}
        </button>

        {message && <p className="message">{message}</p>}
      </form>

      {/* READ ONE (Search Box) */}
      <section
        className="search-section"
        style={{
          margin: '20px 0',
          padding: '15px',
          border: '1px solid #ccc',
          borderRadius: '5px',
        }}
      >
        <h3>Search Parcel by ID (Read One)</h3>

        <form
          onSubmit={searchParcelById}
          style={{
            display: 'flex',
            gap: '10px',
            marginTop: '10px',
          }}
        >
          <input
            type="number"
            placeholder="Enter Parcel ID (e.g. 1)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            required
          />

          <button type="submit">Search</button>
        </form>

        {singleParcel && (
          <div
            style={{
              marginTop: '10px',
              background: '#f0fdf4',
              padding: '10px',
              borderRadius: '4px',
            }}
          >
            <p>
              <strong>Parcel ID:</strong>{' '}
              {singleParcel.parcel_id || singleParcel.id} |{' '}
              <strong>Tracking:</strong>{' '}
              {singleParcel.tracking_id} |{' '}
              <strong>Type:</strong>{' '}
              {singleParcel.parcel_type} |{' '}
              <strong>Weight:</strong>{' '}
              {singleParcel.weight} kg |{' '}
              <strong>Charge:</strong>{' '}
              BDT {singleParcel.charge} |{' '}
              <strong>Status:</strong>{' '}
              {singleParcel.status?.replaceAll('_', ' ')}
            </p>
          </div>
        )}

        {searchMessage && (
          <p style={{ color: 'red', marginTop: '10px' }}>
            {searchMessage}
          </p>
        )}
      </section>

      {/* READ ALL (Table + Filter) */}
      <section>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2>Parcels</h2>

          <label>
            Filter:
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ marginLeft: '5px' }}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="picked_up">Picked up</option>
              <option value="in_transit">In transit</option>
              <option value="delivered">Delivered</option>
            </select>
          </label>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tracking ID</th>
                <th>Type</th>
                <th>Weight</th>
                <th>Charge</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredParcels.map((parcel, index) => (
                <tr
                  key={
                    parcel.parcel_id ||
                    parcel.id ||
                    index
                  }
                >
                  <td>
                    {parcel.parcel_id || parcel.id}
                  </td>
                  <td>{parcel.tracking_id}</td>
                  <td>{parcel.parcel_type}</td>
                  <td>{parcel.weight} kg</td>
                  <td>BDT {parcel.charge}</td>
                  <td>
                    {parcel.status?.replaceAll('_', ' ')}
                  </td>

                  <td className="actions">
                    <button
                      type="button"
                      className="view"
                      onClick={() =>
                        setSelectedParcel(parcel)
                      }
                    >
                      View
                    </button>

                    <button
                      type="button"
                      className="edit"
                      onClick={() => startEdit(parcel)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete"
                      onClick={() =>
                        deleteParcel(
                          parcel.parcel_id || parcel.id
                        )
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filteredParcels.length && (
          <p className="empty">No parcels found.</p>
        )}
      </section>

      {/* ANALYTICS & SQL REPORTS SECTION (All 5 Tables) */}
      <section style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #008080' }}>
        <h2 style={{ color: '#008080' }}>Analytics & Reports Summary</h2>

        {/* Table 1: Receiver Charge Summary (RIGHT JOIN) */}
        <div style={{ marginTop: '20px', marginBottom: '30px' }}>
          <h3>1. Receiver Spending Summary (RIGHT JOIN)</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Receiver ID</th>
                  <th>Receiver Name</th>
                  <th>Address</th>
                  <th>Total Parcels</th>
                  <th>Total Spent (BDT)</th>
                </tr>
              </thead>
              <tbody>
                {receiverSummary.map((item, idx) => (
                  <tr key={item.receiver_id || idx}>
                    <td>{item.receiver_id}</td>
                    <td>{item.receiver_name}</td>
                    <td>{item.receiver_address || 'N/A'}</td>
                    <td>{item.total_parcels_received}</td>
                    <td>BDT {item.total_charge_spent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!receiverSummary.length && <p className="empty">No summary available.</p>}
        </div>

        {/* Table 2: Status Breakdown (Aggregates) */}
        <div style={{ marginBottom: '30px' }}>
          <h3>2. Parcel Status Metrics Breakdown (Aggregates)</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Total Parcels</th>
                  <th>Average Charge</th>
                  <th>Max Weight</th>
                </tr>
              </thead>
              <tbody>
                {statusSummary.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ textTransform: 'capitalize' }}>{item.status?.replaceAll('_', ' ')}</td>
                    <td>{item.total_parcels}</td>
                    <td>BDT {Number(item.avg_charge || 0).toFixed(2)}</td>
                    <td>{item.max_weight} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!statusSummary.length && <p className="empty">No status metrics available.</p>}
        </div>

        {/* Table 3: Sender Activity Summary (INNER JOIN) */}
        <div style={{ marginBottom: '30px' }}>
          <h3>3. Sender Activity Summary (INNER JOIN)</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Sender ID</th>
                  <th>Sender Name</th>
                  <th>Total Sent Parcels</th>
                  <th>Total Revenue (BDT)</th>
                </tr>
              </thead>
              <tbody>
                {senderSummary.map((item, idx) => (
                  <tr key={item.sender_id || idx}>
                    <td>{item.sender_id}</td>
                    <td>{item.sender_name}</td>
                    <td>{item.total_sent_parcels}</td>
                    <td>BDT {item.total_revenue_generated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!senderSummary.length && <p className="empty">No sender metrics available.</p>}
        </div>

        {/* Table 4: Frequent Receivers (HAVING) */}
        <div style={{ marginBottom: '30px' }}>
          <h3>4. Frequent Receivers (HAVING Clause)</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Receiver ID</th>
                  <th>Receiver Name</th>
                  <th>Total Parcels Received</th>
                </tr>
              </thead>
              <tbody>
                {frequentReceivers.map((item, idx) => (
                  <tr key={item.receiver_id || idx}>
                    <td>{item.receiver_id}</td>
                    <td>{item.receiver_name}</td>
                    <td>{item.total_parcels}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!frequentReceivers.length && <p className="empty">No frequent receivers found.</p>}
        </div>

        {/* Table 5: Parcels Above Average Charge (Subquery) */}
        <div style={{ marginBottom: '30px' }}>
          <h3>5. Parcels Charged Above Average (Subquery)</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Parcel ID</th>
                  <th>Tracking ID</th>
                  <th>Type</th>
                  <th>Charge (BDT)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {aboveAverageParcels.map((item, idx) => (
                  <tr key={item.parcel_id || idx}>
                    <td>{item.parcel_id}</td>
                    <td>{item.tracking_id}</td>
                    <td>{item.parcel_type}</td>
                    <td>BDT {item.charge}</td>
                    <td style={{ textTransform: 'capitalize' }}>{item.status?.replaceAll('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!aboveAverageParcels.length && <p className="empty">No above average parcels found.</p>}
        </div>
      </section>

      {/* Modal / Overlay */}
      {selectedParcel && (
        <div
          className="overlay"
          onClick={() => setSelectedParcel(null)}
        >
          <article
            className="details"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="details-head">
              <h2>Parcel Details</h2>

              <button
                type="button"
                onClick={() =>
                  setSelectedParcel(null)
                }
              >
                X
              </button>
            </div>

            <dl>
              <div>
                <dt>Parcel ID</dt>
                <dd>
                  {selectedParcel.parcel_id ||
                    selectedParcel.id}
                </dd>
              </div>

              <div>
                <dt>Tracking ID</dt>
                <dd>{selectedParcel.tracking_id}</dd>
              </div>

              <div>
                <dt>Sender ID</dt>
                <dd>{selectedParcel.sender_id}</dd>
              </div>

              <div>
                <dt>Receiver ID</dt>
                <dd>{selectedParcel.receiver_id}</dd>
              </div>

              <div>
                <dt>Parcel Type</dt>
                <dd>{selectedParcel.parcel_type}</dd>
              </div>

              <div>
                <dt>Weight</dt>
                <dd>{selectedParcel.weight} kg</dd>
              </div>

              <div>
                <dt>Charge</dt>
                <dd>BDT {selectedParcel.charge}</dd>
              </div>

              <div>
                <dt>Status</dt>
                <dd>
                  {selectedParcel.status?.replaceAll(
                    '_',
                    ' '
                  )}
                </dd>
              </div>
            </dl>
          </article>
        </div>
      )}

      {editingParcel && editForm && (
        <div
          className="overlay"
          onClick={cancelEdit}
        >
          <article
            className="details"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="details-head">
              <h2>Edit Parcel</h2>

              <button
                type="button"
                onClick={cancelEdit}
              >
                X
              </button>
            </div>

            <form onSubmit={submitEdit}>
              <select
                name="sender_id"
                value={editForm.sender_id}
                onChange={editChange}
                required
              >
                {senders.map((sender) => (
                  <option
                    key={sender.user_id}
                    value={sender.user_id}
                  >
                    {sender.user_id} -{' '}
                    {sender.full_name}
                  </option>
                ))}
              </select>

              <select
                name="receiver_id"
                value={editForm.receiver_id}
                onChange={editChange}
                required
              >
                {receivers.map((receiver) => (
                  <option
                    key={receiver.receiver_id}
                    value={receiver.receiver_id}
                  >
                    {receiver.receiver_id} -{' '}
                    {receiver.full_name}
                  </option>
                ))}
              </select>

              <input
                name="tracking_id"
                minLength="3"
                value={editForm.tracking_id}
                onChange={editChange}
                required
              />

              <input
                name="parcel_type"
                value={editForm.parcel_type}
                onChange={editChange}
                required
              />

              <input
                name="weight"
                type="number"
                min="0.01"
                step="0.01"
                value={editForm.weight}
                onChange={editChange}
                required
              />

              <input
                name="charge"
                type="number"
                min="0"
                step="0.01"
                value={editForm.charge}
                onChange={editChange}
                required
              />

              <select
                name="status"
                value={editForm.status}
                onChange={editChange}
              >
                <option value="pending">Pending</option>
                <option value="picked_up">Picked up</option>
                <option value="in_transit">In transit</option>
                <option value="out_for_delivery">Out for delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {editMessage && (
                <p className="message">
                  {editMessage}
                </p>
              )}

              <button disabled={editSaving}>
                {editSaving
                  ? 'Updating...'
                  : 'Update Parcel'}
              </button>
            </form>
          </article>
        </div>
      )}
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<ParcelPage />}
        />

        <Route
          path="/receivers"
          element={<ReceiverManagement />}
        />

        <Route
          path="/senders"
          element={<SenderManagement />}
        />
      </Routes>
    </BrowserRouter>
  );
}