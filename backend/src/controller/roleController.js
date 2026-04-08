const roleService = require('../services/roleService');
const { ApiResponse } = require('../utils/apiResponse');

class RoleController {
  // Create a new role
  async createRole(req, res, next) {
    try {
      const { name, description } = req.body;

      if (!name) {
        return ApiResponse.badRequest(res, 'Role name is required');
      }

      const role = await roleService.createRole(name, description);
      return ApiResponse.created(res, 'Role created successfully', role);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  // Get all roles
  async getRoles(req, res, next) {
    try {
      const roles = await roleService.getRoles();
      return ApiResponse.success(res, 'Roles retrieved successfully', roles, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  // Get role by ID
  async getRoleById(req, res, next) {
    try {
      const { roleId } = req.params;

      if (!roleId) {
        return ApiResponse.badRequest(res, 'Role ID is required');
      }

      const role = await roleService.getRoleById(roleId);
      return ApiResponse.success(res, 'Role retrieved successfully', role, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  // Update role
  async updateRole(req, res, next) {
    try {
      const { roleId } = req.params;
      const updateData = req.body;

      if (!roleId) {
        return ApiResponse.badRequest(res, 'Role ID is required');
      }

      const role = await roleService.updateRole(roleId, updateData);
      return ApiResponse.success(res, 'Role updated successfully', role, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  // Assign permissions to role
  async assignPermissionsToRole(req, res, next) {
    try {
      const { roleId } = req.params;
      const { permissionIds } = req.body;

      if (!roleId) {
        return ApiResponse.badRequest(res, 'Role ID is required');
      }

      if (!permissionIds || !Array.isArray(permissionIds) || permissionIds.length === 0) {
        return ApiResponse.badRequest(res, 'Permission IDs array is required');
      }

      const result = await roleService.assignPermissionsToRole(roleId, permissionIds);
      return ApiResponse.success(res, result.message, result, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  // Add single permission to role
  async addPermissionToRole(req, res, next) {
    try {
      const { roleId } = req.params;
      const { permissionId } = req.body;

      if (!roleId) {
        return ApiResponse.badRequest(res, 'Role ID is required');
      }

      if (!permissionId) {
        return ApiResponse.badRequest(res, 'Permission ID is required');
      }

      const result = await roleService.addPermissionToRole(roleId, permissionId);
      return ApiResponse.success(res, result.message, result, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  // Remove permission from role
  async removePermissionFromRole(req, res, next) {
    try {
      const { roleId, permissionId } = req.params;

      if (!roleId || !permissionId) {
        return ApiResponse.badRequest(res, 'Role ID and Permission ID are required');
      }

      const result = await roleService.removePermissionFromRole(roleId, permissionId);
      return ApiResponse.success(res, result.message, result, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  // Assign role to user
  async assignRoleToUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { roleId } = req.body;

      if (!userId) {
        return ApiResponse.badRequest(res, 'User ID is required');
      }

      if (!roleId) {
        return ApiResponse.badRequest(res, 'Role ID is required');
      }

      const result = await roleService.assignRoleToUser(userId, roleId);
      return ApiResponse.success(res, result.message, result, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  // Remove role from user
  async removeRoleFromUser(req, res, next) {
    try {
      const { userId, roleId } = req.params;

      if (!userId || !roleId) {
        return ApiResponse.badRequest(res, 'User ID and Role ID are required');
      }

      const result = await roleService.removeRoleFromUser(userId, roleId);
      return ApiResponse.success(res, result.message, result, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  // Get users with a role
  async getUsersWithRole(req, res, next) {
    try {
      const { roleId } = req.params;

      if (!roleId) {
        return ApiResponse.badRequest(res, 'Role ID is required');
      }

      const result = await roleService.getUsersWithRole(roleId);
      return ApiResponse.success(res, 'Users retrieved successfully', result, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}

module.exports = new RoleController();
