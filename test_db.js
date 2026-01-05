const { Client } = require('pg');
const connectionString = 'postgresql://admin:Admin123@185.163.26.68:5433/navqurt_db';

const client = new Client({
    connectionString,
    connectionTimeoutMillis: 10000,
    ssl: {
        rejectUnauthorized: false
    }
});

console.log('Connecting to:', connectionString.replace(/:([^:@]+)@/, ':****@'));

client.connect()
    .then(() => {
        console.log('SUCCESS: Connected to PostgreSQL!');
        return client.query('SELECT version()');
    })
    .then(res => {
        console.log('PostgreSQL Version:', res.rows[0].version);
        return client.end();
    })
    .catch(err => {
        console.error('CONNECTION ERROR:', err.message);
        console.error('ERROR CODE:', err.code);
        process.exit(1);
    });
