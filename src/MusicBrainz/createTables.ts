import * as sql from 'mssql/msnodesqlv8';
import { streamFile } from './parseFile';

export const createTagTable = async (path: string) => {
    const table = new sql.Table('tag');
    table.create = true;
    table.columns.add('id', sql.Int, { primary: true });
    table.columns.add('name', sql.VarChar(255), { nullable: false });
    table.columns.add('ref_count', sql.Int, { nullable: false });

    await streamFile(path, (row) => {
        const typedRow = getTypedRow(row, ['number', 'string', 'number']);
        table.rows.add(...typedRow);
    });

    return table;
};

export const createArtistTable = async (path: string) => {
    const table = new sql.Table('artist');
    table.create = true;
    table.columns.add('id', sql.Int, { primary: true });
    table.columns.add('gid', sql.UniqueIdentifier, { nullable: false });
    table.columns.add('name', sql.VarChar(255), { nullable: false });
    table.columns.add('sort_name', sql.VarChar(255), { nullable: false });
    table.columns.add('begin_date_year', sql.Int);
    table.columns.add('begin_date_month', sql.Int);
    table.columns.add('begin_date_day', sql.Int);
    table.columns.add('end_date_year', sql.Int);
    table.columns.add('end_date_month', sql.Int);
    table.columns.add('end_date_day', sql.Int);
    table.columns.add('type', sql.Int);
    table.columns.add('area', sql.Int);
    table.columns.add('comment', sql.VarChar(255), { nullable: false });
    table.columns.add('edits_pending', sql.Int);
    table.columns.add('last_updated', sql.Date);
    table.columns.add('ended', sql.Bit);
    table.columns.add('begin_area', sql.Int);
    table.columns.add('end_area', sql.Date);

    await streamFile(path, (row) => {
        const typedRow = getTypedRow(row, ['number', 'guid', 'string', 'string', 'number', 'number', 'number', 'number', 'number', 'number',
        'number', 'number', 'string', 'number', 'date', 'boolean', 'number', 'date']);
        table.rows.add(...typedRow);
    });

    return table;
};


const getTypedRow = (row: string[], model: string[]): any[] => {
    return row.map((x, index) => {
        if (model[index]) {
            switch (model[index]) {
                case 'number':
                    return parseInt(x);
                case 'boolean':
                    return x.toLocaleLowerCase() === 't' ? 1 : 0;
                case 'date': 
                    return new Date(x);
                default:
                    return x;
            }
        }

        return x;
    });
};