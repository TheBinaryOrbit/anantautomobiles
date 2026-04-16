const prisma = require('../src/config/db.js');
const bcrypt = require('bcryptjs');

// Define all permissions by module and action
const permissions = [
    // Admin permissions (all module:action combinations)
    { module: 'users', action: 'create', description: 'Create users' },
    { module: 'users', action: 'view', description: 'View users' },
    { module: 'users', action: 'edit', description: 'Edit users' },
    { module: 'users', action: 'delete', description: 'Delete users' },

    // Bike Model permissions
    { module: 'bikeModel', action: 'create', description: 'Create bike models' },
    { module: 'bikeModel', action: 'view', description: 'View bike models' },
    { module: 'bikeModel', action: 'edit', description: 'Edit bike models' },
    { module: 'bikeModel', action: 'delete', description: 'Delete bike models' },

    // Bike permissions
    { module: 'bike', action: 'create', description: 'Create bikes' },
    { module: 'bike', action: 'view', description: 'View bikes' },
    { module: 'bike', action: 'edit', description: 'Edit bikes' },
    { module: 'bike', action: 'delete', description: 'Delete bikes' },
    { module: 'bike', action: 'markBooked', description: 'Mark bike as booked' },

    // Accessories permissions
    { module: 'accessories', action: 'create', description: 'Create accessories' },
    { module: 'accessories', action: 'view', description: 'View accessories' },
    { module: 'accessories', action: 'edit', description: 'Edit accessories' },
    { module: 'accessories', action: 'delete', description: 'Delete accessories' },
    { module: 'accessories', action: 'updateQuantity', description: 'Update accessibility quantity' },

    // Customer permissions
    { module: 'customer', action: 'create', description: 'Create customers' },
    { module: 'customer', action: 'view', description: 'View customers' },
    { module: 'customer', action: 'edit', description: 'Edit customers' },
    { module: 'customer', action: 'delete', description: 'Delete customers' },

    // Supplier permissions
    { module: 'supplier', action: 'create', description: 'Create suppliers' },
    { module: 'supplier', action: 'view', description: 'View suppliers' },
    { module: 'supplier', action: 'edit', description: 'Edit suppliers' },
    { module: 'supplier', action: 'delete', description: 'Delete suppliers' },

    // Sales permissions
    { module: 'sales', action: 'create', description: 'Create sales' },
    { module: 'sales', action: 'view', description: 'View sales' },
    { module: 'sales', action: 'edit', description: 'Edit sales' },
    { module: 'sales', action: 'delete', description: 'Delete sales' },
    { module: 'sales', action: 'updateStatus', description: 'Update sales status' },

    // Reports & Analytics
    { module: 'reports', action: 'view', description: 'View reports' },
    { module: 'analytics', action: 'view', description: 'View analytics' },

    // setting
    { module: 'role', action: 'manage', description: 'Manage roles and permissions' },


];

// Define roles with their permissions
const roles = [
    {
        name: 'ADMIN',
        description: 'Administrator with full access to all features',
        permissionModules: ['users', 'bikeModel', 'bike', 'accessories', 'customer', 'supplier', 'sales', 'reports', 'analytics'],
    },
    {
        name: 'ACCOUNTANT',
        description: 'Accountant with access to sales and customer information',
        permissions: ['sales_create', 'sales_view', 'sales_edit', 'sales_updateStatus', 'customer_view', 'reports_view'],
    },
    {
        name: 'INVENTORY_MANAGER',
        description: 'Inventory Manager with access to bikes, bike models, and accessories',
        permissions: [
            'bikeModel_create',
            'bikeModel_view',
            'bikeModel_edit',
            'bikeModel_delete',
            'bike_create',
            'bike_view',
            'bike_edit',
            'bike_delete',
            'bike_markBooked',
            'accessories_create',
            'accessories_view',
            'accessories_edit',
            'accessories_delete',
            'accessories_updateQuantity',
            'supplier_view',
        ],
    },
    {
        name: 'SALES_EXECUTIVE',
        description: 'Sales Executive with access to create and view sales',
        permissions: ['sales_create', 'sales_view', 'customer_view', 'bike_view', 'accessories_view'],
    },
    {
        name: 'VIEWER',
        description: 'Read-only access to all resources',
        permissions: [
            'users_view',
            'bikeModel_view',
            'bike_view',
            'accessories_view',
            'customer_view',
            'supplier_view',
            'sales_view',
            'reports_view',
        ],
    },
];

async function seedData() {
    try {
        console.log('🌱 Starting seed process...\n');

        // 1. Create or update permissions
        console.log('📝 Creating permissions...');
        const createdPermissions = {};
        for (const perm of permissions) {
            const key = `${perm.module}_${perm.action}`;
            const permission = await prisma.permission.upsert({
                where: { key },
                update: {
                    module: perm.module,
                    action: perm.action,
                    description: perm.description,
                },
                create: {
                    key,
                    module: perm.module,
                    action: perm.action,
                    description: perm.description,
                },
            });
            createdPermissions[key] = permission;
            console.log(`  ✅ Permission: ${key}`);
        }

        // 2. Create or update roles with their permissions
        console.log('\n📋 Creating roles with permissions...');
        for (const roleData of roles) {
            // Create or update the role
            const role = await prisma.role.upsert({
                where: { name: roleData.name },
                update: {
                    description: roleData.description,
                    isActive: true,
                },
                create: {
                    name: roleData.name,
                    description: roleData.description,
                    isActive: true,
                },
            });
            console.log(`  ✅ Role created: ${role.name}`);

            // Handle ADMIN role - assign all permissions
            if (roleData.name === 'ADMIN') {
                for (const permKey of Object.keys(createdPermissions)) {
                    await prisma.rolePermission.upsert({
                        where: {
                            roleId_permissionId: {
                                roleId: role.id,
                                permissionId: createdPermissions[permKey].id,
                            },
                        },
                        update: {},
                        create: {
                            roleId: role.id,
                            permissionId: createdPermissions[permKey].id,
                        },
                    });
                }
                console.log(`    → All permissions assigned to ADMIN`);
            } else if (roleData.permissions) {
                // Handle other roles - assign specific permissions
                for (const permCode of roleData.permissions) {
                    if (createdPermissions[permCode]) {
                        await prisma.rolePermission.upsert({
                            where: {
                                roleId_permissionId: {
                                    roleId: role.id,
                                    permissionId: createdPermissions[permCode].id,
                                },
                            },
                            update: {},
                            create: {
                                roleId: role.id,
                                permissionId: createdPermissions[permCode].id,
                            },
                        });
                    }
                }
                console.log(`    → ${roleData.permissions.length} permissions assigned`);
            }
        }

        // 3. Create or update admin user with ADMIN role
        console.log('\n👤 Setting up admin user...');
        const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
        const hashedPassword = await bcrypt.hash('Admin@123', 10); // Use a secure password in production

        // clear all the  users with email
        await prisma.user.deleteMany({
            where: {}
        });

        const adminUser = await prisma.user.upsert({
            where: { email: 'admin@test.com' },
            update: {
                name: 'Admin User',
                phone: '9000000001',
            },
            create: {
                email: 'admin@test.com',
                password: hashedPassword,
                name: 'Admin User',
                phone: '9000000001',
                role: 'ADMIN',
            },
        });
        console.log(`  ✅ Admin user: ${adminUser.email}`);

        // Assign ADMIN role to admin user
        await prisma.userRoleAssignment.upsert({
            where: {
                userId_roleId: {
                    userId: adminUser.id,
                    roleId: adminRole.id,
                },
            },
            update: {},
            create: {
                userId: adminUser.id,
                roleId: adminRole.id,
            },
        });
        console.log(`    → ADMIN role assigned\n`);

        // 4. Create sample users for other roles
        console.log('👥 Creating sample users for roles...');
        const sampleUsers = [
            {
                email: 'accountant@test.com',
                name: 'Accountant User',
                phone: '9111111111',
                role: 'ACCOUNTANT',
            },
            {
                email: 'inventory@test.com',
                name: 'Inventory Manager',
                phone: '9222222222',
                role: 'INVENTORY_MANAGER',
            },
            {
                email: 'sales@test.com',
                name: 'Sales Executive',
                phone: '9333333333',
                role: 'SALES_EXECUTIVE',
            },
            {
                email: 'viewer@test.com',
                name: 'Viewer User',
                phone: '9444444444',
                role: 'VIEWER',
            },
        ];

        for (const userData of sampleUsers) {
            const user = await prisma.user.upsert({
                where: { email: userData.email },
                update: {
                    name: userData.name,
                    phone: userData.phone,
                    role: userData.role,
                },
                create: {
                    email: userData.email,
                    password: hashedPassword, // In production, this should be hashed
                    name: userData.name,
                    phone: userData.phone,
                    role: userData.role,
                },
            });

            const userRole = await prisma.role.findUnique({ where: { name: userData.role } });
            await prisma.userRoleAssignment.upsert({
                where: {
                    userId_roleId: {
                        userId: user.id,
                        roleId: userRole.id,
                    },
                },
                update: {},
                create: {
                    userId: user.id,
                    roleId: userRole.id,
                },
            });

            console.log(`  ✅ ${userData.role}: ${userData.email}`);
        }

        console.log('\n✨ Seed completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`  • Permissions created: ${Object.keys(createdPermissions).length}`);
        console.log(`  • Roles created: ${roles.length}`);
        console.log(`  • Users created: ${sampleUsers.length + 1} (including admin)`);

        console.log('\n🔐 User Credentials:');
        console.log('  ADMIN:           admin@test.com / Admin@123');
        console.log('  ACCOUNTANT:      accountant@test.com / Admin@123');
        console.log('  INVENTORY_MGR:   inventory@test.com / Admin@123');
        console.log('  SALES_EXEC:      sales@test.com / Admin@123');
        console.log('  VIEWER:          viewer@test.com / Admin@123');

    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seedData();
