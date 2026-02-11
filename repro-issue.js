const http = require('http');
const app = require('./server'); // Import the app

const PORT = 3001;
let server;

function startServer() {
    return new Promise((resolve) => {
        server = app.listen(PORT, () => {
            console.log(`Test server running on port ${PORT}`);
            resolve();
        });
    });
}

function stopServer() {
    return new Promise((resolve) => {
        server.close(() => {
            console.log('Test server stopped');
            resolve();
        });
    });
}

function post(path, body) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: PORT,
            path: path,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.write(JSON.stringify(body));
        req.end();
    });
}

function get(path, token) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: PORT,
            path: path,
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.end();
    });
}

async function testUser(username, password) {
    console.log(`Testing ${username}...`);
    try {
        const login = await post('/api/auth/login', { username, password, role: 'admin' });
        if (!login.success) {
            console.error(`  Login failed: ${login.error}`);
            return;
        }
        console.log(`  Login success. Dept: ${login.department}`);

        const students = await get('/api/students', login.token);
        if (Array.isArray(students)) {
            console.log(`  Fetched ${students.length} students.`);
        } else {
            console.error('  Failed to fetch students:', students);
        }
    } catch (e) {
        console.error(`  Error: ${e.message}`);
    }
}

async function run() {
    await startServer();
    try {
        await testUser('adminmain', 'admingce');
        await testUser('admin-cse', 'admincse123');
        await testUser('admin-ece', 'adminece123');
    } catch (e) {
        console.error(e);
    } finally {
        await stopServer();
    }
}

run();
