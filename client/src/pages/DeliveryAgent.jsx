import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ReceiverManagement.css';

const emptyForm = {
  full_name: '',
  email: '',
  phone: '',
  address: '',
  vehicle_number: '',
  availability_status: 'available',
};

export default function DeliveryAgentManagement() {
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const loadAgents = async () => {
    try {
      const response = await fetch('/api/delivery-agents');
      const result = await response.json();
      setAgents(result.data || []);
    } catch {
      setMessage('Could not load delivery agents from SQL Server.');
    }
  };

  useEffect(() => { loadAgents(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch(editId ? `/api/delivery-agents/${editId}` : '/api/delivery-agents', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.errors?.join(' ') || result.message);
        return;
      }
      setMessage(`Delivery agent ${editId ? 'updated' : 'created'}. ID: ${result.data.agent_id}`);
      setForm(emptyForm);
      setEditId(null);
      await loadAgents();
    } catch {
      setMessage('Could not connect to the SQL Server backend.');
    } finally {
      setSaving(false);
    }
  };

  const edit = (agent) => {
    setEditId(agent.agent_id);
    setForm({
      full_name: agent.full_name,
      email: agent.email,
      phone: agent.phone || '',
      address: agent.address || '',
      vehicle_number: agent.vehicle_number || '',
      availability_status: agent.availability_status,
    });
  };

  const remove = async (agent) => {
    const confirmed = window.confirm(`Are you sure you want to delete delivery agent "${agent.full_name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/delivery-agents/${agent.agent_id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || 'Failed to delete delivery agent.');
        return;
      }

      setMessage('Delivery agent deleted successfully.');
      await loadAgents();
    } catch {
      setMessage('Could not connect to the SQL Server backend.');
    }
  };

  return (
    <div className="receiver-page">
      <header>
        <div><h1>Delivery Agent Management</h1><p>Delivery agent CRUD (user + agent profile).</p></div>
        <Link to="/"><button>Back to Parcel</button></Link>
      </header>

      <div className="card">
        <form onSubmit={submit}>
          <input placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input placeholder="Vehicle Number" value={form.vehicle_number} onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })} />
          <select
            value={form.availability_status}
            onChange={(e) => setForm({ ...form, availability_status: e.target.value })}
          >
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
            <option value="offline">Offline</option>
          </select>
          <button disabled={saving}>{saving ? 'Saving...' : editId ? 'Update Agent' : 'Create Agent'}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm(emptyForm); }}>Cancel</button>}
        </form>
        {message && <p className="receiver-message">{message}</p>}

        <table>
          <thead>
            <tr>
              <th>Agent ID</th><th>Name</th><th>Email</th><th>Phone</th>
              <th>Vehicle</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>{agents.map((agent) => (
            <tr key={agent.agent_id}>
              <td>{agent.agent_id}</td>
              <td>{agent.full_name}</td>
              <td>{agent.email}</td>
              <td>{agent.phone || '-'}</td>
              <td>{agent.vehicle_number || '-'}</td>
              <td>{agent.availability_status}</td>
              <td>
                <button onClick={() => setSelected(agent)}>View</button>
                <button onClick={() => edit(agent)}>Edit</button>
                <button className="delete" onClick={() => remove(agent)}>Delete</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
        {!agents.length && <p className="empty">No delivery agents found.</p>}
      </div>

      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h2>Delivery Agent Details</h2>
            <p><b>Agent ID:</b> {selected.agent_id}</p>
            <p><b>User ID:</b> {selected.user_id}</p>
            <p><b>Name:</b> {selected.full_name}</p>
            <p><b>Email:</b> {selected.email}</p>
            <p><b>Phone:</b> {selected.phone || '-'}</p>
            <p><b>Address:</b> {selected.address || '-'}</p>
            <p><b>Vehicle:</b> {selected.vehicle_number || '-'}</p>
            <p><b>Status:</b> {selected.availability_status}</p>
            <button onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
