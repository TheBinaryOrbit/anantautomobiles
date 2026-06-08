const express = require('express');
const permissionController = require('../controller/permissionController');
const { authMiddleware, checkPermission } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Admin-level systemic roles mutations
router.post('/create', checkPermission('role_manage'), (req, res, next) => permissionController.createPermission(req, res, next));
router.put('/:permissionId', checkPermission('role_manage'), (req, res, next) => permissionController.updatePermission(req, res, next));
router.delete('/:permissionId', checkPermission('role_manage'), (req, res, next) => permissionController.deletePermission(req, res, next));

// View configurations - unlocked for any authorized workforce session
router.get('/', (req, res, next) => permissionController.getPermissions(req, res, next));
router.get('/modules', (req, res, next) => permissionController.getModules(req, res, next));
router.get('/module/:module', (req, res, next) => permissionController.getPermissionsByModule(req, res, next));
router.get('/id/:permissionId', (req, res, next) => permissionController.getPermissionById(req, res, next));
router.get('/key/:key', (req, res, next) => permissionController.getPermissionByKey(req, res, next));

module.exports = router;