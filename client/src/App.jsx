import { useEffect, useState } from 'react';

const emptyForm = {
  sender_id: 1, receiver_id: 1, tracking_id: '', parcel_type: 'Documents',
  weight: '', charge: '', status: 'pending',
};

export default function App() {
  const [parcels, setParcels] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');

  const loadParcels = async () => {
    const response = await fetch('/api/parcels');
    const result = await response.json();
    setParcels(result.data || []);
  };

  useEffect(() => { loadParcels(); }, []);

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const createParcel = async (event) => {
    event.preventDefault();
    const response = await fetch('/api/parcels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    setMessage(response.ok ? 'Parcel created successfully.' : result.message);
    if (response.ok) {
      setForm(emptyForm);
      setShowForm(false);
      loadParcels();
    }
  };

  return (
    <main>
      <header>
        <div><h1>Parcel Management</h1><p>Create and view parcels</p></div>
        <button onClick={() => setShowForm(!showForm)}>+ Add Parcel</button>
      </header>

      {showForm && (
        <form onSubmit={createParcel}>
          <input name="sender_id" type="number" min="1" value={form.sender_id} onChange={change} placeholder="Sender ID" required />
          <input name="receiver_id" type="number" min="1" value={form.receiver_id} onChange={change} placeholder="Receiver ID" required />
          <input name="tracking_id" minLength="3" value={form.tracking_id} onChange={change} placeholder="Tracking ID" required />
          <input name="parcel_type" value={form.parcel_type} onChange={change} placeholder="Parcel type" required />
          <input name="weight" type="number" min="0.01" step="0.01" value={form.weight} onChange={change} placeholder="Weight" required />
          <input name="charge" type="number" min="0" step="0.01" value={form.charge} onChange={change} placeholder="Charge" required />
          <select name="status" value={form.status} onChange={change}>
            <option value="pending">Pending</option>
            <option value="picked_up">Picked up</option>
            <option value="in_transit">In transit</option>
            <option value="out_for_delivery">Out for delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button type="submit">Create</button>
          <p className="message">{message}</p>
        </form>
      )}

      <section>
        <h2>Parcels</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Tracking ID</th><th>Type</th><th>Weight</th><th>Charge</th><th>Status</th></tr></thead>
            <tbody>{parcels.map(parcel => (
              <tr key={parcel.parcel_id}>
                <td>{parcel.tracking_id}</td><td>{parcel.parcel_type}</td>
                <td>{parcel.weight} kg</td><td>৳{parcel.charge}</td>
                <td>{parcel.status.replaceAll('_', ' ')}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        {!parcels.length && <p className="empty">No parcels found.</p>}
      </section>
    </main>
  );
}
