const userService = require('../services/userService');
const { ApiResponse } = require('../utils/apiResponse');

class UserController {
  async createUser(req, res, next) {
    try {
      const { email, phone, password, role } = req.body;

      if (!email || !phone || !password) {
        return ApiResponse.badRequest(res, 'Email, phone, and password are required');
      }

      const user = await userService.createUser(email, phone, password, role);
      return ApiResponse.created(res, 'User created successfully', user);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      if (!userId) {
        return ApiResponse.badRequest(res, 'User ID is required');
      }

      const user = await userService.updateUser(userId, updateData);
      return ApiResponse.success(res, 'User updated successfully', user, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return ApiResponse.badRequest(res, 'User ID is required');
      }

      await userService.deleteUser(userId);
      return ApiResponse.success(res, 'User deleted successfully');
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      return ApiResponse.success(res, 'Users retrieved successfully', users, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return ApiResponse.badRequest(res, 'Email and password are required');
      }

      const result = await userService.loginUser(email, password);
      return ApiResponse.success(res, 'Login successful', result, 200);
    } catch (error) {
      return ApiResponse.unauthorized(res, error.message);
    }
  }

  async getUserPermissions(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return ApiResponse.badRequest(res, 'User ID is required');
      }

      const permissions = await userService.getUserPermissions(userId);
      return ApiResponse.success(res, 'User permissions retrieved successfully', permissions, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getUserRoles(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return ApiResponse.badRequest(res, 'User ID is required');
      }

      const roles = await userService.getUserRoles(userId);
      return ApiResponse.success(res, 'User roles retrieved successfully', roles, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async hasPermission(req, res, next) {
    try {
      const { userId } = req.params;
      const { permissionKey } = req.body;

      if (!userId || !permissionKey) {
        return ApiResponse.badRequest(res, 'User ID and permission key are required');
      }

      const hasPermission = await userService.hasPermission(userId, permissionKey);
      return ApiResponse.success(res, 'Permission check completed', { hasPermission }, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async assignRolesToUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { roleIds } = req.body;

      if (!userId || !roleIds || !Array.isArray(roleIds)) {
        return ApiResponse.badRequest(res, 'User ID and role IDs array are required');
      }

      const result = await userService.assignRolesToUser(userId, roleIds);
      return ApiResponse.success(res, 'Roles assigned to user', result, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}

module.exports = new UserController();
