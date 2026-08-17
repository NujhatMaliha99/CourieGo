import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ReceiverManagement from './pages/ReceiverManagement';

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
  const [createdParcels, setCreatedParcels] = useState([]);
  const [selectedParcel, setSelectedParcel] = useState(null);

  const change = ({ target }) =>
    setForm({ ...form, [target.name]: target.value });

  const createParcel = async (event) => {
    event.preventDefault();
    setSaving(true);

    const response = await fetch('/api/parcels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const result = await response.json();
    setMessage(response.ok ? `Parcel created. ID: ${result.data.parcel_id}` : result.message);
    if (response.ok) {
      setCreatedParcels(parcels => [result.data, ...parcels]);
      setForm(emptyForm);
    }
    setSaving(false);
  };

  const placeholder = (action) => setMessage(`${action} will be added by another teammate.`);

  return (
    <main>
      <header>
        <h1>Create Parcel</h1>
        <p>Add a new parcel to the courier database.</p>

        <Link to="/receivers">
          <button>Receiver Management</button>
        </Link>
      </header>

      <form onSubmit={createParcel}>
        <input
          name="sender_id"
          type="number"
          min="1"
          value={form.sender_id}
          onChange={change}
          placeholder="Sender ID"
          required
        />

        <input
          name="receiver_id"
          type="number"
          min="1"
          value={form.receiver_id}
          onChange={change}
          placeholder="Receiver ID"
          required
        />

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

      {createdParcels.length > 0 && (
        <section>
          <h2>Created Parcels</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Tracking ID</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{createdParcels.map(parcel => (
                <tr key={parcel.parcel_id}>
                  <td>{parcel.tracking_id}</td>
                  <td>{parcel.parcel_type}</td>
                  <td>{parcel.status.replaceAll('_', ' ')}</td>
                  <td className="actions">
                    <button type="button" className="view" onClick={() => setSelectedParcel(parcel)}>View</button>
                    <button type="button" className="edit" onClick={() => placeholder('Edit')}>Edit</button>
                    <button type="button" className="delete" onClick={() => placeholder('Delete')}>Delete</button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </section>
      )}

      {selectedParcel && (
        <div className="overlay" onClick={() => setSelectedParcel(null)}>
          <article className="details" onClick={event => event.stopPropagation()}>
            <div className="details-head"><h2>Parcel Details</h2><button type="button" onClick={() => setSelectedParcel(null)}>X</button></div>
            <dl>
              <div><dt>Parcel ID</dt><dd>{selectedParcel.parcel_id}</dd></div>
              <div><dt>Tracking ID</dt><dd>{selectedParcel.tracking_id}</dd></div>
              <div><dt>Sender ID</dt><dd>{selectedParcel.sender_id}</dd></div>
              <div><dt>Receiver ID</dt><dd>{selectedParcel.receiver_id}</dd></div>
              <div><dt>Parcel Type</dt><dd>{selectedParcel.parcel_type}</dd></div>
              <div><dt>Weight</dt><dd>{selectedParcel.weight} kg</dd></div>
              <div><dt>Charge</dt><dd>BDT {selectedParcel.charge}</dd></div>
              <div><dt>Status</dt><dd>{selectedParcel.status.replaceAll('_', ' ')}</dd></div>
            </dl>
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
      </Routes>
    </BrowserRouter>
  );
}
