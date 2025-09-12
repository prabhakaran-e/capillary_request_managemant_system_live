const express = require('express');

const questionController = require("../controllers/questionController")

const router = express.Router(); // Use Router() for modular routing


// Define routes
router.post('/create-new-question/:id/:role', questionController.createQuestion);
router.get('/get-my-question/:empId/:role', questionController.getMyQuestion);
router.get('/get-all-question', questionController.getAllQuestions);

router.put('/update-question-visibility/:questionId', questionController.updateQuestionVisibility);
router.get('/get-all-legal-questions', questionController.getAllLegalQuestions);
router.delete('/delete-my-question/:quesId', questionController.deleteQuestion);




// router.get('/get-all', getAllQuestions); 
// router.get('/get/:id', getQuestionById); 
// router.put('/update/:id', updateQuestion); 
// router.delete('/delete/:id', deleteQuestion); 
// router.put('/update-many', updateManyQuestions); 
// router.put('/update-status/:id',updateQuestionStatus);

// Uncomment this if bulk deletion is required
// router.delete('/delete-many', deleteManyQuestions);

module.exports = router;
