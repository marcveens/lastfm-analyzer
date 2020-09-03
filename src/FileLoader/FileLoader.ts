import StreamArray from 'stream-json/streamers/StreamArray';
import { Writable } from 'stream';
import fs from 'fs';
import path from 'path';

export class FileLoader {
    load = (fileName: string) => {
        const fileNameWithPath = path.resolve(__dirname, '../data', fileName);
        const fileStream = fs.createReadStream(fileNameWithPath);
        const jsonStream = StreamArray.withParser();
        const processingStream = new Writable({
            write({ key, value }, encoding, callback) {

                //some async operations
                setTimeout(() => {
                    console.log(key, value);
                    //Runs one at a time, need to use a callback for that part to work
                    callback();
                }, 1000);
            },
            //Don't skip this, as we need to operate with objects, not buffers
            objectMode: true
        });
        //Pipe the streams as follows
        fileStream.pipe(jsonStream.input);
        jsonStream.pipe(processingStream);
        //So we're waiting for the 'finish' event when everything is done.
        processingStream.on('finish', () => console.log('All done'));
    }
}