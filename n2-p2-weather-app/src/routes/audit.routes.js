import { Router } from 'express';
import auditController from '../controllers/audit.controller.js';
import {
	validateCreateAudit,
	validateGetAuditById,
	validateGetAllAudits,
	validateGetAuditsByCity,
} from '../middlewares/audit.middleware.js';

const router = Router();

// Crear nueva auditoría meteorológica
router.post('/', validateCreateAudit, auditController.createAudit);

// Obtener todas las auditorías (con paginación)
router.get('/', validateGetAllAudits, auditController.getAllAudits);

// Obtener auditoría por auditId (UUID)
router.get('/:auditId', validateGetAuditById, auditController.getAuditById);

// Obtener auditorías de una ciudad específica
router.get('/:city/:countryCode', validateGetAuditsByCity, auditController.getAuditsByCity);

export default router;
