import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const SessionTimeout = () => {
  const navigate = useNavigate();

  // ----------------- Config -----------------
  const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 60 minutes
  const INACTIVITY_WARNING = 1 * 60 * 1000; // 1 minute warning

  const DAILY_LOGOUT_HOUR = 0; // midnight
  const DAILY_LOGOUT_MINUTE = 0;
  const DAILY_WARNING_TIME = 5 * 60 * 1000; // 5 minutes warning for daily logout

  // ----------------- Helper Functions -----------------

  // Update last activity timestamp
  const updateLastActivity = () => {
    localStorage.setItem("lastActivityTime", Date.now().toString());
  };

  // Handle logout
  const handleLogout = (showMessage = false, customMessage = "") => {
    localStorage.clear();
    sessionStorage.clear();

    if (showMessage) {
      Swal.fire({
        title: "Session Expired",
        text: customMessage || "Your session has expired. Please log in again.",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
      }).then(() => {
        navigate("/");
      });
    } else {
      navigate("/");
    }
  };

  // Show warning before logout
  const showWarning = (isDaily = false) => {
    let timeLeft = isDaily ? DAILY_WARNING_TIME / 1000 : INACTIVITY_WARNING / 1000;

    const title = isDaily ? "Daily Session Ending Soon" : "Session Expiring Soon";
    const message = isDaily
      ? `Your daily session will end in <b>${timeLeft}</b> seconds.<br/>Do you want to stay logged in?`
      : `Your session will expire in <b>${timeLeft}</b> seconds.<br/>Do you want to stay logged in?`;

    let timerInterval;

    Swal.fire({
      title: title,
      html: message,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, keep me logged in",
      cancelButtonText: "Logout now",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      timer: timeLeft * 1000,
      timerProgressBar: true,
      didOpen: () => {
        timerInterval = setInterval(() => {
          timeLeft -= 1;
          const content = Swal.getHtmlContainer();
          if (content) {
            const b = content.querySelector("b");
            if (b) b.textContent = timeLeft;
          }
        }, 1000);
      },
      willClose: () => clearInterval(timerInterval),
    }).then((result) => {
      if (result.isConfirmed) {
        // Reset activity timers
        updateLastActivity();
        resetInactivityTimer();
      } else if (result.dismiss === Swal.DismissReason.cancel || result.dismiss === Swal.DismissReason.timer) {
        const msg = isDaily
          ? "Daily session has ended. Please log in again."
          : "Your session has expired. Please log in again.";
        handleLogout(true, msg);
      }
    });
  };

  // ----------------- Inactivity Timer -----------------
  let inactivityTimeout;
  let inactivityWarningTimeout;

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimeout);
    clearTimeout(inactivityWarningTimeout);

    inactivityWarningTimeout = setTimeout(() => showWarning(false), INACTIVITY_TIMEOUT - INACTIVITY_WARNING);
    inactivityTimeout = setTimeout(() => handleLogout(true), INACTIVITY_TIMEOUT);
  };

  // ----------------- Daily Logout Timer -----------------
  let dailyWarningTimeout;
  let dailyLogoutTimeout;

  const setupDailyLogout = () => {
    const now = new Date();
    const nextLogout = new Date();
    nextLogout.setHours(DAILY_LOGOUT_HOUR, DAILY_LOGOUT_MINUTE, 0, 0);

    if (now >= nextLogout) {
      nextLogout.setDate(nextLogout.getDate() + 1);
    }

    const timeUntilLogout = nextLogout - now;

    // Warning
    const warningTime = Math.max(timeUntilLogout - DAILY_WARNING_TIME, 0);
    dailyWarningTimeout = setTimeout(() => showWarning(true), warningTime);

    // Logout
    dailyLogoutTimeout = setTimeout(() => {
      handleLogout(true, "Daily session has ended. Please log in again.");
      setupDailyLogout(); // Reset for next day
    }, timeUntilLogout);
  };

  // ----------------- Effect -----------------
  useEffect(() => {
    const userId = localStorage.getItem("capEmpId");
    if (!userId) {
      navigate("/");
      return;
    }

    updateLastActivity();
    resetInactivityTimer();
    setupDailyLogout();

    const events = ["mousemove", "mousedown", "keypress", "scroll", "touchstart", "click"];
    const handleUserActivity = () => {
      if (localStorage.getItem("capEmpId")) {
        updateLastActivity();
        resetInactivityTimer();
      }
    };
    events.forEach((event) => window.addEventListener(event, handleUserActivity));

    const handleVisibilityChange = () => {
      if (!document.hidden && localStorage.getItem("capEmpId")) {
        updateLastActivity();
        resetInactivityTimer();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleUserActivity));
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(inactivityTimeout);
      clearTimeout(inactivityWarningTimeout);
      clearTimeout(dailyWarningTimeout);
      clearTimeout(dailyLogoutTimeout);
    };
  }, [navigate]);

  return null;
};

export default SessionTimeout;
