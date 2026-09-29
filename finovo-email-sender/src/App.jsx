import { useState } from "react";
import * as XLSX from "xlsx";
import "./App.css";

function App() {
  const App_Url = import.meta.env.VITE_API_URL;
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [subject, setSubject] = useState(
    "This change could help you win more bookings",
  );
  const [body, setBody] = useState(`
<p>Hi {first_name},</p>

<p>
  When a traveler changes a booking, does your team need to update the itinerary,
  payment details, and customer communication in separate places?
</p>

<p>
  At <strong>Finovo Global</strong>, we build booking management software and
  mobile apps for travel agencies.
</p>

<p>
  Would you be open to a 15-minute call next week to discuss how your agency
  currently handles booking changes?
</p>

<p>
  Best regards,<br>
  <strong>Roman</strong><br>
  Business Development Manager<br>
  Finovo Global<br>
  Call / WhatsApp: +966 53 756 5438<br>
  Riyadh, Saudi Arabia
</p>

<p>
  <a href="https://finovoglobal.com">
    Visit Our Website
  </a>
</p>

<a href="https://finovoglobal.com">
  <img
    src="https://finovoglobal.com/public/assets/imgs/finallogoblack.png"
    width="192"
    height="67"
    alt="Finovo Global"
  />
</a>
`);
  const [status, setStatus] = useState("Ready");

  const addRecipients = () => {
    if (!email.trim() || !firstname.trim()) {
      alert("Enter both Email and First Name.");
      return;
    }

    const newRecipients = {
      id: Date.now(),
      email: email.trim(),
      firstname: firstname.trim(),
      status: "Pending",
      sentAt: "",
      error: "",
    };

    setRecipients((prev) => [...prev, newRecipients]);
    setEmail("");
    setFirstname("");

    setStatus(`${recipients.length + 1} recipient(s) added`);
  };

  const clearRecipients = () => {
    setRecipients([]);
    setStatus("Recipients cleared");
  };

  const downloadExcel = () => {
    if (recipients.length === 0) {
      alert("No recicpients to export.");
      return;
    }

    const excelData = recipients.map((recipient) => ({
      "First Name": recipient.firstname,
      Email: recipient.email,
      EmailSent: "Yes",
      Status: recipient.status,
      Date: recipient.sentAt
        ? new Date(recipient.sentAt).toLocaleDateString()
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Email Records");

    XLSX.writeFile(workbook, "Finovo_Email_Records.xlsx");

    setStatus("Excel downloaded successfully");
  };

  const previewBody = body.replace(
    /\{first_name\}/g,
    firstname || "{first_name}",
  );

  const deleteRecipient = (id) => {
    setRecipients((prev) => prev.filter((recipient) => recipient.id !== id));

    setStatus("Recipient deleted");
  };
  const sendAllEmails = async () => {
    if (recipients.length === 0) {
      alert("No recipients added.");
      return;
    }

    setStatus("Sending emails...");

    for (const recipient of recipients) {
      // Set current recipient to Sending
      setRecipients((prev) =>
        prev.map((item) =>
          item.id === recipient.id
            ? { ...item, status: "Sending", error: "" }
            : item,
        ),
      );

      try {
        const response = await fetch(`${App_Url}/api/send-mail`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: recipient.email,
            firstname: recipient.firstname,
            subject: subject,
            body: body,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to send email");
        }

        // Mark as Sent
        setRecipients((prev) =>
          prev.map((item) =>
            item.id === recipient.id
              ? {
                  ...item,
                  status: "Sent",
                  sentAt: data.sentAt || new Date().toISOString(),
                  error: "",
                }
              : item,
          ),
        );

        setStatus(`Sent: ${recipient.email}`);
      } catch (error) {
        console.error(error);

        // Mark as Failed
        setRecipients((prev) =>
          prev.map((item) =>
            item.id === recipient.id
              ? {
                  ...item,
                  status: "Failed",
                  error: error.message,
                }
              : item,
          ),
        );

        setStatus(`Failed: ${recipient.email}`);
      }
    }

    setStatus("All emails processed.");
  };
  return (
    <div className="app">
      <div className="container">
        <h1>Finovo Email Sender</h1>

        <div className="input-group">
          <label>Subject</label>

          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject"
          />
        </div>

        {/* ADD RECIPIENT */}

        <div className="input-section">
          <div className="input-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="client@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>First Name</label>

            <input
              type="text"
              placeholder="John"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
            />
          </div>

          <button className="add-button" onClick={addRecipients}>
            + Add
          </button>
        </div>

        {/* RECIPIENTS */}

        <div className="section-header">
          <h2>Recipients</h2>

          <button className="clear-button" onClick={clearRecipients}>
            Clear All
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>First Name</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {recipients.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty">
                    No recipients added
                  </td>
                </tr>
              ) : (
                recipients.map((recipient) => (
                  <tr key={recipient.id}>
                    <td>{recipient.email}</td>

                    <td>{recipient.firstname}</td>

                    <td>
                      <span
                        className={`status ${recipient.status.toLowerCase()}`}
                      >
                        {recipient.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="delete-button"
                        onClick={() => deleteRecipient(recipient.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* EMAIL BODY */}

        <h2>Email Body</h2>

        <div className="input-group">
          <label>Email Body</label>

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows="15"
            placeholder="Write your email body..."
          />
        </div>

        {/* SEND */}

        <div className="actions">
          <button className="send-button" onClick={sendAllEmails}>
            SEND ALL EMAILS
          </button>

          <button className="excel-button" onClick={downloadExcel}>
            DOWNLOAD EXCEL
          </button>
        </div>

        {/* STATUS */}

        <div className="app-status">{status}</div>
      </div>
    </div>
  );
}

export default App;
