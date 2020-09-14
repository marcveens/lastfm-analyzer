import mysql from 'mysql';

export class SqlClient {
    connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        database: process.env.MYSQL_DATABASE,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        charset: 'utf8mb4_unicode_ci',
        multipleStatements: true
    });

    query = (query: string): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            return this.connection.query(query, (err, results, fields) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }

                resolve(results as any[]);
            });
        });
    }

    connect = () => this.connection.connect();
    disconnect = () => this.connection.end();
}