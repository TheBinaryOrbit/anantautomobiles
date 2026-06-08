const express = require('express');
const userController = require('../controller/userController');
const { authMiddleware, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Public route - Login
router.post('/login', (req, res, next) => userController.login(req, res, next));

// Apply authentication guard layer for all subsequent workspace records
router.use(authMiddleware);

// View accounts routes
router.get('/', checkPermission('users_view'), (req, res, next) => userController.getAllUsers(req, res, next));

// Admin-level profile mutations
router.post('/create', checkPermission('users_create'), (req, res, next) => userController.createUser(req, res, next));
router.put('/:userId', checkPermission('users_edit'), (req, res, next) => userController.updateUser(req, res, next));
router.delete('/:userId', checkPermission('users_delete'), (req, res, next) => userController.deleteUser(req, res, next));

// Internal verification lookup queries
router.get('/:userId/permissions', (req, res, next) => userController.getUserPermissions(req, res, next));
router.get('/:userId/roles', (req, res, next) => userController.getUserRoles(req, res, next));
router.post('/:userId/check-permission', (req, res, next) => userController.hasPermission(req, res, next));

// Assigning structural access levels to personnel matrices
router.post('/:userId/assign-roles', checkPermission('role_manage'), (req, res, next) => userController.assignRolesToUser(req, res, next));

module.exports = router;