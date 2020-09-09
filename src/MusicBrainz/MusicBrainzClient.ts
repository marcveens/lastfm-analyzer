import { ArtistColumns, artistColumns } from './Columns';
import { parseFile } from './parseFile';

export type ValuesOf<T extends any[]> = T[number];


type Cache = { [key: string]: string[] };

export class MusicBrainzClient {
    mbdumpPath = process.env.MBDUMP_PATH;
    mbdumpDerivedPath = process.env.MBDUMP_DERIVED_PATH;

    artistCache: Cache = {};

    // getArtist = async (mbid: string) => {
    //     try {
    //         const artist = await parseFile(`${this.mbdumpPath}/artist`, (record: string[]) => {
    //             const guidColumnIndex = this.getIndexOfColumn(artistColumns, 'gid');

    //             return record[guidColumnIndex] === mbid ? mbid : null;
    //         });

    //         return artist;
    //     } catch (e) {
    //         return null;
    //     }
    // }

    getArtists = async (mbids: string[]) => {
        try {
            const artists = await parseFile(`${this.mbdumpPath}/artist`, (record: string[]) => {
                const guidColumnIndex = this.getIndexOfColumn(artistColumns, 'gid');
                return mbids.indexOf(record[guidColumnIndex]) > -1;
            });

            return this.mapListToModel<ArtistColumns>(artists, artistColumns);
        } catch (e) {
            return null;
        }
    }

    // TODO
    getArtistTags = async (artistIds: string[]) => {

    }

    private getIndexOfColumn = <T extends string[]>(columns: T, columnToFind: string) => {
        return columns.findIndex(c => c === columnToFind);
    }

    private mapListToModel = <T>(artists: string[], keys: string[]): T[] => {
        // Loop over all artists found in the MusicBrainz DB
        return artists.map(artist => {
            // Map the artist string array to a readable object with columnToFind keys
            return keys.reduce((model: T, key: string, index: number) => {
                model[key] = artist[index];

                return model;
            }, {} as T);
        });
    }
}