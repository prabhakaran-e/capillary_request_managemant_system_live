const CreateNewReq = require("../../models/createNewReqSchema");
const apiCrediantails = require("../../models/apiCrediantails");

const getAllRequestData = async (req, res) => {
  try {
    console.log("Welcome to admin get data");

    const { empEmail, secretKey, apiKey } = req.body;
    console.log("Received credentials:", { empEmail, secretKey, apiKey });

    const existData = await apiCrediantails.findOne({ email: empEmail });
    console.log("Found user data:", existData);

    if (!existData) {
      return res
        .status(403)
        .json({ message: "Unauthorized: API credentials not found" });
    }

    if (existData.secretKey !== secretKey) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Invalid secretKey" });
    }

    if (existData.apiKey !== apiKey) {
      return res.status(403).json({ message: "Unauthorized: Invalid apiKey" });
    }

    const reqList = await CreateNewReq.find().sort({ createdAt: -1 }).lean();

    if (reqList.length === 0) {
      return res.status(404).json({ message: "No requests found" });
    }

    return res.status(200).json({
      message: "Requests fetched successfully",
      data: reqList,
    });
  } catch (err) {
    console.error("Error fetching employee requests:", err);
    return res.status(500).json({
      message: "Error fetching employee requests",
      error: err.message,
    });
  }
};

const getAllRequestDataByStatus = async (req, res) => {
  try {
    console.log("Welcome to admin get data");

    const { empEmail, secretKey, apiKey, status } = req.body;
    console.log("Received credentials:", { empEmail, secretKey, apiKey });

    const existData = await apiCrediantails.findOne({ email: empEmail });
    console.log("Found user data:", existData);

    if (!existData) {
      return res
        .status(403)
        .json({ message: "Unauthorized: API credentials not found" });
    }

    if (existData.secretKey !== secretKey) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Invalid secretKey" });
    }

    if (existData.apiKey !== apiKey) {
      return res.status(403).json({ message: "Unauthorized: Invalid apiKey" });
    }

    if (!status) {
      return res.status(401).json({ message: "Status is missing" });
    }

    const reqList = await CreateNewReq.find({ status: status })
      .sort({ createdAt: -1 })
      .lean();

    if (reqList.length === 0) {
      return res.status(404).json({ message: "No requests found" });
    }

    return res.status(200).json({
      message: "Requests fetched successfully",
      data: reqList,
    });
  } catch (err) {
    console.error("Error fetching employee requests:", err);
    return res.status(500).json({
      message: "Error fetching employee requests",
      error: err.message,
    });
  }
};

const getAllRequestDataById = async (req, res) => {
  try {
    const { empEmail, secretKey, apiKey } = req.body;
    const { reqId } = req.query;

    if (!reqId) {
      return res.status(403).json({ message: "Request Id is required" });
    }
    console.log("Received credentials:", { empEmail, secretKey, apiKey });

    const existData = await apiCrediantails.findOne({ email: empEmail });
    console.log("Found user data:", existData);

    if (!existData) {
      return res
        .status(403)
        .json({ message: "Unauthorized: API credentials not found" });
    }

    if (existData.secretKey !== secretKey) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Invalid secretKey" });
    }

    if (existData.apiKey !== apiKey) {
      return res.status(403).json({ message: "Unauthorized: Invalid apiKey" });
    }

    const reqList = await CreateNewReq.findOne({ reqid: reqId });

    if (!reqList) {
      return res.status(404).json({ message: "No requests found" });
    }

    return res.status(200).json({
      message: "Requests fetched successfully",
      data: reqList,
    });
  } catch (err) {
    console.error("Error fetching employee requests:", err);
    return res.status(500).json({
      message: "Error fetching employee requests",
      error: err.message,
    });
  }
};

const getAllRequestOfEmployee = async (req, res) => {
  try {
    const { empEmail, secretKey, apiKey } = req.body;
    const { userId } = req.query;
    if (!userId) {
      res
        .status(401)
        .json({ message: "Employee Id is required to fetch requests" });
    }
    console.log("Received credentials:", { empEmail, secretKey, apiKey });

    const existData = await apiCrediantails.findOne({ email: empEmail });
    console.log("Found user data:", existData);

    if (!existData) {
      return res
        .status(403)
        .json({ message: "Unauthorized: API credentials not found" });
    }

    if (existData.secretKey !== secretKey) {
      console.log(existData.secretKey !== secretKey);
      return res
        .status(403)
        .json({ message: "Unauthorized: Invalid secretKey" });
    }

    if (existData.apiKey !== apiKey) {
      return res.status(403).json({ message: "Unauthorized: Invalid apiKey" });
    }

    const reqList = await CreateNewReq.find({ userId: userId });

    if (reqList.length===0) {
      return res.status(404).json({ message: "No requests found for this employee" });
    }

    return res.status(200).json({
      message: "Requests fetched successfully",
      data: reqList,
    });
  } catch (err) {
    console.error("Error fetching employee requests:", err);
    return res.status(500).json({
      message: "Error fetching employee requests",
      error: err.message,
    });
  }
};

module.exports = {
  getAllRequestData,
  getAllRequestDataByStatus,
  getAllRequestDataById,
  getAllRequestOfEmployee,
};
