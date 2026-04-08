const permissionService = require('../services/permissionService');
const { ApiResponse } = require('../utils/apiResponse');

class PermissionController {
  // Create a new permission
  async createPermission(req, res, next) {
    try {
      const { key, module, action, description } = req.body;

      if (!key || !module || !action) {
        return ApiResponse.badRequest(res, 'Permission key, module, and action are required');
      }

      const permission = await permissionService.createPermission(key, module, action, description);
      return ApiResponse.created(res, 'Permission created successfully', permission);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  // Get all permissions
  async getPermissions(req, res, next) {
    try {
      const { module, action } = req.query;
      const filters = {};

      if (module) {
        filters.module = module;
      }

      if (action) {
        filters.action = action;
      }

      const permissions = await permissionService.getPermissions(filters);
      return ApiResponse.success(res, 'Permissions retrieved successfully', permissions, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  // Get permission by ID
  async getPermissionById(req, res, next) {
    try {
      const { permissionId } = req.params;

      if (!permissionId) {
        return ApiResponse.badRequest(res, 'Permission ID is required');
      }

      const permission = await permissionService.getPermissionById(permissionId);
      return ApiResponse.success(res, 'Permission retrieved successfully', permission, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  // Get permission by key
  async getPermissionByKey(req, res, next) {
    try {
      const { key } = req.params;

      if (!key) {
        return ApiResponse.badRequest(res, 'Permission key is required');
      }

      const permission = await permissionService.getPermissionByKey(key);
      return ApiResponse.success(res, 'Permission retrieved successfully', permission, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  // Update permission
  async updatePermission(req, res, next) {
    try {
      const { permissionId } = req.params;
      const updateData = req.body;

      if (!permissionId) {
        return ApiResponse.badRequest(res, 'Permission ID is required');
      }

      const permission = await permissionService.updatePermission(permissionId, updateData);
      return ApiResponse.success(res, 'Permission updated successfully', permission, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  // Get permissions by module
  async getPermissionsByModule(req, res, next) {
    try {
      const { module } = req.params;

      if (!module) {
        return ApiResponse.badRequest(res, 'Module name is required');
      }

      const permissions = await permissionService.getPermissionsByModule(module);
      return ApiResponse.success(res, 'Permissions retrieved successfully', permissions, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  // Get all modules
  async getModules(req, res, next) {
    try {
      const modules = await permissionService.getModules();
      return ApiResponse.success(res, 'Modules retrieved successfully', modules, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  // Delete permission
  async deletePermission(req, res, next) {
    try {
      const { permissionId } = req.params;

      if (!permissionId) {
        return ApiResponse.badRequest(res, 'Permission ID is required');
      }

      const result = await permissionService.deletePermission(permissionId);
      return ApiResponse.success(res, result.message, result, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}

module.exports = new PermissionController();
