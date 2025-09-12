import React, { useState, useEffect } from "react";
import {
  deleteSmtpConfiguration,
  getSmtpConfig,
  saveSmtpConfiguration,
} from "../../../../api/service/adminServices";

const SmtpPage = () => {
  const empId = localStorage.getItem("capEmpId");
  const [smtpConfig, setSmtpConfig] = useState({
    email: "",
    port: "",
    password: "",
  });
  const [savedConfig, setSavedConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const primaryColor = "#80c242";

  const fetchSmtpConfig = async () => {
    try {
      setLoading(true);
      const response = await getSmtpConfig();
    } catch (err) {
      setError("Failed to fetch SMTP configuration");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSmtpConfig();
  }, []);

  const saveSmtpConfig = async (e) => {
    e.preventDefault();

    if (!smtpConfig.email || !smtpConfig.port || !smtpConfig.password) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage("");

    try {
      const response = await saveSmtpConfiguration(smtpConfig, empId);
    } catch (err) {
      setError("Failed to save SMTP configuration");
      setLoading(false);
    }
  };

  const deleteSmtpConfig = async (id) => {
    if (!savedConfig) return;

    setLoading(true);
    setError(null);
    setMessage("");

    try {
      const response = await deleteSmtpConfiguration(id,empId);

 
    } catch (err) {
      setError("Failed to delete SMTP configuration");
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6" style={{ color: primaryColor }}>
        SMTP Configuration
      </h1>

      {/* Status messages */}
      {message && <p className="text-green-600 mb-4 font-medium">{message}</p>}
      {error && <p className="text-red-500 mb-4 font-medium">{error}</p>}

      {/* Input form */}
      <form onSubmit={saveSmtpConfig} className="mb-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col">
            <label className="mb-1 font-medium" style={{ color: primaryColor }}>
              SMTP Email
            </label>
            <input
              type="email"
              value={smtpConfig.email}
              onChange={(e) =>
                setSmtpConfig({ ...smtpConfig, email: e.target.value })
              }
              placeholder="smtp@example.com"
              className="px-4 py-2 border rounded"
              style={{ borderColor: primaryColor }}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium" style={{ color: primaryColor }}>
              SMTP Port
            </label>
            <input
              type="text"
              value={smtpConfig.port}
              onChange={(e) =>
                setSmtpConfig({ ...smtpConfig, port: e.target.value })
              }
              placeholder="587 or 465"
              className="px-4 py-2 border rounded"
              style={{ borderColor: primaryColor }}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium" style={{ color: primaryColor }}>
              SMTP Password
            </label>
            <input
              type="password"
              value={smtpConfig.password}
              onChange={(e) =>
                setSmtpConfig({ ...smtpConfig, password: e.target.value })
              }
              placeholder="Enter password"
              className="px-4 py-2 border rounded"
              style={{ borderColor: primaryColor }}
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2 rounded text-white font-medium"
          style={{
            backgroundColor: primaryColor,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
          disabled={loading}
        >
          {loading ? "Processing..." : "Save Configuration"}
        </button>
      </form>

      {/* Data table */}
      {savedConfig && (
        <div className="w-full mb-8">
          <h2
            className="text-xl font-semibold mb-3"
            style={{ color: primaryColor }}
          >
            Current SMTP Configuration
          </h2>
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr style={{ backgroundColor: primaryColor, color: "white" }}>
                <th className="border p-2 text-left w-16">SL No.</th>
                <th className="border p-2 text-left">Email</th>
                <th className="border p-2 text-left w-24">Port</th>
                <th className="border p-2 text-left">Password</th>
                <th className="border p-2 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">1</td>
                <td className="border p-2 break-words">{savedConfig.email}</td>
                <td className="border p-2">{savedConfig.port}</td>
                <td className="border p-2">••••••••</td>
                <td className="border p-2 text-center">
                  <button
                    onClick={()=>deleteSmtpConfig(savedConfig._id)}
                    className="px-3 py-1 rounded text-white"
                    style={{ backgroundColor: primaryColor }}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <ul className="mt-8 list-disc pl-5" style={{ color: primaryColor }}>
        <li className="mb-2">
          Configure your SMTP server details for email notifications
        </li>
        <li className="mb-2">
          All fields are required for proper email functionality
        </li>
        <li className="mb-2">Common SMTP ports are 587 (TLS) and 465 (SSL)</li>
        {!savedConfig && (
          <li className="mb-2">No SMTP configuration is currently stored</li>
        )}
      </ul>

      {loading && (
        <div className="text-center mt-4">
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
};

export default SmtpPage;
