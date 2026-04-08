const express = require('express');
const userController = require('../controller/userController');
const { authMiddleware, adminCheck } = require('../middleware/auth');

const router = express.Router();

// Public route
router.post('/login', (req, res, next) => userController.login(req, res, next));

router.use(authMiddleware);

// Protected routes
router.get('/', (req, res, next) => userController.getAllUsers(req, res, next));

// Admin protected routes
router.post('/create', adminCheck, (req, res, next) => userController.createUser(req, res, next));
router.put('/:userId', adminCheck, (req, res, next) => userController.updateUser(req, res, next));
router.delete('/:userId', adminCheck, (req, res, next) => userController.deleteUser(req, res, next));

// Permission and role related routes
router.get('/:userId/permissions', (req, res, next) => userController.getUserPermissions(req, res, next));
router.get('/:userId/roles', (req, res, next) => userController.getUserRoles(req, res, next));
router.post('/:userId/check-permission', (req, res, next) => userController.hasPermission(req, res, next));
router.post('/:userId/assign-roles', adminCheck, (req, res, next) => userController.assignRolesToUser(req, res, next));

module.exports = router;
