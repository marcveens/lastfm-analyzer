import fs from 'fs';
import es from 'event-stream';

export const parseFile = (filePath: string, resolveAt: (columns: string[]) => boolean): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const resultCache: string[] = [];
        fs.createReadStream(filePath)
            .pipe(es.split())
            .pipe(es
                .mapSync(line => {
                    const splitLine = line.split('\t');
                    const foundMbid = resolveAt(splitLine);

                    if (foundMbid) {
                        resultCache.push(splitLine.map(x => x === '\\N' ? '' : x));
                    }
                })
                .on('error', reject)
                .on('end', () => {
                    console.log(`done streaming ${filePath}`);
                    resolve(resultCache);
                })
            );
    });
};

export const streamFile = (filePath: string, getRow: (columns: string[]) => void): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(es.split())
            .pipe(es
                .mapSync((line: string) => {
                    const splitLine = line.split('\t');
                    if (splitLine.length > 0 && splitLine[0] !== '') {
                        getRow(splitLine);
                    }
                })
                .on('error', reject)
                .on('end', () => {
                    console.log(`done streaming ${filePath}`);
                    resolve();
                })
            );
    });
};