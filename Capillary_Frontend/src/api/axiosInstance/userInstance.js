import axios from "axios";

export const userInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

userInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        localStorage.removeItem("accessToken");
      }


      const errorMessage = data?.message || "An unknown error occurred.";
      console.log("Error Message from Response:", errorMessage);

    
      return Promise.reject(new Error(errorMessage));
    } else {
      console.log("Network/Request Error:", error.message);
      return Promise.reject(new Error(error.message || "An unknown network error occurred."));
    }
  }
);

