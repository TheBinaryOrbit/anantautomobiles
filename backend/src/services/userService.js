const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

class UserService {
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  async createUser(email, phone, password, role = 'USER') {
    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { phone }],
        },
      });

      if (existingUser) {
        throw new Error('User with this email or phone already exists');
      }

      const hashedPassword = await this.hashPassword(password);

      const user = await prisma.user.create({
        data: {
          email,
          phone,
          password: hashedPassword,
          role,
        },
      });

      return {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      if (updateData.password) {
        updateData.password = await this.hashPassword(updateData.password);
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      return {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isDeleted: true },
      });

      return { message: 'User deleted successfully', userId: user.id };
    } catch (error) {
      throw error;
    }
  }

  async loginUser(email, password) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user || user.isDeleted) {
        throw new Error('Invalid email or password');
      }

      const isPasswordValid = await this.comparePassword(password, user.password);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Collect all permissions from all roles
      const permissions = [];
      const roles = [];
      const permissionMap = new Set();

      user.userRoles.forEach(userRole => {
        const roleName = userRole.role.name;
        roles.push({
          id: userRole.role.id,
          name: roleName,
        });

        userRole.role.rolePermissions.forEach(rolePermission => {
          const permKey = rolePermission.permission.key;
          if (!permissionMap.has(permKey)) {
            permissionMap.add(permKey);
            permissions.push({
              id: rolePermission.permission.id,
              key: rolePermission.permission.key,
              module: rolePermission.permission.module,
              action: rolePermission.permission.action,
            });
          }
        });
      });

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          roles: roles.map(r => r.name),
        },
        process.env.JWT_SECRET || 'your_secret_key',
        { expiresIn: '7d' }
      );

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          roles: roles,
          permissions: permissions,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserPermissions(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new Error(`User with ID '${userId}' not found`);
      }

      // Collect all permissions from all roles
      const permissions = [];
      const roles = [];
      const permissionMap = new Set();

      user.userRoles.forEach(userRole => {
        roles.push({
          id: userRole.role.id,
          name: userRole.role.name,
        });

        userRole.role.rolePermissions.forEach(rolePermission => {
          const permKey = rolePermission.permission.key;
          if (!permissionMap.has(permKey)) {
            permissionMap.add(permKey);
            permissions.push({
              id: rolePermission.permission.id,
              key: rolePermission.permission.key,
              module: rolePermission.permission.module,
              action: rolePermission.permission.action,
            });
          }
        });
      });

      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        roles: roles,
        permissions: permissions,
        totalPermissions: permissions.length,
        totalRoles: roles.length,
      };
    } catch (error) {
      throw error;
    }
  }

  async hasPermission(userId, permissionKey) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        return false;
      }

      for (const userRole of user.userRoles) {
        for (const rolePermission of userRole.role.rolePermissions) {
          if (rolePermission.permission.key === permissionKey) {
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      throw error;
    }
  }

  async getUserRoles(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: {
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  isActive: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new Error(`User with ID '${userId}' not found`);
      }

      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        roles: user.userRoles.map(ur => ur.role),
        totalRoles: user.userRoles.length,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();
