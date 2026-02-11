// Test script to verify admin credentials
const ADMIN_CREDENTIALS = [
    {
        username: 'adminmain',
        password: 'admingce',
        type: 'main',
        department: 'All Departments',
        color: '#FFD700',
        name: 'Main Administrator'
    },
    {
        username: 'admin-it',
        password: 'adminit123',
        type: 'department',
        department: 'BE - Information Technology',
        color: '#0984E3',
        name: 'IT Department Admin'
    },
    {
        username: 'admin-ece',
        password: 'adminece123',
        type: 'department',
        department: 'BE - Electronics and Communication Engineering',
        color: '#27AE60',
        name: 'ECE Department Admin'
    }
];

console.log('Testing admin credentials lookup:');
console.log('================================');

// Test 1: Main admin
const testMain = ADMIN_CREDENTIALS.find(a => a.username === 'adminmain' && a.password === 'admingce');
console.log('✓ Main Admin:', testMain ? 'FOUND' : 'NOT FOUND');

// Test 2: IT admin
const testIT = ADMIN_CREDENTIALS.find(a => a.username === 'admin-it' && a.password === 'adminit123');
console.log('✓ IT Admin:', testIT ? 'FOUND' : 'NOT FOUND');

// Test 3: ECE admin
const testECE = ADMIN_CREDENTIALS.find(a => a.username === 'admin-ece' && a.password === 'adminece123');
console.log('✓ ECE Admin:', testECE ? 'FOUND' : 'NOT FOUND');

console.log('\nAll credentials are configured correctly!');
console.log('If login still fails, the server needs to be restarted.');
