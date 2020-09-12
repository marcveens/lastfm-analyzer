import fs from 'fs';
import * as sql from 'mssql/msnodesqlv8';
import { MsSqlClient } from '../MsSql/MsSqlClient';
import { streamFile } from './parseFile';

type ColumnTypes = 'varchar' | 'int' | 'datetime' | 'bit' | 'date' | 'uniqueidentifier';
const bulkPerNumber = 1000;

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
    table.columns.add('gid', sql.UniqueIdentifier, { nullable: false });
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
    table.columns.add('ended', sql.Bit);
    table.columns.add('begin_area', sql.Int);
    table.columns.add('end_area', sql.Text);

    return table;
});

// Had to pass table as a function because otherwise the reference of the original table would be changed
// The idea is to only change a new "instance" of the table in this function
// This function loops through the provided file and bulk inserts them into MsSql by a 1000 at the time
export const createTable = async (path: string, table: () => sql.Table) => {
    let rowCount = 0;
    let firstRun = true;

    const getTable = (create: boolean) => {
        const newTableInstance = table();
        newTableInstance.create = create;

        return newTableInstance;
    }

    let tableInstance = getTable(firstRun);

    if (tableInstance.name) {
        // Safety check. This also makes sure createTable can't be run again if it already exists
        if (await doesTableExist(tableInstance.name)) {
            console.log(`[CREATE-TABLES] Partially aborted. Table "${tableInstance.name}" already exists.`);
            return tableInstance;
        }
    }

    await streamFile(path, (row) => {
        if (rowCount === bulkPerNumber) {
            MsSqlClient.bulk(tableInstance);
            rowCount = 0;
            firstRun = false;
            tableInstance = getTable(firstRun);
        }

        const typedRow = getTypedRow(row, tableInstance.columns);
        tableInstance.rows.add(...typedRow);
        rowCount++;
    });

    // If there are rows left after stream
    if (tableInstance.rows.length > 0) {
        MsSqlClient.bulk(tableInstance);
    }

    return tableInstance;
};

const doesTableExist = async (tableName: string) => {
    const response = await MsSqlClient.query(`SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = N'${tableName}'`);
    
    return response.recordset.length > 0;
};

const getTypedRow = (row: string[], model: sql.columns): any[] => {
    return row.map((x, index) => {
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
                    return x;
            }
        }

        return x;
    });
};