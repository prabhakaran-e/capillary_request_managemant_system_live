import React, { useState, useEffect } from "react";
import {
  deleteSSOKey,
  getSSOKey,
  saveNewSSoKey,
} from "../../../../api/service/adminServices";

const GoogleSSO = () => {
  const [authKey, setAuthKey] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const primaryColor = "#80c242";
  const primaryLightColor = "#80c242";
  const primaryDarkColor = "#80c242";

  useEffect(() => {
    const fetchKey = async () => {
      try {
        setLoading(true);
        const response = await getSSOKey();
        console.log("response", response.data.googleSSOKey);

        // If key exists, set it to data but NOT to authKey input
        if (response.data && response.data.googleSSOKey) {
          setData({
            key: response.data.googleSSOKey,
          });
          // Removed: setAuthKey(response.data.googleSSOKey);
        }
      } catch (err) {
        console.error("Error fetching key:", err);
        setError("Failed to fetch existing key");
      } finally {
        setLoading(false);
      }
    };

    fetchKey();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!authKey.trim()) {
      setError("Please enter an authentication key");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage("");

    try {
      const response = await saveNewSSoKey(authKey);
      console.log(response);

      // Update the data state with the new key
      setData({
        key: authKey,
      });

      setMessage("Authentication key saved successfully!");
      setAuthKey(""); // Clear input after submission
    } catch (err) {
      setError(err.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  // Function to delete the entry
  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    setMessage("");

    try {
      const response = await deleteSSOKey();
      console.log(response);

      if (response && response.status === 200) {
        setData(null);
        setAuthKey("");
        setMessage("Authentication key deleted successfully!");
      } else {
        throw new Error("Failed to delete entry");
      }
    } catch (err) {
      setError(err.message || "An error occurred while deleting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6" style={{ color: primaryColor }}>
        Google SSO Authentication
      </h1>

      {/* Status messages */}
      {message && <p className="text-green-600 mb-4 font-medium">{message}</p>}
      {error && <p className="text-red-500 mb-4 font-medium">{error}</p>}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="mb-8 w-full">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={authKey}
            onChange={(e) => setAuthKey(e.target.value)}
            placeholder="Enter authentication key"
            className="px-4 py-2 border rounded flex-grow"
            style={{ borderColor: primaryColor }}
          />
          <button
            type="submit"
            className="px-6 py-2 rounded text-white font-medium"
            style={{
              backgroundColor: primaryColor,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
            disabled={loading}
          >
            {loading ? "Processing..." : "Submit"}
          </button>
        </div>
      </form>

      {/* Data table - Always show if we have data */}
      {data && (
        <div className="w-full mb-8">
          <h2
            className="text-xl font-semibold mb-3"
            style={{ color: primaryColor }}
          >
            Current Authentication Key
          </h2>
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr
                style={{ backgroundColor: primaryLightColor, color: "white" }}
              >
                <th className="border p-2 text-left w-16">SL No.</th>
                <th className="border p-2 text-left">Auth Key</th>
                <th className="border p-2 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">1</td>
                <td className="border p-2 break-words">{data.key}</td>
                <td className="border p-2 text-center">
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1 rounded text-white"
                    style={{ backgroundColor: primaryDarkColor }}
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
          Enter your Google SSO authentication key in the field above
        </li>
        <li className="mb-2">The system will store only one key at a time</li>
        {!data && (
          <li className="mb-2">No authentication key is currently stored</li>
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

export default GoogleSSO;
