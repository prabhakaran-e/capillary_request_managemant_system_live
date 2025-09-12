const express = require('express');
const {
    createEntity,
    getAllEntities,
    getEntityById,
    updateEntity,
    deleteEntity,
    updateManyEntities,
    getEntityNames
} = require('../controllers/entityController');

const router = express.Router(); 



router.post('/create', createEntity); 
router.get('/get-all/:empId', getAllEntities); 
router.get('/update-many', updateManyEntities);

router.get('/get/:id', getEntityById);
router.put('/update/:id', updateEntity);
router.delete('/delete/:id', deleteEntity); 
router.get('/get-entity-name', getEntityNames);

// Uncomment this if bulk deletion is required
// router.delete('/delete-many', deleteManyEntities);

module.exports = router;
