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
      const senderRows = senderResult.data || [];
      const receiverRows = receiverResult.data || [];
      setSenders(senderRows);
      setReceivers(receiverRows);
      setForm((current) => ({
        ...current,
        sender_id: senderRows.some((row) => String(row.user_id) === String(current.sender_id)) ? current.sender_id : senderRows[0]?.user_id || '',
        receiver_id: receiverRows.some((row) => String(row.receiver_id) === String(current.receiver_id)) ? current.receiver_id : receiverRows[0]?.receiver_id || '',
      }));
    } catch {
      setMessage('Could not load sender or receiver list.');
    }
  };

  useEffect(() => {
    loadParcels();
    loadForeignKeyOptions();
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
      const response = await fetch(`/api/parcels/${editingParcel.parcel_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const result = await response.json();
      if (!response.ok) {
        setEditMessage(result.errors?.join(' ') || result.message);
        return;
      }
      cancelEdit();
      setMessage(`Parcel updated. ID: ${result.data.parcel_id}`);
      await loadParcels();
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
        setForm((current) => ({ ...emptyForm, sender_id: current.sender_id, receiver_id: current.receiver_id }));
        await loadParcels();
      }
    } catch (error) {
      setMessage('Failed to create parcel.');
    }
    setSaving(false);
  };

  // Feature 1: Filter Logic
  const filteredParcels = parcels.filter(
    (p) => statusFilter === 'all' || p.status === statusFilter
  );
  const placeholder = (action) => setMessage(`${action} is not connected yet.`);

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
          {senders.map((sender) => <option key={sender.user_id} value={sender.user_id}>{sender.user_id} - {sender.full_name}</option>)}
        </select>

        <select
          name="receiver_id"
          value={form.receiver_id}
          onChange={change}
          required
        >
          <option value="">Select Receiver</option>
          {receivers.map((receiver) => <option key={receiver.receiver_id} value={receiver.receiver_id}>{receiver.receiver_id} - {receiver.full_name}</option>)}
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

        <select name="status" value={form.status} onChange={change}>
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
          style={{ display: 'flex', gap: '10px', marginTop: '10px' }}
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
              <strong>Parcel ID:</strong> {singleParcel.parcel_id || singleParcel.id} |{' '}
              <strong>Tracking:</strong> {singleParcel.tracking_id} |{' '}
              <strong>Type:</strong> {singleParcel.parcel_type} |{' '}
              <strong>Weight:</strong> {singleParcel.weight} kg |{' '}
              <strong>Charge:</strong> BDT {singleParcel.charge} |{' '}
              <strong>Status:</strong> {singleParcel.status?.replaceAll('_', ' ')}
            </p>
          </div>
        )}
        {searchMessage && (
          <p style={{ color: 'red', marginTop: '10px' }}>{searchMessage}</p>
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
                <tr key={parcel.parcel_id || parcel.id || index}>
                  <td>{parcel.parcel_id || parcel.id}</td>
                  <td>{parcel.tracking_id}</td>
                  <td>{parcel.parcel_type}</td>
                  <td>{parcel.weight} kg</td>
                  <td>BDT {parcel.charge}</td>
                  <td>{parcel.status?.replaceAll('_', ' ')}</td>
                  <td className="actions">
                    <button type="button" className="view" onClick={() => setSelectedParcel(parcel)}>View</button>
                    <button type="button" className="edit" onClick={() => startEdit(parcel)}>Edit</button>
                    <button type="button" className="delete" onClick={() => placeholder('Delete')}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filteredParcels.length && <p className="empty">No parcels found.</p>}
      </section>

      {/* Modal / Overlay */}
      {selectedParcel && (
        <div className="overlay" onClick={() => setSelectedParcel(null)}>
          <article
            className="details"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="details-head">
              <h2>Parcel Details</h2>
              <button type="button" onClick={() => setSelectedParcel(null)}>
                X
              </button>
            </div>
            <dl>
              <div>
                <dt>Parcel ID</dt>
                <dd>{selectedParcel.parcel_id || selectedParcel.id}</dd>
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
                <dd>{selectedParcel.status?.replaceAll('_', ' ')}</dd>
              </div>
            </dl>
          </article>
        </div>
      )}

      {editingParcel && editForm && (
        <div className="overlay" onClick={cancelEdit}>
          <article className="details" onClick={(event) => event.stopPropagation()}>
            <div className="details-head">
              <h2>Edit Parcel</h2>
              <button type="button" onClick={cancelEdit}>X</button>
            </div>
            <form onSubmit={submitEdit}>
              <select name="sender_id" value={editForm.sender_id} onChange={editChange} required>
                {senders.map((sender) => <option key={sender.user_id} value={sender.user_id}>{sender.user_id} - {sender.full_name}</option>)}
              </select>
              <select name="receiver_id" value={editForm.receiver_id} onChange={editChange} required>
                {receivers.map((receiver) => <option key={receiver.receiver_id} value={receiver.receiver_id}>{receiver.receiver_id} - {receiver.full_name}</option>)}
              </select>
              <input name="tracking_id" minLength="3" value={editForm.tracking_id} onChange={editChange} required />
              <input name="parcel_type" value={editForm.parcel_type} onChange={editChange} required />
              <input name="weight" type="number" min="0.01" step="0.01" value={editForm.weight} onChange={editChange} required />
              <input name="charge" type="number" min="0" step="0.01" value={editForm.charge} onChange={editChange} required />
              <select name="status" value={editForm.status} onChange={editChange}>
                <option value="pending">Pending</option>
                <option value="picked_up">Picked up</option>
                <option value="in_transit">In transit</option>
                <option value="out_for_delivery">Out for delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {editMessage && <p className="message">{editMessage}</p>}
              <button disabled={editSaving}>{editSaving ? 'Updating...' : 'Update Parcel'}</button>
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
        <Route path="/" element={<ParcelPage />} />
        <Route path="/receivers" element={<ReceiverManagement />} />
        <Route path="/senders" element={<SenderManagement />} />
      </Routes>
    </BrowserRouter>
  );
}
