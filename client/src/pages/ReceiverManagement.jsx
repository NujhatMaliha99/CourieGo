import { useState } from "react";
import { Link } from "react-router-dom";
import "./ReceiverManagement.css";

export default function ReceiverManagement() {
  const [receivers, setReceivers] = useState([
    { id: 1, name: "John Doe", phone: "01711122334", email: "john@gmail.com" },
    { id: 2, name: "Jane Smith", phone: "01822233445", email: "jane@gmail.com" },
  ]);

  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [editId, setEditId] = useState(null);
  const [modal, setModal] = useState(null);

  const list = receivers.filter(
    r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search)
  );

  const save = e => {
    e.preventDefault();

    if (editId) {
      setReceivers(
        receivers.map(r => r.id === editId ? { ...r, ...form } : r)
      );
    } else {
      setReceivers([...receivers, { id: Date.now(), ...form }]);
    }

    setForm({ name: "", phone: "", email: "" });
    setEditId(null);
    setModal(null);
  };

  const edit = r => {
    setForm({ name: r.name, phone: r.phone, email: r.email });
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
      setForm({ name: "", phone: "", email: "" });
      setEditId(null);
      setModal("form");
    }}>
      + Add Receiver
    </button>
  </div>
</header>

      <div className="card">
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

              <button type="button" onClick={() => setModal(null)}>
                Cancel
              </button>

              <button type="submit">
                {editId ? "Update" : "Add"}
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