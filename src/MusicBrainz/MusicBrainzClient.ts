import * as sql from 'mssql/msnodesqlv8';
import { ArtistColumns, artistColumns, ArtistTagColumns, artistTagColumns, genreColumns, GenreColumns, recordingTagColumns, RecordingTagColumns, releaseColumns, ReleaseColumns, releaseTagColumns, ReleaseTagColumns, tagColumns, TagColumns, trackColumns, TrackColumns } from './Columns';
import { parseFile, streamFile } from './parseFile';
import uniq from 'lodash/uniq';
import { MsSqlClient } from '../MsSql/MsSqlClient';
import { createArtistTable, createTagTable } from './createTables';
import Queue from 'bull';
import { setQueues } from 'bull-board';

type GenericMusicModel<T> = { [key in keyof T]: string };

export class MusicBrainzClient {
    private mbdumpPath = process.env.MBDUMP_PATH;
    private mbdumpDerivedPath = process.env.MBDUMP_DERIVED_PATH;

    private genresCache: GenericMusicModel<GenreColumns>[] = [];

    constructor() {
        this.fillGenreCache();
    }

    getArtists = async (mbids: string[]) => {
        try {
            return await this.getModelFromFileByIdList<ArtistColumns>(mbids, `${this.mbdumpPath}/artist`, artistColumns, 'gid');
        } catch (e) {
            return [];
        }
    }

    getArtistTags = async (artistIds: string[]) => {
        try {
            let artistTags = await this.getModelFromFileByIdList<ArtistTagColumns>(artistIds, `${this.mbdumpDerivedPath}/artist_tag`, artistTagColumns, 'artist');
            const uniqueTags = uniq(artistTags.map(x => x.tag));
            const tags = await this.getModelFromFileByIdList<TagColumns>(uniqueTags, `${this.mbdumpDerivedPath}/tag`, tagColumns, 'id');

            artistTags = artistTags.map(x => ({
                ...x,
                tag: tags.find(t => x.tag === t.id)?.name || x.tag
            }));

            return artistTags;

        } catch (e) {
            return [];
        }
    }

    getAlbums = async (mbids: string[]) => {
        try {
            return await this.getModelFromFileByIdList<ReleaseColumns>(mbids, `${this.mbdumpPath}/release`, releaseColumns, 'gid');
        } catch (e) {
            return [];
        }
    }

    getAlbumTags = async (albumIds: string[]) => {
        try {
            let albumTags = await this.getModelFromFileByIdList<ReleaseTagColumns>(albumIds, `${this.mbdumpDerivedPath}/release_tag`, releaseTagColumns, 'release');
            const uniqueTags = uniq(albumTags.map(x => x.tag));
            const tags = await this.getModelFromFileByIdList<TagColumns>(uniqueTags, `${this.mbdumpDerivedPath}/tag`, tagColumns, 'id');

            albumTags = albumTags.map(x => ({
                ...x,
                tag: tags.find(t => x.tag === t.id)?.name || x.tag
            }));

            return albumTags;

        } catch (e) {
            return [];
        }
    }

    getTracks = async (mbids: string[]) => {
        try {
            return await this.getModelFromFileByIdList<TrackColumns>(mbids, `${this.mbdumpPath}/track`, trackColumns, 'gid');
        } catch (e) {
            return [];
        }
    }

    getTrackTags = async (trackIds: string[]) => {
        try {
            let trackTags = await this.getModelFromFileByIdList<RecordingTagColumns>(trackIds, `${this.mbdumpDerivedPath}/recording_tag`, recordingTagColumns, 'recording');
            const uniqueTags = uniq(trackTags.map(x => x.tag));
            const tags = await this.getModelFromFileByIdList<TagColumns>(uniqueTags, `${this.mbdumpDerivedPath}/tag`, tagColumns, 'id');

            trackTags = trackTags.map(x => ({
                ...x,
                tag: tags.find(t => x.tag === t.id)?.name || x.tag
            }));

            return trackTags;

        } catch (e) {
            return [];
        }
    }

    getGenres = (tagNames: string[]): string[] => {
        try {
            return this.genresCache.reduce<string[]>((genreList, genre) => {
                if (tagNames.indexOf(genre.genre) > -1) {
                    genreList.push(genre.genre);
                }

                return genreList;
            }, []);
        } catch (e) {
            return [];
        }
    }

    createTables = async () => {
        const createTablesQueue = new Queue('CreateTables');
        setQueues(createTablesQueue);

        createTablesQueue.process(async (job, done) => {
            try {
                console.log('[CREATE-TABLES] Start');
                await createTagTable(`${this.mbdumpDerivedPath}/tag`);
                await createArtistTable(`${this.mbdumpPath}/artist`);

                console.log('[CREATE-TABLES] Done');
                done();

            } catch (err) {
                console.log('Err', err);
                job.moveToFailed(err);
            }
        });

        createTablesQueue.add({});
    }

    deleteTables = async () => {
        const tables: string[] = ['tag'];

        try {
            console.log('[DELETE-TABLES] Start');
            await MsSqlClient.query(tables.map(x => `DROP TABLE IF EXISTS ${x}`).join(';'));
            console.log('[DELETE-TABLES] Done');
        } catch (err) {
            console.log(err);
        }
    };

    private fillGenreCache = async () => {
        try {
            const rawGenres = await parseFile(`${this.mbdumpPath}/genre`, () => true);
            const genres = this.mapListToModel<GenreColumns>(rawGenres, genreColumns);
            this.genresCache = genres;
        } catch (e) {
        }
    };

    private getModelFromFileByIdList = async <T>(idList: string[], filePath: string, columns: (keyof T)[], columnToFind: keyof T): Promise<GenericMusicModel<T>[]> => {
        const musicData = await parseFile(`${filePath}`, (record: string[]) => {
            const idColumnIndex = this.getIndexOfColumn<T>(columns, columnToFind);
            return idList.indexOf(record[idColumnIndex]) > -1;
        });

        return this.mapListToModel<T>(musicData, columns);
    }


    private getIndexOfColumn = <T>(columns: (keyof T)[], columnToFind: keyof T) => {
        return columns.findIndex(c => c === columnToFind);
    }

    private mapListToModel = <T>(data: string[], keys: (keyof T)[]): GenericMusicModel<T>[] => {
        // Loop over all data items found in the MusicBrainz DB
        return data.map(dataItem => {
            // Map the data items string array to a readable object with columnToFind keys
            return keys.reduce((model: GenericMusicModel<T>, key: keyof T, index: number) => {
                model[key] = dataItem[index];

                return model;
            }, {} as GenericMusicModel<T>);
        });
    }
}