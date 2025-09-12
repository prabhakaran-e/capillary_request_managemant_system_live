import { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import capilary_logo from "../../assets/images/capilary_logo.png";
import { Navigate, useNavigate } from "react-router-dom";
import { verifyUser } from "../../api/service/adminServices";
import { toast, ToastContainer } from "react-toastify";

const HomePage = () => {
  const [showSignInButton, setShowSignInButton] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowSignInButton(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  if (user) return <Navigate to="/dashboard" />;

  const decodeJWT = (token) => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload);
  };

  const handleSuccess = async (credentialResponse) => {
    const user = decodeJWT(credentialResponse.credential);
    const { email } = user;
    localStorage.setItem("email", email);

    try {
      const response = await verifyUser(email);
      if (response.status === 200) {
        localStorage.setItem("userId", response?.data?.data?._id);
        localStorage.setItem("role", response?.data?.data?.role);
        localStorage.setItem("user", JSON.stringify({ ...user }));
        localStorage.setItem("department", response?.data?.data?.department);
        localStorage.setItem("empAccessToken", response?.data?.token);
        localStorage.setItem("capEmpId", response?.data?.data?.employee_id);
        localStorage.setItem("multiRole", response?.data?.multiRole);



        navigate("/dashboard");
      } else if (response.status === 401) {
        toast.error(response.response.data.message);
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (error) {}
  };

  const handleFailure = () => {
    toast.error("Login Failed");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-2/5 bg-primary p-8 md:p-16 flex flex-col relative">
        <div className="relative z-10 flex flex-col flex-grow">
          <div className="flex-grow flex flex-col justify-center">
            <div>
              <h1 className="text-white text-4xl font-sans mb-2">Welcome to</h1>
              <h1 className="text-white text-5xl font-prima font-bold">
                Capillary Technologies
              </h1>
              <p className="text-white opacity-80 mt-4">
                Please sign in to continue
              </p>
            </div>
          </div>

          <div className="mt-auto">
            <a
              href="/"
              className="text-white opacity-80 flex items-center hover:opacity-100 transition-opacity text-sm w-fit"
            >
              <svg
                className="w-4 h-4 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              back to site
            </a>
          </div>
        </div>
      </div>

      <div className="w-full md:w-3/5 bg-white p-8 md:p-12 flex flex-col">
        <div className="flex justify-end mb-16">
          {showSignInButton && (
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleFailure}
              useOneTap
              clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
            />
          )}
        </div>

        <div className="flex justify-center items-center flex-grow">
          <div className="flex items-center">
            <img src={capilary_logo} alt="Capillary Logo" />
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
      />
    </div>
  );
};

export default HomePage;
