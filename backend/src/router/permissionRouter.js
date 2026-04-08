const express = require('express');
const permissionController = require('../controller/permissionController');
const { authMiddleware, adminCheck } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Admin protected routes - Create/Update/Delete permissions
router.post('/create', adminCheck, (req, res, next) => permissionController.createPermission(req, res, next));
router.put('/:permissionId', adminCheck, (req, res, next) => permissionController.updatePermission(req, res, next));
router.delete('/:permissionId', adminCheck, (req, res, next) => permissionController.deletePermission(req, res, next));

// View routes - accessible by authenticated users
router.get('/', (req, res, next) => permissionController.getPermissions(req, res, next));
router.get('/modules', (req, res, next) => permissionController.getModules(req, res, next));
router.get('/module/:module', (req, res, next) => permissionController.getPermissionsByModule(req, res, next));
router.get('/id/:permissionId', (req, res, next) => permissionController.getPermissionById(req, res, next));
router.get('/key/:key', (req, res, next) => permissionController.getPermissionByKey(req, res, next));

module.exports = router;
