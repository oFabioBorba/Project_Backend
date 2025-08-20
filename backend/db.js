import pgPromise from 'pg-promise';

const pgp = pgPromise();

const db = pgp({
  host: 'localhost',
  port: 5432,
  database: 'servicolocal',
  user: 'postgres',
  password: '#abc123#'
});

export default db; 
