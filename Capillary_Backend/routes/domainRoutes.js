const express = require('express');
const {
    createDomain,
    getAllDomains,
    getDomainById,
    updateDomain,
    deleteDomain,
    updateManyDomains,
    updateDomainStatus,
} = require('../controllers/domainController');

const router = express.Router(); 


router.post('/create', createDomain);
router.get('/get-all', getAllDomains); 
router.get('/get/:id', getDomainById); 
router.put('/update/:id', updateDomain);
router.delete('/delete/:id', deleteDomain); 
router.put('/update-many', updateManyDomains);
router.put('/update-status/:id', updateDomainStatus);



module.exports = router;
