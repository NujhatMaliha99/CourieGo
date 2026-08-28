import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ReceiverManagement.css';

const emptyForm = { full_name: '', email: '', phone: '', address: '' };

export default function SenderManagement() {
  const [senders, setSenders] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const loadSenders = async () => {
    try {
      const response = await fetch('/api/senders');
      const result = await response.json();
      setSenders(result.data || []);
    } catch {
      setMessage('Could not load senders from SQL Server.');
    }
  };

  useEffect(() => { loadSenders(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch(editId ? `/api/senders/${editId}` : '/api/senders', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.errors?.join(' ') || result.message);
        return;
      }
      setMessage(`Sender ${editId ? 'updated' : 'created'}. ID: ${result.data.user_id}`);
      setForm(emptyForm);
      setEditId(null);
      await loadSenders();
    } catch {
      setMessage('Could not connect to the SQL Server backend.');
    } finally {
      setSaving(false);
    }
  };

  const edit = (sender) => {
    setEditId(sender.user_id);
    setForm({ full_name: sender.full_name, email: sender.email, phone: sender.phone || '', address: sender.address || '' });
  };

  const remove = async (sender) => {
    if (!window.confirm(`Delete sender ${sender.full_name}?`)) return;
    try {
      const response = await fetch(`/api/senders/${sender.user_id}`, { method: 'DELETE' });
      const result = await response.json();
      setMessage(result.message);
      if (response.ok) {
        setSelected(null);
        await loadSenders();
      }
    } catch {
      setMessage('Could not delete sender from SQL Server.');
    }
  };

  return (
    <div className="receiver-page">
      <header>
        <div><h1>Sender Management</h1><p>Sender CRUD for parcel foreign keys.</p></div>
        <Link to="/"><button>Back to Parcel</button></Link>
      </header>

      <div className="card">
        <form onSubmit={submit}>
          <input placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <button disabled={saving}>{saving ? 'Saving...' : editId ? 'Update Sender' : 'Create Sender'}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm(emptyForm); }}>Cancel</button>}
        </form>
        {message && <p className="receiver-message">{message}</p>}

        <table>
          <thead><tr><th>Sender ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr></thead>
          <tbody>{senders.map((sender) => (
            <tr key={sender.user_id}>
              <td>{sender.user_id}</td><td>{sender.full_name}</td><td>{sender.email}</td><td>{sender.phone || '-'}</td>
              <td>
                <button onClick={() => setSelected(sender)}>View</button>
                <button onClick={() => edit(sender)}>Edit</button>
                <button className="delete" onClick={() => remove(sender)}>Delete</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
        {!senders.length && <p className="empty">No senders found.</p>}
      </div>

      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h2>Sender Details</h2>
            <p><b>ID:</b> {selected.user_id}</p><p><b>Name:</b> {selected.full_name}</p>
            <p><b>Email:</b> {selected.email}</p><p><b>Phone:</b> {selected.phone || '-'}</p>
            <p><b>Address:</b> {selected.address || '-'}</p>
            <button onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
