import mysql from 'mysql';

export class MsSqlClient {
    connection = mysql.createConnection({
        host: 'localhost',
        database: 'musicbrainz',
        user: 'root',
        password: 'admin',
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