import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ReceiverManagement.css";

export default function ReceiverManagement() {
  const [receivers, setReceivers] = useState([]);

  const loadReceivers = async () => {
    try {
      const response = await fetch('/api/receivers');
      const result = await response.json();
      const rows = result.data || [];
      setReceivers(rows.map(receiver => ({
        id: receiver.receiver_id,
        name: receiver.full_name,
        phone: receiver.phone,
        email: receiver.email || '',
        address: receiver.address,
      })));
    } catch {
      setMessage('Could not load receivers from SQL Server.');
    }
  };

  useEffect(() => {
    loadReceivers();
  }, []);

  const [search, setSearch] = useState("");
  const emptyForm = { name: "", phone: "", email: "", address: "" };
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [modal, setModal] = useState(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const list = receivers.filter(
    r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search)
  );

  const save = async e => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(editId ? `/api/receivers/${editId}` : '/api/receivers', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.errors?.join(' ') || result.message);
        return;
      }

      setMessage(`Receiver ${editId ? 'updated' : 'created'}. ID: ${result.data.receiver_id}`);
      await loadReceivers();
    } catch {
      setMessage('Could not connect to the SQL Server backend.');
      return;
    } finally {
      setSaving(false);
    }

    setForm(emptyForm);
    setEditId(null);
    setModal(null);
  };

  const edit = r => {
    setForm({ name: r.name, phone: r.phone, email: r.email, address: r.address || "" });
    setEditId(r.id);
    setModal("form");
  };

  const remove = () => {
    setReceivers(receivers.filter(r => r.id !== modal.id));
    setModal(null);
  };

  return (
    <div className="receiver-page">
      <header>
  <div>
    <h1>Receiver Management</h1>
    <p>Manage all receivers in the courier system.</p>
  </div>

  <div>
    <Link to="/">
      <button>Back to Parcel</button>
    </Link>

    <button onClick={() => {
      setForm(emptyForm);
      setEditId(null);
      setModal("form");
    }}>
      + Add Receiver
    </button>
  </div>
</header>

      <div className="card">
        {message && <p className="receiver-message">{message}</p>}
        <input
          placeholder="Search by name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {list.length === 0 ? (
          <p className="empty">No receivers found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Receiver ID</th>
                <th>Full Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {list.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.name}</td>
                  <td>{r.phone}</td>
                  <td>{r.email}</td>
                  <td>
                    <button onClick={() => setModal(r)}>View</button>
                    <button onClick={() => edit(r)}>Edit</button>
                    <button
                      className="delete"
                      onClick={() => setModal({ type: "delete", id: r.id })}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="count">
          Showing {list.length} of {receivers.length} receivers
        </p>
      </div>

      {/* Add / Edit */}
      {modal === "form" && (
        <div className="overlay">
          <div className="modal">
            <h2>{editId ? "Edit Receiver" : "Add Receiver"}</h2>

            <form onSubmit={save}>
              {message && <p className="receiver-message">{message}</p>}
              <input
                placeholder="Full Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />

              <input
                placeholder="Phone"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                required
              />

              <input
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />

              <input
                placeholder="Address"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                required
              />

              <button type="button" onClick={() => setModal(null)}>
                Cancel
              </button>

              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : editId ? "Update" : "Add"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View */}
      {modal && modal.id && !modal.type && (
        <div className="overlay">
          <div className="modal">
            <h2>Receiver Details</h2>
            <p><b>Name:</b> {modal.name}</p>
            <p><b>Phone:</b> {modal.phone}</p>
            <p><b>Email:</b> {modal.email}</p>
            <p><b>Address:</b> {modal.address}</p>
            <button onClick={() => setModal(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Delete */}
      {modal?.type === "delete" && (
        <div className="overlay">
          <div className="modal">
            <h2>Delete Receiver?</h2>
            <p>Are you sure you want to delete this receiver?</p>
            <button onClick={() => setModal(null)}>Cancel</button>
            <button className="delete" onClick={remove}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}
