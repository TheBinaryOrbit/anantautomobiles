const prisma = require('../config/db');

class PermissionService {
  // Create a new permission
  async createPermission(key, module, action, description = null) {
    try {
      if (!key || !module || !action) {
        throw new Error('Permission key, module, and action are required');
      }

      const existingPermission = await prisma.permission.findUnique({
        where: { key },
      });

      if (existingPermission) {
        throw new Error(`Permission with key '${key}' already exists`);
      }

      const permission = await prisma.permission.create({
        data: {
          key,
          module,
          action,
          description,
        },
      });

      return {
        id: permission.id,
        key: permission.key,
        module: permission.module,
        action: permission.action,
        description: permission.description,
        createdAt: permission.createdAt,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all permissions
  async getPermissions(filters = {}) {
    try {
      const where = {};

      if (filters.module) {
        where.module = filters.module;
      }

      if (filters.action) {
        where.action = filters.action;
      }

      const permissions = await prisma.permission.findMany({
        where,
        include: {
          rolePermissions: {
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { module: 'asc' },
      });

      return permissions.map(permission => ({
        id: permission.id,
        key: permission.key,
        module: permission.module,
        action: permission.action,
        description: permission.description,
        roles: permission.rolePermissions.map(rp => ({
          id: rp.role.id,
          name: rp.role.name,
        })),
        roleCount: permission.rolePermissions.length,
        createdAt: permission.createdAt,
      }));
    } catch (error) {
      throw error;
    }
  }

  // Get permission by ID
  async getPermissionById(permissionId) {
    try {
      const permission = await prisma.permission.findUnique({
        where: { id: permissionId },
        include: {
          rolePermissions: {
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!permission) {
        throw new Error(`Permission with ID '${permissionId}' not found`);
      }

      return {
        id: permission.id,
        key: permission.key,
        module: permission.module,
        action: permission.action,
        description: permission.description,
        roles: permission.rolePermissions.map(rp => ({
          id: rp.role.id,
          name: rp.role.name,
        })),
        createdAt: permission.createdAt,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get permission by key
  async getPermissionByKey(key) {
    try {
      const permission = await prisma.permission.findUnique({
        where: { key },
        include: {
          rolePermissions: {
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!permission) {
        throw new Error(`Permission with key '${key}' not found`);
      }

      return {
        id: permission.id,
        key: permission.key,
        module: permission.module,
        action: permission.action,
        description: permission.description,
        roles: permission.rolePermissions.map(rp => ({
          id: rp.role.id,
          name: rp.role.name,
        })),
        createdAt: permission.createdAt,
      };
    } catch (error) {
      throw error;
    }
  }

  // Update permission
  async updatePermission(permissionId, updateData) {
    try {
      const permission = await prisma.permission.findUnique({
        where: { id: permissionId },
      });

      if (!permission) {
        throw new Error(`Permission with ID '${permissionId}' not found`);
      }

      const updatedPermission = await prisma.permission.update({
        where: { id: permissionId },
        data: {
          key: updateData.key || permission.key,
          module: updateData.module || permission.module,
          action: updateData.action || permission.action,
          description: updateData.description !== undefined ? updateData.description : permission.description,
        },
      });

      return {
        id: updatedPermission.id,
        key: updatedPermission.key,
        module: updatedPermission.module,
        action: updatedPermission.action,
        description: updatedPermission.description,
        updatedAt: updatedPermission.updatedAt,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get permissions by module
  async getPermissionsByModule(module) {
    try {
      const permissions = await prisma.permission.findMany({
        where: { module },
        include: {
          rolePermissions: {
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { action: 'asc' },
      });

      return permissions.map(permission => ({
        id: permission.id,
        key: permission.key,
        module: permission.module,
        action: permission.action,
        description: permission.description,
        roles: permission.rolePermissions.map(rp => ({
          id: rp.role.id,
          name: rp.role.name,
        })),
      }));
    } catch (error) {
      throw error;
    }
  }

  // Get all unique modules
  async getModules() {
    try {
      const permissions = await prisma.permission.findMany({
        select: { module: true },
        distinct: ['module'],
        orderBy: { module: 'asc' },
      });

      return permissions.map(p => p.module);
    } catch (error) {
      throw error;
    }
  }

  // Delete permission
  async deletePermission(permissionId) {
    try {
      const permission = await prisma.permission.findUnique({
        where: { id: permissionId },
        include: {
          rolePermissions: true,
        },
      });

      if (!permission) {
        throw new Error(`Permission with ID '${permissionId}' not found`);
      }

      if (permission.rolePermissions.length > 0) {
        throw new Error('Cannot delete permission that is assigned to roles');
      }

      await prisma.permission.delete({
        where: { id: permissionId },
      });

      return {
        permissionId,
        message: `Permission '${permission.key}' deleted successfully`,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PermissionService();
