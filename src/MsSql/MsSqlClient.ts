import * as sql from 'mssql/msnodesqlv8';

export class MsSqlClient {
    static query = (query: string) => {
        return MsSqlClient.connect(async (connection) => {
            return await connection.query(query);
        });
    }

    static bulk = (table: sql.Table) => {
        return MsSqlClient.connect(async (connection) => {
            return new Promise((resolve, reject) => {
                const request = connection.request();
                request.bulk(table, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        });
    }

    private static connect = async (cb: (connection: sql.ConnectionPool) => Promise<any>) => {
        const connection: sql.ConnectionPool = new sql.ConnectionPool({
            server: '.\\SQLEXPRESS',
            database: 'MusicBrainz',
            options: {
                trustedConnection: true,
                enableArithAbort: true
            }
        });
        await connection.connect();

        const result = await cb(connection);

        connection.close();

        return result;
    }
}