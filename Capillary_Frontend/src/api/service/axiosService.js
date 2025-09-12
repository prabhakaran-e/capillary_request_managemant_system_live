import { userInstance } from "../axiosInstance/userInstance";

export const verifyUser = async (email) => {
  try {
    const response = await userInstance.post(`/employees/verify-person`, { email:email });
    return response;
  } catch (err) {
    return err;
  }
};

export const registerUser = async (formData) => {
  try {
    const response = await userInstance.post(`/signup`, formData);
    return response;
  } catch (err) {
    return err;
  }
};

export const fetchUserDetails = async (email) => {
  try {
    const response = await userInstance.post(`/auth/fetchuserData`, email);
    return response;
  } catch (err) {
    return err;
  }
};







