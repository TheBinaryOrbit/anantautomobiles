const express = require('express');
const roleController = require('../controller/roleController');
const { authMiddleware, checkPermission } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Protected routes - require role management access clearance
router.post('/create', checkPermission('role_manage'), (req, res, next) => roleController.createRole(req, res, next));
router.put('/:roleId', checkPermission('role_manage'), (req, res, next) => roleController.updateRole(req, res, next));

// Assign/Remove permissions to/from role
router.post('/:roleId/assign-permissions', checkPermission('role_manage'), (req, res, next) => 
  roleController.assignPermissionsToRole(req, res, next)
);
router.post('/:roleId/add-permission', checkPermission('role_manage'), (req, res, next) => 
  roleController.addPermissionToRole(req, res, next)
);
router.delete('/:roleId/permissions/:permissionId', checkPermission('role_manage'), (req, res, next) => 
  roleController.removePermissionFromRole(req, res, next)
);

// Assign/Remove role to/from user
router.post('/:userId/assign-role', checkPermission('role_manage'), (req, res, next) => 
  roleController.assignRoleToUser(req, res, next)
);
router.delete('/:userId/roles/:roleId', checkPermission('role_manage'), (req, res, next) => 
  roleController.removeRoleFromUser(req, res, next)
);

// View routes - accessible by authenticated users
router.get('/', (req, res, next) => roleController.getRoles(req, res, next));
router.get('/:roleId', (req, res, next) => roleController.getRoleById(req, res, next));
router.get('/:roleId/users', (req, res, next) => roleController.getUsersWithRole(req, res, next));

module.exports = router;