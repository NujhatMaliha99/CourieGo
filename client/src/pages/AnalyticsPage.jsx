import React, { useState, useEffect } from 'react';

const AnalyticsPage = () => {
  const [receiverSummary, setReceiverSummary] = useState([]);
  const [statusSummary, setStatusSummary] = useState([]);
  const [senderSummary, setSenderSummary] = useState([]);
  const [frequentReceivers, setFrequentReceivers] = useState([]);
  const [aboveAverageParcels, setAboveAverageParcels] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      const [res1, res2, res3, res4, res5] = await Promise.all([
        fetch('/api/analytics/receiver-charge-summary'),
        fetch('/api/analytics/parcel-status-summary'),
        fetch('/api/analytics/sender-activity-summary'),
        fetch('/api/analytics/frequent-receivers'),
        fetch('/api/analytics/above-average-charge-parcels'),
      ]);

      const data1 = await res1.json();
      const data2 = await res2.json();
      const data3 = await res3.json();
      const data4 = await res4.json();
      const data5 = await res5.json();

      setReceiverSummary(Array.isArray(data1) ? data1 : data1.data || []);
      setStatusSummary(Array.isArray(data2) ? data2 : data2.data || []);
      setSenderSummary(Array.isArray(data3) ? data3 : data3.data || []);
      setFrequentReceivers(Array.isArray(data4) ? data4 : data4.data || []);
      setAboveAverageParcels(Array.isArray(data5) ? data5 : data5.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Analytics fetch error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading Analytics...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Analytics & Reports</h2>

      <div style={{ marginBottom: '30px' }}>
        <h3>1. Total Delivery Charge by Receiver (Right Join + SUM)</h3>
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Receiver Name</th>
              <th>Total Delivery Charge</th>
            </tr>
          </thead>
          <tbody>
            {receiverSummary.map((item, idx) => (
              <tr key={idx}>
                <td>{item.receiver_name ?? item.ReceiverName ?? '-'}</td>
                <td>{item.total_charge ?? item.TotalCharge ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>2. Parcel Status Summary (COUNT + GROUP BY)</h3>
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Status</th>
              <th>Total Parcels</th>
            </tr>
          </thead>
          <tbody>
            {statusSummary.map((item, idx) => (
              <tr key={idx}>
                <td>{item.status ?? item.Status ?? '-'}</td>
                <td>{item.total_parcels ?? item.TotalParcels ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>3. Sender Activity Summary (AVG + MAX Charge)</h3>
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Sender Name</th>
              <th>Average Charge</th>
              <th>Max Charge</th>
            </tr>
          </thead>
          <tbody>
            {senderSummary.map((item, idx) => (
              <tr key={idx}>
                <td>{item.sender_name ?? item.SenderName ?? '-'}</td>
                <td>{item.avg_charge ?? item.AvgCharge ?? 0}</td>
                <td>{item.max_charge ?? item.MaxCharge ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>4. Frequent Receivers (HAVING Count &gt; 1)</h3>
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Receiver Name</th>
              <th>Parcels Received</th>
            </tr>
          </thead>
          <tbody>
            {frequentReceivers.map((item, idx) => (
              <tr key={idx}>
                <td>{item.receiver_name ?? item.ReceiverName ?? '-'}</td>
                <td>{item.parcel_count ?? item.ParcelCount ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>5. Parcels Above Average Charge (Subquery)</h3>
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Parcel ID</th>
              <th>Tracking Number</th>
              <th>Delivery Charge</th>
            </tr>
          </thead>
          <tbody>
            {aboveAverageParcels.map((item, idx) => (
              <tr key={idx}>
                <td>{item.parcel_id ?? item.ParcelID ?? '-'}</td>
                <td>{item.tracking_number ?? item.TrackingNumber ?? '-'}</td>
                <td>{item.delivery_charge ?? item.DeliveryCharge ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalyticsPage;