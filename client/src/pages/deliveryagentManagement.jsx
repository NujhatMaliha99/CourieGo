import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import "./ReceiverManagement.css";

const STATUS_OPTIONS = ["available", "assigned", "offline"];

export default function DeliveryAgentManagement() {

  const [agents, setAgents] = useState([]);

  const loadAgents = async () => {

    try {

      const response = await fetch('/api/delivery-agents');

      const result = await response.json();

      const rows = result.data || [];

      setAgents(rows.map(agent => ({

        id: agent.agent_id,

        name: agent.full_name,

        phone: agent.phone,

        email: agent.email || '',

        address: agent.address || '',

        vehicle: agent.vehicle_number || '',

        license: agent.license_number || '',

        status: agent.availability_status,

      })));

    } catch {

      setMessage('Could not load delivery agents from SQL Server.');

    }

  };

  useEffect(() => {

    loadAgents();

  }, []);

  const [search, setSearch] = useState("");

  const emptyForm = { name: "", phone: "", email: "", address: "", vehicle: "", license: "", status: "available" };

  const [form, setForm] = useState(emptyForm);

  const [editId, setEditId] = useState(null);

  const [modal, setModal] = useState(null);

  const [message, setMessage] = useState("");

  const [saving, setSaving] = useState(false);

  const list = agents.filter(

    a =>

      a.name.toLowerCase().includes(search.toLowerCase()) ||

      a.phone.includes(search)

  );

  const save = async e => {

    e.preventDefault();

    setSaving(true);

    try {

      const response = await fetch(editId ? `/api/delivery-agents/${editId}` : '/api/delivery-agents', {

        method: editId ? 'PUT' : 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          full_name: form.name,

          phone: form.phone,

          email: form.email,

          address: form.address,

          vehicle_number: form.vehicle,

          license_number: form.license,

          availability_status: form.status,

        }),

      });

      const result = await response.json();

      if (!response.ok) {

        setMessage(result.errors?.join(' ') || result.message);

        return;

      }

      setMessage(`Delivery agent ${editId ? 'updated' : 'created'}. ID: ${result.data.agent_id}`);

      await loadAgents();

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

  const edit = a => {

    setForm({
      name: a.name,
      phone: a.phone,
      email: a.email,
      address: a.address || "",
      vehicle: a.vehicle || "",
      license: a.license || "",
      status: a.status || "available",
    });

    setEditId(a.id);

    setModal("form");

  };

  const remove = async () => {

    try {

      const response = await fetch(`/api/delivery-agents/${modal.id}`, {

        method: 'DELETE',

      });

      const result = await response.json();

      if (!response.ok) {

        setMessage(result.message || 'Failed to delete delivery agent.');

        return;

      }

      setMessage('Delivery agent deleted successfully.');

      await loadAgents();

      setModal(null);

    } catch {

      setMessage('Could not connect to the SQL Server backend.');

    }

  };

  return (

    <div className="receiver-page">

      <header>

        <div>

          <h1>Delivery Agent Management</h1>

          <p>Manage all delivery agents in the courier system.</p>

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

            + Add Delivery Agent

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

          <p className="empty">No delivery agents found.</p>

        ) : (

          <table>

            <thead>

              <tr>

                <th>Agent ID</th>

                <th>Full Name</th>

                <th>Phone</th>

                <th>Vehicle</th>

                <th>Status</th>

                <th>Actions</th>

              </tr>

            </thead>

            <tbody>

              {list.map(a => (

                <tr key={a.id}>

                  <td>{a.id}</td>

                  <td>{a.name}</td>

                  <td>{a.phone}</td>

                  <td>{a.vehicle || '-'}</td>

                  <td>{a.status}</td>

                  <td>

                    <button onClick={() => setModal(a)}>View</button>

                    <button onClick={() => edit(a)}>Edit</button>

                    <button

                      className="delete"

                      onClick={() => setModal({ type: "delete", id: a.id })}

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

          Showing {list.length} of {agents.length} delivery agents

        </p>

      </div>

      {/* Add / Edit */}

      {modal === "form" && (

        <div className="overlay">

          <div className="modal">

            <h2>{editId ? "Edit Delivery Agent" : "Add Delivery Agent"}</h2>

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

              />

              <input

                placeholder="Address"

                value={form.address}

                onChange={e => setForm({ ...form, address: e.target.value })}

              />

              <input

                placeholder="Vehicle Number"

                value={form.vehicle}

                onChange={e => setForm({ ...form, vehicle: e.target.value })}

              />

              <input

                placeholder="License Number"

                value={form.license}

                onChange={e => setForm({ ...form, license: e.target.value })}

              />

              <select

                value={form.status}

                onChange={e => setForm({ ...form, status: e.target.value })}

              >

                {STATUS_OPTIONS.map(s => (

                  <option key={s} value={s}>{s}</option>

                ))}

              </select>

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

            <h2>Delivery Agent Details</h2>

            <p><b>Name:</b> {modal.name}</p>

            <p><b>Phone:</b> {modal.phone}</p>

            <p><b>Email:</b> {modal.email || '-'}</p>

            <p><b>Address:</b> {modal.address || '-'}</p>

            <p><b>Vehicle Number:</b> {modal.vehicle || '-'}</p>

            <p><b>License Number:</b> {modal.license || '-'}</p>

            <p><b>Status:</b> {modal.status}</p>

            <button onClick={() => setModal(null)}>Close</button>

          </div>

        </div>

      )}

      {/* Delete */}

      {modal?.type === "delete" && (

        <div className="overlay">

          <div className="modal">

            <h2>Delete Delivery Agent?</h2>

            <p>Are you sure you want to delete this delivery agent?</p>

            <button onClick={() => setModal(null)}>Cancel</button>

            <button className="delete" onClick={remove}>Delete</button>

          </div>

        </div>

      )}

    </div>

  );

}
