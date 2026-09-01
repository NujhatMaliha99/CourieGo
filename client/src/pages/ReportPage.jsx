import { useEffect, useState } from "react";
import "./Reports.css";
import { Link } from "react-router-dom";

export default function Reports() {

  const [topSenders, setTopSenders] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [addressReport, setAddressReport] = useState([]);
  const [suspicious, setSuspicious] = useState([]);
  const [zeroSenders, setZeroSenders] = useState([]);
  const [zeroReceivers, setZeroReceivers] = useState([]);
  const [weightReport, setWeightReport] = useState([]);
  const [fullReport, setFullReport] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");


  useEffect(() => {
    loadReports();
  }, []);


  const loadReports = async () => {

    try {

      setLoading(true);

      const [
        topSendersRes,
        pairsRes,
        addressRes,
        suspiciousRes,
        zeroSendersRes,
        zeroReceiversRes,
        weightRes,
        fullReportRes
      ] = await Promise.all([

        fetch("/api/reports/top-senders"),

        fetch("/api/reports/sender-receiver-pairs"),

        fetch("/api/reports/receiver-address"),

        fetch("/api/reports/suspicious-receivers"),

        fetch("/api/reports/zero-activity-senders"),

        fetch("/api/reports/zero-activity-receivers"),

        fetch("/api/reports/sender-weight"),

        fetch("/api/reports/full-report")

      ]);


      const topSendersData = await topSendersRes.json();
      const pairsData = await pairsRes.json();
      const addressData = await addressRes.json();
      const suspiciousData = await suspiciousRes.json();
      const zeroSendersData = await zeroSendersRes.json();
      const zeroReceiversData = await zeroReceiversRes.json();
      const weightData = await weightRes.json();
      const fullReportData = await fullReportRes.json();


      setTopSenders(topSendersData.data || []);
      setPairs(pairsData.data || []);
      setAddressReport(addressData.data || []);
      setSuspicious(suspiciousData.data || []);
      setZeroSenders(zeroSendersData.data || []);
      setZeroReceivers(zeroReceiversData.data || []);
      setWeightReport(weightData.data || []);
      setFullReport(fullReportData.data || []);

    } catch (error) {

      console.error(error);

      setMessage("Could not load reports from SQL Server.");

    } finally {

      setLoading(false);

    }
  };


  if (loading) {
    return (
      <div className="reports-page">
        <h1>Reports</h1>
        <p>Loading reports...</p>
      </div>
    );
  }


  return (

    <div className="reports-page">

      <header className="reports-header">

        <div>
          <h1>Courier Reports</h1>
         
        </div>

        <Link to="/">
           <button>Back to Parcel</button>
        </Link>

      </header>


      {message && (
        <p className="report-message">
          {message}
        </p>
      )}


      {/* TOP SENDERS */}

      <section className="report-card">

        <h2>1. Top Senders</h2>

        <table>

          <thead>
            <tr>
              <th>Sender ID</th>
              <th>Sender Name</th>
              <th>Total Parcels</th>
              <th>Total Charge</th>
            </tr>
          </thead>

          <tbody>

            {topSenders.map((item, index) => (

              <tr key={index}>

                <td>{item.sender_id ?? "-"}</td>

                <td>{item.sender_name ?? "-"}</td>

                <td>{item.total_parcels}</td>

                <td>{item.total_charge ?? 0}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </section>


      {/* SENDER RECEIVER PAIRS */}

      <section className="report-card">

        <h2>2. Sender - Receiver Pairs</h2>

        <table>

          <thead>

            <tr>
              <th>Sender ID</th>
              <th>Sender</th>
              <th>Receiver ID</th>
              <th>Receiver</th>
              <th>Total Parcels</th>
              <th>Total Charge</th>
            </tr>

          </thead>

          <tbody>

            {pairs.map((item, index) => (

              <tr key={index}>

                <td>{item.sender_id ?? "-"}</td>

                <td>{item.sender_name ?? "-"}</td>

                <td>{item.receiver_id ?? "-"}</td>

                <td>{item.receiver_name ?? "-"}</td>

                <td>{item.total_parcels_between_them}</td>

                <td>{item.total_charge_between_them ?? 0}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </section>


      {/* ADDRESS */}

      <section className="report-card">

        <h2>3. Receiver Address-wise Parcel Grouping</h2>

        <table>

          <thead>

            <tr>
              <th>Address</th>
              <th>Total Parcels</th>
              <th>Total Charge</th>
            </tr>

          </thead>

          <tbody>

            {addressReport.map((item, index) => (

              <tr key={index}>

                <td>{item.address ?? "-"}</td>

                <td>{item.total_parcels}</td>

                <td>{item.total_charge ?? 0}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </section>


      {/* SUSPICIOUS */}

      <section className="report-card">

        <h2>4. Suspicious Receivers</h2>

        <table>

          <thead>

            <tr>
              <th>Receiver ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Parcels Received</th>
            </tr>

          </thead>

          <tbody>

            {suspicious.map((item, index) => (

              <tr key={index}>

                <td>{item.receiver_id}</td>

                <td>{item.receiver_name}</td>

                <td>{item.phone}</td>

                <td>{item.total_parcels_received}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </section>


      {/* ZERO ACTIVITY */}

      <section className="report-card">

        <h2>5. Zero Activity Senders</h2>

        <table>

          <thead>

            <tr>
              <th>Sender ID</th>
              <th>Name</th>
              <th>Total Parcels</th>
            </tr>

          </thead>

          <tbody>

            {zeroSenders.map((item, index) => (

              <tr key={index}>

                <td>{item.sender_id ?? "-"}</td>

                <td>{item.sender_name ?? "-"}</td>

                <td>{item.total_parcels}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </section>


      <section className="report-card">

        <h2>6. Zero Activity Receivers</h2>

        <table>

          <thead>

            <tr>
              <th>Receiver ID</th>
              <th>Name</th>
              <th>Total Parcels</th>
            </tr>

          </thead>

          <tbody>

            {zeroReceivers.map((item, index) => (

              <tr key={index}>

                <td>{item.receiver_id ?? "-"}</td>

                <td>{item.receiver_name ?? "-"}</td>

                <td>{item.total_parcels}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </section>


      {/* WEIGHT */}

      <section className="report-card">

        <h2>7. Sender-wise Average Parcel Weight</h2>

        <table>

          <thead>

            <tr>
              <th>Sender ID</th>
              <th>Sender Name</th>
              <th>Total Parcels</th>
              <th>Average Weight</th>
              <th>Minimum Weight</th>
              <th>Maximum Weight</th>
            </tr>

          </thead>

          <tbody>

            {weightReport.map((item, index) => (

              <tr key={index}>

                <td>{item.sender_id ?? "-"}</td>

                <td>{item.sender_name ?? "-"}</td>

                <td>{item.total_parcels}</td>

                <td>{item.avg_weight ?? "-"}</td>

                <td>{item.min_weight ?? "-"}</td>

                <td>{item.max_weight ?? "-"}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </section>


      {/* FULL REPORT */}

      <section className="report-card">

        <h2>8. Full Report</h2>

        <table>

          <thead>

            <tr>
              <th>Sender ID</th>
              <th>Sender</th>
              <th>Receiver ID</th>
              <th>Receiver</th>
              <th>Total Parcels</th>
              <th>Total Revenue</th>
              <th>Average Charge</th>
            </tr>

          </thead>

          <tbody>

            {fullReport.map((item, index) => (

              <tr key={index}>

                <td>{item.sender_id ?? "-"}</td>

                <td>{item.sender_name ?? "-"}</td>

                <td>{item.receiver_id ?? "-"}</td>

                <td>{item.receiver_name ?? "-"}</td>

                <td>{item.total_parcels}</td>

                <td>{item.total_revenue ?? 0}</td>

                <td>{item.avg_charge_per_parcel ?? 0}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </section>

    </div>
  );
}