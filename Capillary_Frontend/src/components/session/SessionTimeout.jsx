import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const SessionTimeout = () => {
  const [isInactive, setIsInactive] = useState(false);
  const navigate = useNavigate();
  const TIMEOUT_DURATION = 15 * 60 * 1000;
  const WARNING_TIME = 1 * 60 * 1000;

  // Daily logout configuration
  const DAILY_LOGOUT_HOUR = 0; // 0 = midnight (24-hour format)
  const DAILY_LOGOUT_MINUTE = 0; // minute within the hour
  const DAILY_WARNING_TIME = 5 * 60 * 1000; // 5 minutes warning for daily logout

  // Get next daily logout time (midnight by default)
  const getNextDailyLogoutTime = () => {
    const now = new Date();
    const nextLogout = new Date();
    
    nextLogout.setHours(DAILY_LOGOUT_HOUR, DAILY_LOGOUT_MINUTE, 0, 0);
    
    // If current time has passed today's logout time, set for tomorrow
    if (now >= nextLogout) {
      nextLogout.setDate(nextLogout.getDate() + 1);
    }
    
    return nextLogout.getTime();
  };

  // Check if user is authenticated and session is valid
  const checkAuthentication = () => {
    const userData = localStorage.getItem("capEmpId");
    const lastActivityTime = localStorage.getItem("lastActivityTime");
    const sessionStartTime = localStorage.getItem("sessionStartTime");
    const hasRefreshed = sessionStorage.getItem("hasRefreshed");

    // Handle one-time refresh
    if (userData && !hasRefreshed) {
      sessionStorage.setItem("hasRefreshed", "true");
      window.location.reload();
      return;
    }

    // If no user data, just redirect without showing expired message
    if (!userData) {
      navigate("/");
      return;
    }

    const now = Date.now();
    
    // Check if we've passed the daily logout time
    if (sessionStartTime) {
      const startTime = parseInt(sessionStartTime);
      const sessionDate = new Date(startTime);
      const currentDate = new Date(now);
      
      // Check if it's past the logout time for today
      const todayLogoutTime = new Date();
      todayLogoutTime.setHours(DAILY_LOGOUT_HOUR, DAILY_LOGOUT_MINUTE, 0, 0);
      
      // If session started on a different day or we're past logout time
      if (sessionDate.getDate() !== currentDate.getDate() || 
          (currentDate >= todayLogoutTime && sessionDate < todayLogoutTime)) {
        handleLogout(true, "Daily session expired. Please log in again.");
        return;
      }
    }

    // For existing users, check if session has expired (15 minutes inactivity)
    if (lastActivityTime) {
      const timeSinceLastActivity = now - parseInt(lastActivityTime);
      if (timeSinceLastActivity > TIMEOUT_DURATION) {
        handleLogout(true); // Pass true to show expiration message
      }
    } else {
      // If user is logged in but no activity time, initialize it
      updateLastActivity();
    }

    // Initialize session start time if not exists
    if (!sessionStartTime) {
      localStorage.setItem("sessionStartTime", now.toString());
    }
  };

  const handleLogout = (showExpirationMessage = false, customMessage = "") => {
    localStorage.clear();
    sessionStorage.clear(); // Clear session storage as well

    if (showExpirationMessage) {
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

  // Updated warning function to handle both types of timeouts
  const showWarning = (isDailyLogout = false) => {
    let timerInterval;
    let timeLeft = isDailyLogout ? 300 : 60; // 5 minutes for daily, 1 minute for inactivity
    const warningDuration = timeLeft * 1000;

    const title = isDailyLogout ? "Daily Session Ending Soon" : "Session Expiring Soon";
    const message = isDailyLogout 
      ? `Your daily session will end in <b>${timeLeft}</b> seconds for the nightly reset.<br/>Would you like to continue working?`
      : `Your session will expire in <b>${timeLeft}</b> seconds.<br/>Would you like to stay logged in?`;

    Swal.fire({
      title: title,
      html: message,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, keep me logged in",
      cancelButtonText: "Logout now",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      timer: warningDuration,
      timerProgressBar: true,
      didOpen: () => {
        timerInterval = setInterval(() => {
          timeLeft -= 1;
          const content = Swal.getHtmlContainer();
          if (content) {
            const b = content.querySelector("b");
            if (b) {
              b.textContent = timeLeft;
            }
          }
        }, 1000);
      },
      willClose: () => {
        clearInterval(timerInterval);
      },
    }).then((result) => {
      if (result.isConfirmed) {
        if (isDailyLogout) {
          // Reset session for new day
          localStorage.setItem("sessionStartTime", Date.now().toString());
        }
        resetTimer();
        updateLastActivity();
      } else if (
        result.dismiss === Swal.DismissReason.timer ||
        result.dismiss === Swal.DismissReason.cancel
      ) {
        const logoutMessage = isDailyLogout 
          ? "Daily session has ended. Please log in again."
          : "Your session has expired. Please log in again.";
        handleLogout(true, logoutMessage);
      }
    });
  };

  const updateLastActivity = () => {
    localStorage.setItem("lastActivityTime", Date.now().toString());
  };

  useEffect(() => {
    let timeout;
    let warningTimeout;
    let activityTimer;
    let dailyTimeout;
    let dailyWarningTimeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      clearTimeout(warningTimeout);
      clearTimeout(activityTimer);
      clearTimeout(dailyTimeout);
      clearTimeout(dailyWarningTimeout);

      // Set up regular inactivity timeout (15 minutes)
      warningTimeout = setTimeout(() => {
        showWarning(false);
      }, TIMEOUT_DURATION - WARNING_TIME);

      timeout = setTimeout(() => {
        setIsInactive(true);
        handleLogout(true);
      }, TIMEOUT_DURATION);

      activityTimer = setTimeout(() => {
        setIsInactive(false);
      }, 1000);

      // Set up daily logout timeout
      const now = Date.now();
      const nextDailyLogout = getNextDailyLogoutTime();
      const timeUntilDailyLogout = nextDailyLogout - now;

      if (timeUntilDailyLogout > DAILY_WARNING_TIME) {
        dailyWarningTimeout = setTimeout(() => {
          showWarning(true);
        }, timeUntilDailyLogout - DAILY_WARNING_TIME);

        dailyTimeout = setTimeout(() => {
          setIsInactive(true);
          handleLogout(true, "Daily session has ended. Please log in again.");
        }, timeUntilDailyLogout);
      } else {
        // If we're within warning time of daily logout, show warning immediately
        showWarning(true);
      }
    };

    const handleUserActivity = () => {
      if (localStorage.getItem("capEmpId")) {
        resetTimer();
        updateLastActivity();
      }
    };

    const events = [
      "mousemove",
      "mousedown",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    checkAuthentication();

    if (localStorage.getItem("capEmpId")) {
      events.forEach((event) => {
        window.addEventListener(event, handleUserActivity);
      });

      resetTimer();
      updateLastActivity();
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && localStorage.getItem("capEmpId")) {
        checkAuthentication();
        resetTimer();
        updateLastActivity();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(timeout);
      clearTimeout(warningTimeout);
      clearTimeout(activityTimer);
      clearTimeout(dailyTimeout);
      clearTimeout(dailyWarningTimeout);
    };
  }, [navigate]);

  return null;
};

export default SessionTimeout;