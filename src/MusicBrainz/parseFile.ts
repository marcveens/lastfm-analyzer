import fs from 'fs';
import es from 'event-stream';

/**
 * Streams a file with a resolveAt callback. 
 * The resolveAt callback is called for every line found in the file.
 * If the resolveAt callback receives a "true" as a response, the line is temporarily saved in a list.
 * The parseFile promise resolves when all lines are streamed and returns the list of saved lines.
 */
export const parseFile = (filePath: string, resolveAt: (columns: string[]) => boolean): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const resultCache: string[] = [];
        fs.createReadStream(filePath)
            .pipe(es.split())
            .pipe(es
                .mapSync(line => {
                    const splitLine = line.replace(/\\N/g, '').split('\t');
                    const foundMbid = resolveAt(splitLine);

                    if (foundMbid) {
                        resultCache.push(splitLine);
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

/**
 * Streams a file and calls the getRow callback for every non-empty line
 * @param filePath path of the file to stream
 * @param getRow Callback called for every streamed non-empty line
 */
export const streamFile = (filePath: string, getRow: (columns: string[]) => void): Promise<void> => {
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(es.split())
            .pipe(es
                .mapSync((line: string) => {
                    const splitLine = line.replace(/\\N/g, '').split('\t');
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