const prisma = require('../config/db');

class RoleService {
  // Create a new role
  async createRole(name, description = null) {
    try {
      if (!name) {
        throw new Error('Role name is required');
      }

      const existingRole = await prisma.role.findUnique({
        where: { name },
      });

      if (existingRole) {
        throw new Error(`Role '${name}' already exists`);
      }

      const role = await prisma.role.create({
        data: {
          name,
          description,
          isActive: true,
        },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      return {
        id: role.id,
        name: role.name,
        description: role.description,
        isActive: role.isActive,
        permissions: role.rolePermissions.map(rp => ({
          id: rp.permission.id,
          key: rp.permission.key,
          module: rp.permission.module,
          action: rp.permission.action,
        })),
        createdAt: role.createdAt,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all roles
  async getRoles() {
    try {
      const roles = await prisma.role.findMany({
        where: { isActive: true },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
          userRoleAssignments: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        isActive: role.isActive,
        permissions: role.rolePermissions.map(rp => ({
          id: rp.permission.id,
          key: rp.permission.key,
          module: rp.permission.module,
          action: rp.permission.action,
        })),
        userCount: role.userRoleAssignments.length,
        createdAt: role.createdAt,
      }));
    } catch (error) {
      throw error;
    }
  }

  // Get role by ID
  async getRoleById(roleId) {
    try {
      const role = await prisma.role.findUnique({
        where: { id: roleId },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
          userRoleAssignments: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!role) {
        throw new Error(`Role with ID '${roleId}' not found`);
      }

      return {
        id: role.id,
        name: role.name,
        description: role.description,
        isActive: role.isActive,
        permissions: role.rolePermissions.map(rp => ({
          id: rp.permission.id,
          key: rp.permission.key,
          module: rp.permission.module,
          action: rp.permission.action,
        })),
        users: role.userRoleAssignments.map(ura => ({
          id: ura.user.id,
          email: ura.user.email,
          name: ura.user.name,
        })),
        createdAt: role.createdAt,
      };
    } catch (error) {
      throw error;
    }
  }

  // Update role
  async updateRole(roleId, updateData) {
    try {
      const role = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new Error(`Role with ID '${roleId}' not found`);
      }

      const updatedRole = await prisma.role.update({
        where: { id: roleId },
        data: {
          name: updateData.name || role.name,
          description: updateData.description !== undefined ? updateData.description : role.description,
          isActive: updateData.isActive !== undefined ? updateData.isActive : role.isActive,
        },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      return {
        id: updatedRole.id,
        name: updatedRole.name,
        description: updatedRole.description,
        isActive: updatedRole.isActive,
        permissions: updatedRole.rolePermissions.map(rp => ({
          id: rp.permission.id,
          key: rp.permission.key,
          module: rp.permission.module,
          action: rp.permission.action,
        })),
        updatedAt: updatedRole.updatedAt,
      };
    } catch (error) {
      throw error;
    }
  }

  // Assign permissions to role
  async assignPermissionsToRole(roleId, permissionIds) {
    try {
      const role = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new Error(`Role with ID '${roleId}' not found`);
      }

      // Verify all permissions exist
      const permissions = await prisma.permission.findMany({
        where: {
          id: { in: permissionIds },
        },
      });

      if (permissions.length !== permissionIds.length) {
        throw new Error('One or more permissions do not exist');
      }

      // Clear existing permissions and assign new ones
      await prisma.rolePermission.deleteMany({
        where: { roleId },
      });

      const rolePermissions = await Promise.all(
        permissionIds.map(permissionId =>
          prisma.rolePermission.create({
            data: {
              roleId,
              permissionId,
            },
          })
        )
      );

      return {
        roleId,
        permissionsAssigned: permissionIds.length,
        message: `${permissionIds.length} permissions assigned to role`,
      };
    } catch (error) {
      throw error;
    }
  }

  // Add single permission to role
  async addPermissionToRole(roleId, permissionId) {
    try {
      const role = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new Error(`Role with ID '${roleId}' not found`);
      }

      const permission = await prisma.permission.findUnique({
        where: { id: permissionId },
      });

      if (!permission) {
        throw new Error(`Permission with ID '${permissionId}' not found`);
      }

      const existingAssignment = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
      });

      if (existingAssignment) {
        throw new Error('Permission already assigned to this role');
      }

      await prisma.rolePermission.create({
        data: {
          roleId,
          permissionId,
        },
      });

      return {
        roleId,
        permissionId,
        message: `Permission '${permission.key}' added to role`,
      };
    } catch (error) {
      throw error;
    }
  }

  // Remove permission from role
  async removePermissionFromRole(roleId, permissionId) {
    try {
      const rolePermission = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
      });

      if (!rolePermission) {
        throw new Error('Permission not assigned to this role');
      }

      await prisma.rolePermission.delete({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
      });

      return {
        roleId,
        permissionId,
        message: 'Permission removed from role',
      };
    } catch (error) {
      throw error;
    }
  }

  // Assign role to user
  async assignRoleToUser(userId, roleId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error(`User with ID '${userId}' not found`);
      }

      const role = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new Error(`Role with ID '${roleId}' not found`);
      }

      const existingAssignment = await prisma.userRoleAssignment.findUnique({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
      });

      if (existingAssignment) {
        throw new Error('User already has this role');
      }

      const assignment = await prisma.userRoleAssignment.create({
        data: {
          userId,
          roleId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        userId: assignment.user.id,
        userEmail: assignment.user.email,
        roleName: assignment.role.name,
        message: `Role '${assignment.role.name}' assigned to user '${assignment.user.email}'`,
      };
    } catch (error) {
      throw error;
    }
  }

  // Remove role from user
  async removeRoleFromUser(userId, roleId) {
    try {
      const assignment = await prisma.userRoleAssignment.findUnique({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
        include: {
          role: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!assignment) {
        throw new Error('User does not have this role');
      }

      await prisma.userRoleAssignment.delete({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
      });

      return {
        userId,
        roleId,
        message: `Role '${assignment.role.name}' removed from user`,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get users with a role
  async getUsersWithRole(roleId) {
    try {
      const role = await prisma.role.findUnique({
        where: { id: roleId },
        include: {
          userRoleAssignments: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  phone: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      });

      if (!role) {
        throw new Error(`Role with ID '${roleId}' not found`);
      }

      return {
        roleId: role.id,
        roleName: role.name,
        users: role.userRoleAssignments.map(ura => ura.user),
        totalUsers: role.userRoleAssignments.length,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new RoleService();
