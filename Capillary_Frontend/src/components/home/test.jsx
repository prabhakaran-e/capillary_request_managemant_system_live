import { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import capilary_logo from "../../assets/images/capilary_logo.png";
import { Navigate, useNavigate } from "react-router-dom";
import { verifyUser } from "../../api/service/axiosService";
import { toast } from "react-toastify";
import { verifyToken } from "../../api/service/adminServices";

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

  
  const handleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const response = await verifyToken(credential)

      const { data } = response;
      console.log("Login success full",data)
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role".data.employeeData.role)
        navigate("/dashboard");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to login. Please try again.");
    }
  };

  const handleFailure = () => {
    toast.error("Google login failed.");
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
            <GoogleLogin onSuccess={handleSuccess} onError={handleFailure} />
          )}
        </div>

        <div className="flex justify-center items-center flex-grow">
          <div className="flex items-center">
            <img src={capilary_logo} alt="Capillary Logo" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
