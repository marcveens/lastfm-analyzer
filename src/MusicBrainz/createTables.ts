import * as sql from 'mssql/msnodesqlv8';
import { MsSqlClient } from '../MsSql/MsSqlClient';
import { streamFile } from './parseFile';

type ColumnTypes = 'varchar' | 'int' | 'datetime' | 'bit' | 'date' | 'VarChar(255)';
const bulkPerNumber = 10000;

export const createTagTable = async (path: string) => createTable(path, () => {
    const table = new sql.Table('tag');
    table.columns.add('id', sql.Int, { primary: true });
    table.columns.add('name', sql.VarChar(255), { nullable: false });
    table.columns.add('ref_count', sql.Int, { nullable: false });

    return table;
});

export const createArtistTable = async (path: string) => createTable(path, () => {
    const table = new sql.Table('artist');
    table.columns.add('id', sql.Int, { primary: true });
    table.columns.add('gid', sql.VarChar(255), { nullable: false });
    table.columns.add('name', sql.Text, { nullable: false });
    table.columns.add('sort_name', sql.Text, { nullable: false });
    table.columns.add('begin_date_year', sql.Int);
    table.columns.add('begin_date_month', sql.Int);
    table.columns.add('begin_date_day', sql.Int);
    table.columns.add('end_date_year', sql.Int);
    table.columns.add('end_date_month', sql.Int);
    table.columns.add('end_date_day', sql.Int);
    table.columns.add('type', sql.Int);
    table.columns.add('area', sql.Int);
    table.columns.add('gender', sql.Int);
    table.columns.add('comment', sql.Text, { nullable: false });
    table.columns.add('edits_pending', sql.Int);
    table.columns.add('last_updated', sql.Text);
    table.columns.add('ended', sql.VarChar(255));
    table.columns.add('begin_area', sql.Int);
    table.columns.add('end_area', sql.Text);

    return table;
});

export const createArtistTagTable = async (path: string) => createTable(path, () => {
    const table = new sql.Table('artist_tag');
    table.columns.add('artist', sql.Int, { nullable: false });
    table.columns.add('tag', sql.Int, { nullable: false });
    table.columns.add('count', sql.Int, { nullable: false });
    table.columns.add('last_updated', sql.Text, { nullable: false });

    return table;
});


export const createReleaseTable = async (path: string) => createTable(path, () => {
    const table = new sql.Table('release_');
    table.columns.add('id', sql.Int, { primary: true });
    table.columns.add('gid', sql.VarChar(255), { nullable: false });
    table.columns.add('name', sql.Text, { nullable: false });
    table.columns.add('artist_credit', sql.Int, { nullable: false });
    table.columns.add('release_group', sql.Int, { nullable: false });
    table.columns.add('status', sql.Int, { nullable: false });
    table.columns.add('packaging', sql.Int, { nullable: false });
    table.columns.add('language', sql.Int, { nullable: false });
    table.columns.add('script', sql.Int, { nullable: false });
    table.columns.add('barcode', sql.VarChar(255), { nullable: false });
    table.columns.add('comment', sql.VarChar(255), { nullable: false });
    table.columns.add('edits_pending', sql.Int, { nullable: false });
    table.columns.add('quality', sql.Int, { nullable: false });
    table.columns.add('last_updated', sql.Text, { nullable: false });

    return table;
});

export const createReleaseTagTable = async (path: string) => createTable(path, () => {
    const table = new sql.Table('release_tag');
    table.columns.add('release_', sql.Int, { nullable: false });
    table.columns.add('tag', sql.Int, { nullable: false });
    table.columns.add('count', sql.Int, { nullable: false });
    table.columns.add('last_updated', sql.Text, { nullable: false });

    return table;
});

export const createRecordingTagTable = async (path: string) => createTable(path, () => {
    const table = new sql.Table('recording_tag');
    table.columns.add('recording', sql.Int, { nullable: false });
    table.columns.add('tag', sql.Int, { nullable: false });
    table.columns.add('count', sql.Int, { nullable: false });
    table.columns.add('last_updated', sql.Text, { nullable: false });

    return table;
});

export const createTrackTable = async (path: string) => createTable(path, () => {
    const table = new sql.Table('track');
    table.columns.add('id', sql.Int, { primary: true });
    table.columns.add('gid', sql.VarChar(255), { nullable: false });
    table.columns.add('recording', sql.Int, { nullable: false });
    table.columns.add('medium', sql.Int, { nullable: false });
    table.columns.add('position', sql.Int, { nullable: false });
    table.columns.add('number', sql.Text, { nullable: false });
    table.columns.add('name', sql.Text, { nullable: false });
    table.columns.add('artist_credit', sql.Int, { nullable: false });
    table.columns.add('length', sql.Int, { nullable: false });
    table.columns.add('edits_pending', sql.Int, { nullable: false });
    table.columns.add('last_updated', sql.Text, { nullable: false });
    table.columns.add('is_data_Track', sql.VarChar(255), { nullable: false });

    return table;
});

export const createGenreTable = async (path: string) => createTable(path, () => {
    const table = new sql.Table('genre');
    table.columns.add('id', sql.Int, { primary: true });
    table.columns.add('gid', sql.VarChar(255), { nullable: false });
    table.columns.add('genre', sql.VarChar(255), { nullable: false });
    table.columns.add('unknown_col', sql.VarChar(255), { nullable: false });
    table.columns.add('number', sql.VarChar(255), { nullable: false });
    table.columns.add('last_updated', sql.Text, { nullable: false });

    return table;
});


// Had to pass table as a function because otherwise the reference of the original table would be changed
// The idea is to only change a new "instance" of the table in this function
// This function loops through the provided file and bulk inserts them into MsSql by a 1000 at the time
const createTable = async (path: string, getTable: () => sql.Table) => {
    const sqlClient = new MsSqlClient();
    let rowCount = 0;
    let insertStatements: string[] = [];
    
    let tableInstance = getTable();
    const baseInsertStatement = `INSERT INTO ${tableInstance.name} VALUES `;

    const createTableSql = generateCreateTableSql(tableInstance);

    sqlClient.connect();

    if (tableInstance.name) {
        if (await doesTableExist(tableInstance.name)) {
            console.log(`[CREATE-TABLES] Partially aborted. Table "${tableInstance.name}" already exists.`);
            return tableInstance;
        }
    }

    await sqlClient.query(createTableSql);

    await streamFile(path, (row) => {
        if (rowCount === bulkPerNumber) {
            // console.log(`${baseInsertStatement}${insertStatements.join(',')}`.length);
            sqlClient.query(`${baseInsertStatement}${insertStatements.join(',')}`);
            rowCount = 0;
            insertStatements = [];
        }

        const typedRow = getTypedRow(row, tableInstance.columns);
        insertStatements.push(`('${typedRow.join('\', \'')}')`);
        rowCount++;
    });

    // If there are rows left after stream
    if (insertStatements.length > 0) {
        await sqlClient.query(`${baseInsertStatement}${insertStatements.join(',')}`);
    }

    sqlClient.disconnect();

    return tableInstance;
};

const doesTableExist = async (tableName: string) => {
    const sqlClient = new MsSqlClient();
    sqlClient.connect();
    const response = await sqlClient.query(`SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = N'${tableName}'`);
    sqlClient.disconnect();

    return response.length > 0;
};

const generateCreateTableSql = (table: sql.Table): string => {
    const fields: string[] = [];
    const primaryKeys: string[] = [];
    const indices: string[] = [];

    table.columns.forEach(col => {
        // @ts-ignore declaration not defined in types
        const type = col.type.declaration;
        // @ts-ignore length not defined in types
        const typeLength = col.length;

        if (col.primary) {
            primaryKeys.push(`PRIMARY KEY (${col.name})`);
        }

        if (col.name.indexOf('gid') > -1) {
            indices.push('INDEX (gid)');
        }

        fields.push(`${col.name} ${type}${typeLength ? `(${typeLength})` : ''} ${!col.nullable ? 'NOT NULL' : ''}`);
    });

    const combinedFields = fields.concat(primaryKeys).concat(indices);

    return `CREATE TABLE ${table.name} (${combinedFields.join(', ')});`;
};

const getTypedRow = (row: string[], model: sql.columns): any[] => {
    return row.map((x, index) => {
        if (model[index].name.indexOf('comment') > -1) {
            return '';
        }

        if (model[index]) {
            // @ts-ignore declaration not defined in types
            const type: ColumnTypes = model[index].type.declaration;
            switch (type) {
                case 'int':
                    return !isNaN(parseInt(x)) ? parseInt(x) : 0;
                case 'bit':
                    return x.toLocaleLowerCase() === 't' ? 1 : 0;
                case 'date':
                case 'datetime':
                    const isValidDate = !isNaN(Date.parse(x));
                    return isValidDate ? new Date(x) : null;
                default:
                    return x.replace(/\'/g, '\'\'');
            }
        }

        return x.replace(/\'/g, '\'\'');
    });
};