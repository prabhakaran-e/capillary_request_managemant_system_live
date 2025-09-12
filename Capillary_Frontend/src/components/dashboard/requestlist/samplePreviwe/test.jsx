import React, { useState, useEffect } from "react";
import {
  actionEmailNotifications,
  getAllEmailsByName,
} from "../../../../api/service/adminServices";

const EmailNotificationSettings = () => {
  const [emailSettings, setEmailSettings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAllEmailName = async () => {
      try {
        setIsLoading(true);
        const response = await getAllEmailsByName();
        console.log("Response",response)
        if (response.status === 200) {
          setEmailSettings(response.data.emailData);
        } else {
          console.error("Failed to fetch email settings");
        }
      } catch (error) {
        console.error("Error fetching email settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllEmailName();
  }, []);

  const toggleStatus = async (emailId) => {
    // Find the email to toggle
    const emailToToggle = emailSettings.find(
      (email) => email.emailId === emailId
    );

    if (!emailToToggle) {
      console.error("Email not found");
      return;
    }

    // Create a copy with toggled status to send to API
    const updatedEmailData = {
      ...emailToToggle,
      emailStatus: !emailToToggle.emailStatus,
    };

    // Optimistically update UI
    setEmailSettings((settings) =>
      settings.map((email) =>
        email.emailId === emailId ? { ...email, emailStatus: !email.emailStatus } : email
      )
    );

    try {
      // Pass the updated email data to the API
      const response = await actionEmailNotifications(updatedEmailData);

      // Check the response format based on your API
      if (response.status !== 200) {
        console.error("Failed to update email status");

        // Revert the change if the API call failed
        setEmailSettings((settings) =>
          settings.map((email) =>
            email.emailId === emailId
              ? { ...email, emailStatus: emailToToggle.emailStatus }
              : email
          )
        );
      }
    } catch (error) {
      console.error("Error updating email status:", error);

      // Revert the change if there was an error
      setEmailSettings((settings) =>
        settings.map((email) =>
          email.emailId === emailId
            ? { ...email, emailStatus: emailToToggle.emailStatus }
            : email
        )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-6 text-center">Loading email settings...</div>
    );
  }

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Email Notification Settings
      </h2>

      {emailSettings.length === 0 ? (
        <div className="text-center py-4">No email settings found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                  ID
                </th>
                <th className="p-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                  Notification Name
                </th>
                <th className="p-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                  Status
                </th>
                <th className="p-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {emailSettings.map((email) => (
                <tr
                  key={email.emailId}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="p-3">{email.emailId}</td>
                  <td className="p-3">{email.label}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        email.emailStatus
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {email.emailStatus ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleStatus(email.emailId)}
                      className={`px-3 py-1 rounded-md text-white font-medium transition-colors ${
                        email.emailStatus
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {email.emailStatus ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmailNotificationSettings;
