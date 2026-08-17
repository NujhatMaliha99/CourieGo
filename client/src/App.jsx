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

    setMessage(
      response.ok
        ? `Parcel created. ID: ${result.data.parcel_id}`
        : result.message
    );

    if (response.ok) setForm(emptyForm);

    setSaving(false);
  };

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