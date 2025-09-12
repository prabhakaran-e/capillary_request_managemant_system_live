import axios from "axios";

const uploadFiles = async (files, fileType,reqId) => {
  try {
    console.log("files", files);
    const formData = new FormData();

    formData.append("files", files);

    formData.append("fileType", fileType);

    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/upload-s3/upload?reqId=${reqId}`,
      
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const { fileUrls } = response.data;
    console.log("response", response);

    console.log("Uploaded file URLs:", fileUrls);
    return response;
  } catch (error) {
    console.error("Error uploading files:", error);
    throw new Error("Failed to upload files");
  }
};

export default uploadFiles;
