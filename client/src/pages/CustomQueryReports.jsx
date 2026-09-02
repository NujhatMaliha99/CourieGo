import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CustomQueryReports = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    distinctSenderAvg: [],
    receiverWeight: [],
    statusSummary: [],
    receiversAboveAvg: [],
    senderCharge: [],
    receiverAddress: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [res1, res2, res3, res4, res5, res6] = await Promise.all([
          fetch('http://localhost:5000/api/reports/distinct-sender-avg-charge'),
          fetch('http://localhost:5000/api/reports/receiver-weight-analysis'),
          fetch('http://localhost:5000/api/reports/status-summary'),
          fetch('http://localhost:5000/api/reports/receivers-above-avg-weight'),
          fetch('http://localhost:5000/api/reports/sender-charge-analysis'),
          fetch('http://localhost:5000/api/reports/receiver-address-summary')
        ]);

        const [d1, d2, d3, d4, d5, d6] = await Promise.all([
          res1.json(), res2.json(), res3.json(), res4.json(), res5.json(), res6.json()
        ]);

        setData({
          distinctSenderAvg: d1.data || [],
          receiverWeight: d2.data || [],
          statusSummary: d3.data || [],
          receiversAboveAvg: d4.data || [],
          senderCharge: d5.data || [],
          receiverAddress: d6.data || []
        });
      } catch (error) {
        console.error('Error fetching custom reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading Custom Analytics...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Header & Back Button Layout (Matching the Image) */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h2 style={{ color: '#00838f', margin: 0 }}>Courier Reports</h2>
        
        <button 
          onClick={() => navigate('/')} 
          style={{
            padding: '8px 18px',
            backgroundColor: '#4db6ac',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          Back to Parcel
        </button>
      </div>

      <h3 style={{ marginTop: '30px' }}>Custom Analytics & SQL Reports</h3>

      {/* Table 1 */}
      <h4>1. Distinct Sender Count & Avg Charge (Right Join)</h4>
      <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', marginBottom: '30px', borderColor: '#b2dfdb' }}>
        <thead>
          <tr style={{ background: '#e0f2f1', color: '#00695c' }}>
            <th>Receiver Name (ID)</th>
            <th>Unique Senders</th>
            <th>Min Charge</th>
            <th>Avg Charge</th>
          </tr>
        </thead>
        <tbody>
          {data.distinctSenderAvg.map((item, index) => (
            <tr key={index}>
              <td>{item.receiver_name} (ID: {item.receiver_id})</td>
              <td>{item.unique_senders_count}</td>
              <td>BDT {item.min_charge}</td>
              <td>BDT {Number(item.avg_charge).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Table 2 */}
      <h4>2. Receiver-wise Parcel Weight Analysis</h4>
      <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', marginBottom: '30px', borderColor: '#b2dfdb' }}>
        <thead>
          <tr style={{ background: '#e0f2f1', color: '#00695c' }}>
            <th>Receiver Name</th>
            <th>Total Parcels</th>
            <th>Total Weight</th>
            <th>Avg Weight</th>
          </tr>
        </thead>
        <tbody>
          {data.receiverWeight.map((item, index) => (
            <tr key={index}>
              <td>{item.receiver_name}</td>
              <td>{item.total_parcels_received}</td>
              <td>{item.total_weight} kg</td>
              <td>{Number(item.avg_weight).toFixed(2)} kg</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Table 3 */}
      <h4>3. Status-wise Charge and Weight Summary</h4>
      <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', marginBottom: '30px', borderColor: '#b2dfdb' }}>
        <thead>
          <tr style={{ background: '#e0f2f1', color: '#00695c' }}>
            <th>Status</th>
            <th>Total Parcels</th>
            <th>Avg Charge</th>
            <th>Max Weight</th>
          </tr>
        </thead>
        <tbody>
          {data.statusSummary.map((item, index) => (
            <tr key={index}>
              <td><strong>{item.status}</strong></td>
              <td>{item.total_parcels}</td>
              <td>BDT {Number(item.avg_charge).toFixed(2)}</td>
              <td>{item.max_weight} kg</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Table 4 */}
      <h4>4. Receivers Higher Than Overall Avg Weight (Subquery)</h4>
      <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', marginBottom: '30px', borderColor: '#b2dfdb' }}>
        <thead>
          <tr style={{ background: '#e0f2f1', color: '#00695c' }}>
            <th>Receiver Name (ID)</th>
            <th>Receiver Avg Weight</th>
          </tr>
        </thead>
        <tbody>
          {data.receiversAboveAvg.map((item, index) => (
            <tr key={index}>
              <td>{item.receiver_name} (ID: {item.receiver_id})</td>
              <td>{Number(item.receiver_avg_weight).toFixed(2)} kg</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Table 5 */}
      <h4>5. Sender-wise Min & Max Charge Analysis</h4>
      <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', marginBottom: '30px', borderColor: '#b2dfdb' }}>
        <thead>
          <tr style={{ background: '#e0f2f1', color: '#00695c' }}>
            <th>Sender Name</th>
            <th>Total Sent</th>
            <th>Min Charge</th>
            <th>Max Charge</th>
            <th>Avg Charge</th>
          </tr>
        </thead>
        <tbody>
          {data.senderCharge.map((item, index) => (
            <tr key={index}>
              <td>{item.sender_name}</td>
              <td>{item.total_sent}</td>
              <td>BDT {item.min_charge_sent}</td>
              <td>BDT {item.max_charge_sent}</td>
              <td>BDT {Number(item.avg_charge_sent).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Table 6 */}
      <h4>6. Receiver Address & Total Charge Summary</h4>
      <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', marginBottom: '30px', borderColor: '#b2dfdb' }}>
        <thead>
          <tr style={{ background: '#e0f2f1', color: '#00695c' }}>
            <th>Receiver Name</th>
            <th>Address</th>
            <th>Parcels Received</th>
            <th>Total Charge Spent</th>
          </tr>
        </thead>
        <tbody>
          {data.receiverAddress.map((item, index) => (
            <tr key={index}>
              <td>{item.receiver_name}</td>
              <td>{item.receiver_address || 'N/A'}</td>
              <td>{item.total_parcels_received}</td>
              <td>BDT {item.total_charge_spent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomQueryReports;