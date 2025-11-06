const SESSION_TIMEOUT = 30 * 60 * 1000;
const SESSION_KEY = "sessionStartTime";
const AUTH_TOKEN_KEY = "authToken";


export const setSessionTime = () => {
  const currentTime = Date.now();
  localStorage.setItem(SESSION_KEY, currentTime.toString());
};


export const isSessionValid = () => {
  const sessionStartTime = localStorage.getItem(SESSION_KEY);
  if (!sessionStartTime) return false;
  const elapsedTime = Date.now() - parseInt(sessionStartTime, 10);
  return elapsedTime < SESSION_TIMEOUT;
};


export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
};


export const handleLogin = () => {

  if (!localStorage.getItem(SESSION_KEY)) {

    setSessionTime();
  }


  localStorage.setItem(AUTH_TOKEN_KEY, "userId");
};


export const handleLogout = () => {
  clearSession();
  window.location.href = "/";
};


export const checkSessionOnLoad = () => {
  if (!isSessionValid()) {
    handleLogout();
    alert("Session expired, please log in again.");
  } else {

    setSessionTime();
  }
};
