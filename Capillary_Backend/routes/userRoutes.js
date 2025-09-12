// routes/userRoutes.js
const express = require('express');
const {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateManyUsers,
    verifyToken
} = require('../controllers/userController');
const router = express();






router.post("/verify-token", verifyToken);
router.post('/signup', createUser); 
router.get('/get-users', getAllUsers); 
router.get('/get/:id', getUserById); 
router.put('/update/:id', updateUser);
router.delete('/delete/:id', deleteUser); 
router.put('/update-many', updateManyUsers); 
// router.delete('/delete-many', deleteManyUsers); 

module.exports = router;
