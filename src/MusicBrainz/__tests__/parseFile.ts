import { parseFile } from '../parseFile';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';

describe('parseFile', () => {
    it('should work', () => {
        const filepath = path.resolve(__dirname, './data/artist');

        fs.createReadStream(filepath)
            .on('error', (e) => {
                // handle error
                console.log(e);
            })
            .pipe(csv({
                separator: '\t',
                headers: ['id', 'gid', 'name', 'sort_name', 'begin_date_year', 'begin_date_month', 'begin_date_day', 'end_date_year', 'end_date_month', 'end_date_day', 'type', 'area', 'gender', 'comment', 'edits_pending', 'last_updated', 'ended', 'begin_area', 'end_area']
            }))
            .on('data', (row) => {
                console.log('row', row);
            })

            .on('end', () => {
                // handle end of CSV
                console.log('done');
            })

        // const parser = parse({
        //     delimiter: ':'
        // });
        // parser.on('readable', function () {
        //     let record
        //     while (record = parser.read()) {
        //         output.push(record)
        //     }
        // })

        // parser.on('error', function (err) {
        //     console.error(err.message)
        // })
        // // When we are done, test that the parsed output matched what expected
        // parser.on('end', function () {
        //     assert.deepEqual(
        //         output,
        //         [
        //             ['root', 'x', '0', '0', 'root', '/root', '/bin/bash'],
        //             ['someone', 'x', '1022', '1022', '', '/home/someone', '/bin/bash']
        //         ]
        //     )
        // })
    });
});