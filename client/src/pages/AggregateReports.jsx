import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AggregateReports.css";
const API = "http://localhost:5000/api/aggregate-reports";

const reports = [
  {
    key: "revenue",
    title: "1. Parcel Type-wise Revenue Analysis",
    endpoint: "/parcel-type-revenue",
    columns: [
      ["parcel_type", "Parcel Type"],
      ["number_of_parcels", "Number of Parcels"],
      ["total_revenue", "Total Revenue"],
      ["average_charge", "Average Charge"],
    ],
    money: ["total_revenue", "average_charge"],
  },
  {
    key: "weight",
    title: "2. Parcel Type-wise Weight Analysis",
    endpoint: "/parcel-type-weight",
    columns: [
      ["parcel_type", "Parcel Type"],
      ["number_of_parcels", "Number of Parcels"],
      ["total_weight", "Total Weight"],
      ["average_weight", "Average Weight"],
      ["heaviest_parcel", "Heaviest Parcel"],
    ],
    weight: ["total_weight", "average_weight", "heaviest_parcel"],
  },
  {
    key: "status",
    title: "3. Status-wise Charge Range",
    endpoint: "/status-charge-range",
    columns: [
      ["status", "Status"],
      ["minimum_charge", "Minimum Charge"],
      ["maximum_charge", "Maximum Charge"],
      ["total_charge", "Total Charge"],
    ],
    money: ["minimum_charge", "maximum_charge", "total_charge"],
  },
  {
    key: "senders",
    title: "4. Senders with High Total Charge",
    endpoint: "/high-charge-senders",
    columns: [
      ["sender_id", "Sender ID"],
      ["sender_name", "Sender Name"],
      ["total_charge", "Total Charge"],
    ],
    money: ["total_charge"],
  },
  {
    key: "aboveAverage",
    title: "5. Parcels with Above-Average Charge for Their Parcel Type",
    endpoint: "/above-average-charge",
    columns: [
      ["parcel_id", "Parcel ID"],
      ["tracking_id", "Tracking ID"],
      ["parcel_type", "Parcel Type"],
      ["charge", "Charge"],
    ],
    money: ["charge"],
  },
  {
    key: "heaviest",
    title: "6. Senders of the Heaviest Parcels",
    endpoint: "/heaviest-parcel-senders",
    columns: [
      ["sender_id", "Sender ID"],
      ["sender_name", "Sender Name"],
      ["parcel_id", "Parcel ID"],
      ["tracking_id", "Tracking ID"],
      ["weight", "Weight"],
    ],
    weight: ["weight"],
  },
];

function formatValue(value, key, report) {
  if (value === null || value === undefined) return "—";

  const number = Number(value);

  if (report.money?.includes(key) && !Number.isNaN(number)) {
    return `BDT ${number.toFixed(2)}`;
  }

  if (report.weight?.includes(key) && !Number.isNaN(number)) {
    return `${number.toFixed(2)} kg`;
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? value : value.toFixed(2);
  }

  return value;
}

function AggregateReports() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchReports = async () => {
      const results = {};
      const reportErrors = {};

      await Promise.all(
        reports.map(async (report) => {
          try {
            const response = await fetch(`${API}${report.endpoint}`);

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            results[report.key] = result.data || [];
          } catch (error) {
            console.error(`Failed to load ${report.title}:`, error);
            results[report.key] = [];
            reportErrors[report.key] =
              "Unable to load this report. Please check the server.";
          }
        })
      );

      setData(results);
      setErrors(reportErrors);
      setLoading(false);
    };

    fetchReports();
  }, []);

  return (
    <div className="aggregate-page">
      <div className="aggregate-header">
     <div>
        <h1>Aggregate Reports</h1>
         <p>
           Analyze courier data using aggregate and subquery reports.
    </p>
 </div>

  <Link to="/" className="back-button">
    ← Back
  </Link>
</div>

      {loading ? (
        <div className="aggregate-loading">
          <div className="spinner"></div>
          <p>Loading reports...</p>
        </div>
      ) : (
        <div className="reports-container">
          {reports.map((report) => {
            const rows = data[report.key] || [];

            return (
              <section className="report-card" key={report.key}>
                <div className="report-card-header">
                  <h2>{report.title}</h2>
                  <span className="report-count">
                    {rows.length} {rows.length === 1 ? "record" : "records"}
                  </span>
                </div>

                {errors[report.key] ? (
                  <div className="report-error">{errors[report.key]}</div>
                ) : rows.length === 0 ? (
                  <div className="no-data">No data available for this report.</div>
                ) : (
                  <div className="table-wrapper">
                    <table className="aggregate-table">
                      <thead>
                        <tr>
                          {report.columns.map(([key, label]) => (
                            <th key={key}>{label}</th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {rows.map((row, index) => (
                          <tr key={row.parcel_id || row.sender_id || index}>
                            {report.columns.map(([key]) => (
                              <td key={key}>
                                {formatValue(row[key], key, report)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AggregateReports;