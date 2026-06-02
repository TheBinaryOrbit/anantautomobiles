const prisma = require('./src/config/db.js');
const bcrypt = require('bcryptjs');


const permissions = [
    // ─── User Management ───
    { module: 'users', action: 'create', description: 'Create dashboard users' },
    { module: 'users', action: 'view', description: 'View user registry profiles' },
    { module: 'users', action: 'edit', description: 'Edit user detail data records' },
    { module: 'users', action: 'delete', description: 'Soft delete workspace accounts' },

    // ─── Bike Models ───
    { module: 'bikeModel', action: 'create', description: 'Create vehicle models configurations' },
    { module: 'bikeModel', action: 'view', description: 'View catalogs of vehicle templates' },
    { module: 'bikeModel', action: 'edit', description: 'Modify prices, variant dimensions or parameters' },
    { module: 'bikeModel', action: 'delete', description: 'Mark bike model templates as deleted' },

    // ─── Bike Inventory Stocks ───
    { module: 'bike', action: 'create', description: 'Manually introduce individual hardware assets' },
    { module: 'bike', action: 'view', description: 'Track serial engine and chassis layout lists' },
    { module: 'bike', action: 'edit', description: 'Update production status codes' },
    { module: 'bike', action: 'delete', description: 'Purge individual stock registry entries' },
    { module: 'bike', action: 'markBooked', description: 'Mark bike tracking state as reserved' },

    // ─── Purchases / Stock Inflow ───
    { module: 'purchases', action: 'create', description: 'Log inbound supply purchases invoices' },
    { module: 'purchases', action: 'view', description: 'Monitor inventory transaction order books' },
    { module: 'purchases', action: 'remove', description: 'Void or cancel an explicit stock purchase event' },

    // ─── Accessories ───
    { module: 'accessories', action: 'create', description: 'Add new commercial parts items' },
    { module: 'accessories', action: 'view', description: 'Inspect available non-vehicle stocks' },
    { module: 'accessories', action: 'edit', description: 'Update non-vehicle item catalog metadata' },
    { module: 'accessories', action: 'delete', description: 'Remove accessory catalog item entities' },
    { module: 'accessories', action: 'updateQuantity', description: 'Manually increment/decrement shelf logs' },

    // ─── Customers ───
    { module: 'customer', action: 'create', description: 'Add a new client profile card' },
    { module: 'customer', action: 'view', description: 'Access verification indices or profiles' },
    { module: 'customer', action: 'edit', description: 'Update critical legal identifiers' },
    { module: 'customer', action: 'delete', description: 'Mark client accounts as deleted' },

    // ─── Suppliers ───
    { module: 'supplier', action: 'create', description: 'Introduce a logistics partner profile' },
    { module: 'supplier', action: 'view', description: 'Look up dealer contact directories' },
    { module: 'supplier', action: 'edit', description: 'Edit supplier contact parameters' },
    { module: 'supplier', action: 'delete', description: 'Mark dealer entries as deleted' },

    // ─── Sales Deals & Orders ───
    { module: 'sales', action: 'create', description: 'Generate retail sale challans' },
    { module: 'sales', action: 'view', description: 'Inspect accounting transactional histories' },
    { module: 'sales', action: 'edit', description: 'Modify active orders snapshots' },
    { module: 'sales', action: 'delete', description: 'Soft delete commercial checkout invoices' },
    { module: 'sales', action: 'updateStatus', description: 'Alter order workflow checkpoints' },

    // ─── Discounts & Campaigns ───
    { module: 'discounts', action: 'create', description: 'Launch promo code campaigns' },
    { module: 'discounts', action: 'view', description: 'View available scheme matrices' },
    { module: 'discounts', action: 'edit', description: 'Modify value markdown caps or limits' },
    { module: 'discounts', action: 'remove', description: 'Deactivate target markdown schemes' },

    // ─── Exchange Vehicle Logs ───
    { module: 'exchange', action: 'create', description: 'Process customer trace valuation entries' },
    { module: 'exchange', action: 'view', description: 'Inspect incoming legal verification files' },
    { module: 'exchange', action: 'edit', description: 'Update condition comments or valuations' },
    { module: 'exchange', action: 'delete', description: 'Remove a linked validation entity' },

    // ─── Service Inquiries (CRM Doorstep) ───
    { module: 'serviceInquiry', action: 'create', description: 'Log a workspace maintenance ticket' },
    { module: 'serviceInquiry', action: 'view', description: 'Inspect dispatch GPS coordinate pins' },

    // ─── Sales Inquiries (CRM Leads) ───
    { module: 'salesInquiry', action: 'view', description: 'Monitor high-intent lead flow sheets' },

    // ─── System Level Reporting ───
    { module: 'reports', action: 'view', description: 'Generate audit ledger files' },
    { module: 'analytics', action: 'view', description: 'Analyze performance matrices' },
    { module: 'role', action: 'manage', description: 'Modify systemic role permissions sets' },
];

const roles = [
    {
        name: 'ADMIN',
        description: 'Administrator with absolute clearance across all tables',
        permissions: [],
    },
    {
        name: 'ACCOUNTANT',
        description: 'Financial auditor with access to sales, markdown parameters, and invoicing logs',
        permissions: [
            'sales_create', 'sales_view', 'sales_edit', 'sales_updateStatus',
            'customer_view',
            'discounts_view', 'discounts_create', 'discounts_edit',
            'exchange_view',
            'reports_view', 'analytics_view'
        ],
    },
    {
        name: 'INVENTORY_MANAGER',
        description: 'Warehouse dispatcher managing vehicle catalogs, inflows, and hardware stocks',
        permissions: [
            'bikeModel_create', 'bikeModel_view', 'bikeModel_edit', 'bikeModel_delete',
            'bike_create', 'bike_view', 'bike_edit', 'bike_delete', 'bike_markBooked',
            'purchases_create', 'purchases_view', 'purchases_remove',
            'accessories_create', 'accessories_view', 'accessories_edit', 'accessories_delete', 'accessories_updateQuantity',
            'supplier_view', 'supplier_create', 'supplier_edit',
            'exchange_view', 'exchange_edit'
        ],
    },
    {
        name: 'SALES_EXECUTIVE',
        description: 'Showroom consultant processing floor deals, intake assessments, and lead cards',
        permissions: [
            'sales_create', 'sales_view', 
            'customer_create', 'customer_view', 'customer_edit',
            'bike_view', 
            'bikeModel_view',
            'accessories_view',
            'discounts_view',
            'exchange_create', 'exchange_view',
            'salesInquiry_view'
        ],
    },
    {
        name: 'SERVICE_COORDINATOR',
        description: 'Workshop representative allocating doorstep mechanics and maintenance requests',
        permissions: [
            'serviceInquiry_create', 'serviceInquiry_view',
            'customer_view',
            'bike_view',
            'accessories_view', 'accessories_updateQuantity'
        ],
    },
    {
        name: 'VIEWER',
        description: 'Read-only access across the entire dealership dashboard layout',
        permissions: [
            'users_view', 'bikeModel_view', 'bike_view', 'purchases_view',
            'accessories_view', 'customer_view', 'supplier_view', 'sales_view',
            'discounts_view', 'exchange_view', 'serviceInquiry_view', 'salesInquiry_view',
            'reports_view'
        ],
    },
];

async function seedData() {
    try {
        console.log('🌱 Starting seed process...\n');

        // ─── CLEAR EXISTING DATA STREAMS ───
        console.log('🧼 Flushing existing RBAC tables to avoid unique index constraints...');
        await prisma.userRoleAssignment.deleteMany({});
        await prisma.rolePermission.deleteMany({});
        await prisma.role.deleteMany({});
        await prisma.permission.deleteMany({});
        await prisma.user.deleteMany({});
        console.log('  ✅ Cleanup executed successfully.\n');

        // 1. Create permissions
        console.log('📝 Upserting system permissions matching schema fields...');
        const createdPermissions = {};
        for (const perm of permissions) {
            const key = `${perm.module}_${perm.action}`;
            const permission = await prisma.permission.create({
                data: {
                    key,
                    module: perm.module,
                    action: perm.action,
                    description: perm.description,
                },
            });
            createdPermissions[key] = permission;
        }
        console.log(`  ✅ Successfully created ${Object.keys(createdPermissions).length} fresh permissions.`);

        // 2. Create roles with explicit configuration loops
        console.log('\n📋 Compiling roles assignment loops...');
        for (const roleData of roles) {
            const role = await prisma.role.create({
                data: {
                    name: roleData.name,
                    description: roleData.description,
                    isActive: true,
                },
            });
            console.log(`  ✅ Role Spawned: ${role.name}`);

            if (roleData.name === 'ADMIN') {
                for (const permKey of Object.keys(createdPermissions)) {
                    await prisma.rolePermission.create({
                        data: {
                            roleId: role.id,
                            permissionId: createdPermissions[permKey].id,
                        },
                    });
                }
                console.log(`    → Bound all available master permissions to ADMIN`);
            } else {
                let count = 0;
                for (const permCode of roleData.permissions) {
                    if (createdPermissions[permCode]) {
                        await prisma.rolePermission.create({
                            data: {
                                roleId: role.id,
                                permissionId: createdPermissions[permCode].id,
                            },
                        });
                        count++;
                    }
                }
                console.log(`    → Bound ${count} module keys to ${role.name}`);
            }
        }

        // 3. Provision accounts with pre-hashed credentials
        console.log('\n👤 Generating secure system profile entities...');
        const hashedPassword = await bcrypt.hash('Admin@123', 10);

        const profilesToSeed = [
            { email: 'admin@test.com', name: 'Admin User', phone: '9000000001', role: 'ADMIN' },
            { email: 'accountant@test.com', name: 'Accountant User', phone: '9111111111', role: 'ACCOUNTANT' },
            { email: 'inventory@test.com', name: 'Inventory Manager', phone: '9222222222', role: 'INVENTORY_MANAGER' },
            { email: 'sales@test.com', name: 'Sales Executive', phone: '9333333333', role: 'SALES_EXECUTIVE' },
            { email: 'service@test.com', name: 'Service Coordinator', phone: '9444444444', role: 'SERVICE_COORDINATOR' },
            { email: 'viewer@test.com', name: 'Viewer User', phone: '9555555555', role: 'VIEWER' },
        ];

        for (const p of profilesToSeed) {
            const userEntity = await prisma.user.create({
                data: {
                    email: p.email,
                    password: hashedPassword,
                    name: p.name,
                    phone: p.phone,
                    role: p.role,
                }
            });

            const dbRole = await prisma.role.findUnique({ where: { name: p.role } });
            
            await prisma.userRoleAssignment.create({
                data: {
                    userId: userEntity.id,
                    roleId: dbRole.id,
                }
            });
            console.log(`  ✅ Profile Active [${p.role}] bound to: ${p.email}`);
        }

        console.log('\n✨ Database seeding process concluded safely!');
    } catch (error) {
        console.error('❌ Database migration seed failure encountered:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seedData();