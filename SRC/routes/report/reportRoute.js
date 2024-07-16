import express from 'express';
import { 
    getReport, 
    getAllReports, 
    updateReport, 
    deleteReport, 
    deleteYourReport
} from '../../controllers/report.Controller.js';
import protectRoute from '../../middlewares/protectRoute.js';
import { checkAdminRole } from '../../middlewares/checkAdminRole.js';

const router = express.Router();

router.get('/report/:id', getReport);
router.get('/reports', getAllReports);
router.put('/report/:id', protectRoute, updateReport);
router.delete('/report/:id', checkAdminRole('admin'), deleteReport);
router.delete('/report/:id', protectRoute, deleteYourReport)

export default router;
