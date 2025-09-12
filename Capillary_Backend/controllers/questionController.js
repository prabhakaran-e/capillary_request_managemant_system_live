const Question = require("../models/questionModel");
const employeeSchema = require("../models/empModel");
const addPanelUsers = require("../models/addPanelUsers");

const createQuestion = async (req, res) => {
  try {
    console.log("Create Question Request:", req.body);

    const { id,role } = req.params;

    let empData =
      (await employeeSchema
        .findOne(
          { _id: id },
          {
            full_name: 1,
            employee_id: 1,
            department: 1,
            hod: 1,
            hod_email_id: 1,
          }
        )
        .lean()) || (await addPanelUsers.findOne({ _id: id }).lean());

    if (!empData) {
      return res.status(404).json({ message: "Employee not found" });
    }

    console.log("Employee Data:", empData);

    const questionData = {
      ...req.body,
      createdBy: {
        empName: empData.name,
        department: role,
      },
    };

    const question = new Question(questionData);

    await question.save();

    res
      .status(201)
      .json({ message: "Question created successfully", question });
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(400).json({ message: error.message });
  }
};


const getMyQuestion = async (req, res) => {
  try {
    const { empId, role } = req.params;
    console.log("Employee ID:", empId);

    let empData = await employeeSchema.findOne(
      { _id: empId },
      { department: 1 }
    );

    if (!empData) {
      const panelUsers = await addPanelUsers
        .findOne(
          { _id: empId },
          { _id: 1, full_name: 1, department: 1, role: 1 }
        )
        .lean();
      if (!panelUsers) {
        return res.status(404).json({ message: "Employee not found" });
      } else {
        empData = panelUsers;
      }
    }

    console.log("Employee Department:", empData.department);

    const questionData = await Question.find({
      "createdBy.department": role
    });

    if (questionData.length === 0) {
      return res
        .status(200)
        .json({ message: "No questions found for this department" });
    }

    console.log("Questions Data:", questionData);

    res
      .status(200)
      .json({ message: "Questions fetched successfully", data: questionData });
  } catch (err) {
    console.error("Error in fetching the questions:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

const getAllQuestions = async (req, res) => {
  try {
    const questionData = await Question.find();

    if (questionData.length === 0) {
      return res
        .status(200)
        .json({ message: "No questions found for this department" });
    }

    console.log("Questions Data:", questionData);

    res
      .status(200)
      .json({ message: "Questions fetched successfully", data: questionData });
  } catch (err) {
    console.error("Error in fetching the questions:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

const updateQuestionVisibility = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await Question.findById(questionId);
    console.log("question", question);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const updatedStatus = !question.status;

    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { $set: { status: updatedStatus } },
      { new: true }
    );

    res.status(200).json({
      message: "Question visibility updated successfully",
      data: updatedQuestion,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllLegalQuestions = async (req, res) => {
  try {
    const getQuestionData = await Question.find({ status: true });
    console.log(getQuestionData);
    return res.status(200).json({
      success: true,
      data: getQuestionData,
    });
  } catch (err) {
    console.log("Error in fetching the questions", err);
    return res.status(500).json({
      success: false,
      message: "Error in fetching the questions",
      error: err.message,
    });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { quesId } = req.params;

    const deletedQuestion = await Question.findByIdAndDelete(quesId);

    if (!deletedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res
      .status(200)
      .json({ message: "Question deleted successfully", deletedQuestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = {
  createQuestion,
  getMyQuestion,
  updateQuestionVisibility,
  getAllLegalQuestions,
  getAllQuestions,
  deleteQuestion,
};
