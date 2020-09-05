import StreamArray from 'stream-json/streamers/StreamArray';
import fs from 'fs';
import path from 'path';

export class FileLoader {
    load = (fileName: string) => {
        // https://github.com/uhop/stream-json/wiki/StreamArray
        const fileNameWithPath = path.resolve(__dirname, '../data', fileName);
        const pipeline = fs.createReadStream(fileNameWithPath).pipe(StreamArray.withParser());

        return pipeline;
    }
}