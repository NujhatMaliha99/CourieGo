import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ReceiverManagement.css";

export default function ReceiverManagement() {
  const [receivers, setReceivers] = useState([]);
  const [search, setSearch] = useState("");
  const emptyForm = { name: "", phone: "", email: "", address: "" };
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [modal, setModal] = useState(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // READ ONE (Search by ID state)
  const [searchId, setSearchId] = useState("");
  const [singleReceiver, setSingleReceiver] = useState(null);
  const [searchMessage, setSearchMessage] = useState("");

  // 1. READ ALL: Fetch receivers from backend API
  const loadReceivers = async () => {
    try {
      const response = await fetch("/api/receivers");
      
      if (!response.ok) {
        throw new Error(`Server status: ${response.status}`);
      }

      const result = await response.json();
      const rawList = Array.isArray(result) ? result : result.data || [];

      // Normalize backend data structure for UI
      const formattedList = rawList.map((r) => ({
        id: r.receiver_id || r.id,
        name: r.full_name || r.name || "",
        phone: r.phone || r.contact_number || "",
        email: r.email || "",
        address: r.address || "",
      }));

      setReceivers(formattedList);
    } catch (error) {
      console.error("Could not load receivers:", error);
    }
  };

  useEffect(() => {
    loadReceivers();
  }, []);

  // 2. READ ONE: Search receiver by ID from backend
  const searchReceiverById = async (e) => {
    e.preventDefault();
    setSingleReceiver(null);
    setSearchMessage("");
    if (!searchId) return;

    try {
      const response = await fetch(`/api/receivers/${searchId}`);
      const result = await response.json();

      if (response.ok) {
        const data = result.data || result;
        setSingleReceiver({
          id: data.receiver_id || data.id,
          name: data.full_name || data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
        });
      } else {
        setSearchMessage(result.message || "Receiver not found.");
      }
    } catch (error) {
      setSearchMessage("Could not connect to the backend.");
    }
  };

  // Safe Filtering Logic (Search by Name or Phone)
  const list = receivers.filter((r) => {
    const searchTerm = search.toLowerCase().trim();
    if (!searchTerm) return true;

    const nameMatches = r.name ? r.name.toLowerCase().includes(searchTerm) : false;
    const phoneMatches = r.phone ? r.phone.toString().includes(searchTerm) : false;

    return nameMatches || phoneMatches;
  });

  const save = async (e) => {
    e.preventDefault();

    if (editId) {
      setReceivers(
        receivers.map((r) => (r.id === editId ? { ...r, ...form } : r))
      );
      setMessage("Receiver updated in the frontend only.");
      setForm(emptyForm);
      setEditId(null);
      setModal(null);
    } else {
      setSaving(true);
      try {
        const response = await fetch("/api/receivers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: form.name,
            phone: form.phone,
            email: form.email,
            address: form.address,
          }),
        });
        const result = await response.json();

        if (!response.ok) {
          setMessage(result.errors?.join(" ") || result.message);
          return;
        }

        setMessage(`Receiver created successfully.`);
        await loadReceivers();
        setForm(emptyForm);
        setEditId(null);
        setModal(null);
      } catch {
        setMessage("Could not connect to the backend.");
      } finally {
        setSaving(false);
      }
    }
  };

  const edit = (r) => {
    setForm({ name: r.name, phone: r.phone, email: r.email, address: r.address || "" });
    setEditId(r.id);
    setModal("form");
  };

  const remove = () => {
    setReceivers(receivers.filter((r) => r.id !== modal.id));
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

          <button
            onClick={() => {
              setForm(emptyForm);
              setEditId(null);
              setMessage("");
              setModal("form");
            }}
          >
            + Add Receiver
          </button>
        </div>
      </header>

      {/* READ ONE: Search Box Section */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <h3>Search Receiver by ID (Read One)</h3>
        <form onSubmit={searchReceiverById} style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <input
            type="number"
            placeholder="Enter Receiver ID (e.g. 1)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            required
          />
          <button type="submit">Search</button>
        </form>

        {singleReceiver && (
          <div style={{ marginTop: "10px", background: "#f0fdf4", padding: "10px", borderRadius: "4px" }}>
            <p>
              <strong>ID:</strong> {singleReceiver.id} | <strong>Name:</strong> {singleReceiver.name} |{" "}
              <strong>Phone:</strong> {singleReceiver.phone} | <strong>Email:</strong> {singleReceiver.email} |{" "}
              <strong>Address:</strong> {singleReceiver.address}
            </p>
          </div>
        )}
        {searchMessage && <p style={{ color: "red", marginTop: "10px" }}>{searchMessage}</p>}
      </div>

      {/* READ ALL: Search & Table */}
      <div className="card">
        {message && <p className="receiver-message">{message}</p>}
        <input
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
              {list.map((r) => (
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

      {/* Add / Edit Modal */}
      {modal === "form" && (
        <div className="overlay">
          <div className="modal">
            <h2>{editId ? "Edit Receiver" : "Add Receiver"}</h2>

            <form onSubmit={save}>
              {message && <p className="receiver-message">{message}</p>}
              <input
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />

              <input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />

              <input
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />

              <input
                placeholder="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
              />

              <button type="button" onClick={() => setModal(null)}>
                Cancel
              </button>

              <button type="submit" disabled={saving}>
                {saving ? "Adding..." : editId ? "Update" : "Add"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
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

      {/* Delete Modal */}
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