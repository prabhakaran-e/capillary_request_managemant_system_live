const ssoKey = require("../models/googlessoKey");

const saveNewSSoKey = async (req, res) => {
  try {
    const { key } = req.body;
    console.log("key:", key);

    const existingKey = await ssoKey.findOne({ googleSSOKey: key });

    if (existingKey) {
      return res.status(400).json({ message: "SSO key is already present" });
    }

    const saveKey = await ssoKey.create({ googleSSOKey: key });
    return res
      .status(201)
      .json({ message: "SSO key saved successfully", data: saveKey });
  } catch (err) {
    console.log("Error in saving the request:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getSavedSSoKey = async (req, res) => {
  try {
    const key = await ssoKey.findOne();
    return res.status(200).json({ googleSSOKey: key?.googleSSOKey || null });
  } catch (err) {
    console.log("Error in fetching the SSO key:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const deleteSavedSSoKey = async (req, res) => {
    try {
        const key = await ssoKey.findOne();

        if (!key) {
            return res.status(404).json({ message: "SSO key not found" });
        }

        await ssoKey.deleteOne({ _id: key._id });

        return res.status(200).json({ message: "SSO key deleted successfully" });
    } catch (err) {
        console.log("Error in deleting the SSO key:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = {
  saveNewSSoKey,
  getSavedSSoKey,
  deleteSavedSSoKey
};
