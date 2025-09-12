const Entity = require("../models/entityModel");
const Employee = require("../models/empModel");
const addPanelUser = require("../models/addPanelUsers");
const Approver = require("../models/approverSchema");
const darwinBox = require("../models/isDarwinEnabled");
const CreateNewReq = require("../models/createNewReqSchema");

// Create a new entity
exports.createEntity = async (req, res) => {
  try {
    const { data } = req.body;
    console.log("Create Entity Request:", data);
    const entity = new Entity(data);
    await entity.save();
    res.status(201).json({ message: "Entity created successfully", entity });
  } catch (error) {
    console.error("Error creating entity:", error);
    res.status(400).json({ message: "Entity creation failed" });
  }
};

exports.getEntityNames = async (req, res) => {
  try {
    const entities = await CreateNewReq.distinct("commercials.entity");
    const departments = await CreateNewReq.distinct("commercials.department");

    res.status(200).json({
      success: true,
      entities,
      departments,
    });
  } catch (error) {
    console.error("Error fetching entities and departments:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve data" });
  }
};



exports.getAllEntities = async (req, res) => {
  try {
    const { empId } = req.params;
    console.log("empId-->", empId);

    const darwinStatus = await darwinBox.findOne();
    const entities = await Entity.find();

    const empData =
      (await addPanelUser.findOne(
        { _id: empId },
        { employee_id: 1, department: 1 }
      )) ||
      (await Employee.findOne(
        { _id: empId },
        { employee_id: 1, department: 1 }
      ));

    const { isDarwinEnabled } = darwinStatus;
    let departmentHod =[];
    let isDropDown;

    if (!isDarwinEnabled) {
      departmentHod = await Employee.find(
        { employee_id: empData.employee_id },
        { hod: 1, hod_email_id: 1, department: 1 }
      );
      isDropDown = false;
    } else {
      // console.log("empData.department", empData.department);



      const departmentData = await Approver.find({},
        { departments: 1,businessUnit: 1 } 
      );

     

      departmentHod = [];

      if (departmentData.length > 0) {
        departmentData.forEach((doc) => {
          console.log("DOC",doc)
          doc.departments.forEach((matchedDepartment) => {
            departmentHod.push(
              ...matchedDepartment.approvers.map((item) => ({
                businessUnit:doc.businessUnit,
                department: matchedDepartment.name,
                hod: item.approverName,
                hod_email_id: item.approverEmail,
                approverId: item.approverId,
              }))
            );
          });
        });
      }

      isDropDown = true;
    }

    // console.log("departmentHod", departmentHod);

    res
      .status(200)
      .json({ entities: entities, department: departmentHod, isDropDown });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEntityById = async (req, res) => {
  try {
    const entity = await Entity.findOne({ _id: req.params.id });
    if (!entity) return res.status(404).json({ message: "Entity not found" });
    res.status(200).json(entity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an entity by ID
exports.updateEntity = async (req, res) => {
  try {
    console.log(req.params.id, req.body);
    const entity = await Entity.findOneAndUpdate(
      { _id: req.params.id },
      req.body.data,
      {
        new: true,
        runValidators: true, 
      }
    );
    if (!entity) return res.status(404).json({ message: "Entity not found" });
    res.status(200).json({ message: "Entity updated successfully", entity });
  } catch (error) {
    console.log("Error in updating entity", err);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteEntity = async (req, res) => {
  try {
    const entity = await Entity.findOneAndDelete({ _id: req.params.id });
    if (!entity) return res.status(404).json({ message: "Entity not found" });
    res.status(200).json({ message: "Entity deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateManyEntities = async (req, res) => {
  try {
    const { filter, update } = req.body;

    const result = await Entity.updateMany(filter, update);

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "No entities matched the filter criteria" });
    }

    res.status(200).json({ message: "Entities updated successfully", result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
