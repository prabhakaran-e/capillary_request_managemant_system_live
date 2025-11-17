import axios from "axios";

export const adminServices = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL_SANDBOX,
});

adminServices.interceptors.request.use(
  (config) => {
    const empToken = localStorage.getItem("empAccessToken");
    const extractedToken = empToken ? empToken : null; 

    if (extractedToken) {
      config.headers.Authorization = `Bearer ${extractedToken}`;
    }

    return config;
  },
  (error) => {
    console.log("Error in Axios interceptor request", error);
    return Promise.reject(error);
  }
);

adminServices.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.log("Error in Axios interceptor response", error);

      const { status, data } = error.response;
      const errorMessage = data?.message || "An unknown error occurred"; 
      console.log("Error response:", errorMessage);

      if (status === 401 && errorMessage === "Session Time Out") {
        localStorage.removeItem("empAccessToken");
        console.log("Token removed due to session timeout.");
      }

      return Promise.reject(error); 
    } else {
      console.log("Error:", error.message);
      return Promise.reject(error);
    }
  }
);
