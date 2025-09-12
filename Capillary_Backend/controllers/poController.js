const poModel = require("../models/purchaseOrderDataManagerModel");

const savePoData = async (req, res) => {
  try {
    const { empId } = req.params;
    const { poData } = req.body;

    if (poData.poValue) {
      poData.poValue = Number(poData.poValue);
    }

    if (poData.monthlyData) {
      for (const key in poData.monthlyData) {
        if (poData.monthlyData[key].amount) {
          poData.monthlyData[key].amount = Number(
            poData.monthlyData[key].amount
          );
        }
      }
    }

    const newPO = new poModel({
      ...poData,
      createdBy: empId,
    });

    await newPO.save();

    res.status(201).json({
      success: true,
      message: "Purchase Order saved successfully",
      data: newPO,
    });
  } catch (err) {
    console.error("Error saving PO:", err);
    res.status(500).json({
      success: false,
      message: "Failed to save purchase order",
      error: err.message,
    });
  }
};

const getPoData = async (req, res) => {
  try {
    const poData = await poModel.find();
    res.status(200).json(poData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deletePoData = async (req, res) => {
  try {
    const { id, empId } = req.params;

    if (!id || !empId) {
      return res.status(400).json({
        success: false,
        message: "PO ID and Employee ID are required",
      });
    }

    // Find the PO first
    const po = await poModel.findById(id);

    if (!po) {
      return res.status(404).json({
        success: false,
        message: "Purchase Order not found",
      });
    }

    // Ensure only the creator can delete it
    if (po.createdBy.toString() !== empId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this PO",
      });
    }

    await poModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Purchase Order deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting PO:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete purchase order",
      error: err.message,
    });
  }
};

const updatePoData = async (req, res) => {
  try {
    const { id, empId } = req.params;
    const { newEntry } = req.body;

    if (!id || !empId) {
      return res.status(400).json({
        success: false,
        message: "PO ID and Employee ID are required",
      });
    }

    if (!newEntry) {
      return res.status(400).json({
        success: false,
        message: "No update data provided",
      });
    }

    const po = await poModel.findById(id);

    if (!po) {
      return res.status(404).json({
        success: false,
        message: "Purchase Order not found",
      });
    }

    if (po.createdBy.toString() !== empId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this PO",
      });
    }

    if (newEntry.poValue !== undefined && newEntry.poValue !== null) {
      newEntry.poValue = Number(newEntry.poValue);
    }

    if (newEntry.monthlyData) {
      for (const key in newEntry.monthlyData) {
        const amount = newEntry.monthlyData[key].amount;
        if (amount !== undefined && amount !== null) {
          newEntry.monthlyData[key].amount = Number(amount);
        }
      }
    }

    const updatedPO = await poModel.findByIdAndUpdate(
      id,
      { $set: newEntry },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Purchase Order updated successfully",
      data: updatedPO,
    });
  } catch (err) {
    console.error("Error updating PO:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update purchase order",
      error: err.message,
    });
  }
};

module.exports = {
  updatePoData,
  deletePoData,
  savePoData,
  getPoData,
};
