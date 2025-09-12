const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const SESSION_KEY = "sessionStartTime";
const AUTH_TOKEN_KEY = "authToken";

// Set the session start time when a user logs in (for new or existing users)
export const setSessionTime = () => {
  const currentTime = Date.now();
  localStorage.setItem(SESSION_KEY, currentTime.toString());
};

// Check if the current session is valid
export const isSessionValid = () => {
  const sessionStartTime = localStorage.getItem(SESSION_KEY);
  if (!sessionStartTime) return false; // No session, session is invalid
  const elapsedTime = Date.now() - parseInt(sessionStartTime, 10);
  return elapsedTime < SESSION_TIMEOUT; // Return true if session is still valid
};

// Clear the session (log out)
export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY); // Clear auth token (if used)
};

// Handle login logic
export const handleLogin = () => {
  // Check if there is no session (new user or expired session)
  if (!localStorage.getItem(SESSION_KEY)) {
    // Set the session start time for new users or after session expiration
    setSessionTime();
  }

  // Optionally store authToken if needed for subsequent requests
  localStorage.setItem(AUTH_TOKEN_KEY, "your-auth-token"); // Replace with your actual token
};

// Handle logout logic
export const handleLogout = () => {
  clearSession(); // Clear session data when the user logs out
  window.location.href = "/login"; // Redirect user to the login page
};

// Check if session is valid during app initialization or on each page load
export const checkSessionOnLoad = () => {
  if (!isSessionValid()) {
    handleLogout(); // Log out user if session is expired
    alert("Session expired, please log in again."); // Display session expired alert (can be replaced by a toast)
  } else {
    // Update the session time if valid
    setSessionTime();
  }
};
