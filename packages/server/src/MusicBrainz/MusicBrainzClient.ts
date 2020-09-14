import { SqlClient } from '../Sql/SqlClient';
import { createArtistTable, createArtistTagTable, createGenreTable, createRecordingTagTable, createReleaseGroupTable, createReleaseGroupTagTable, createReleaseTable, createReleaseTagTable, createTagTable, createTrackTable } from './createTables';
import Queue from 'bull';
import { setQueues } from 'bull-board';

type GetGenres = {
    name: string;
}[];

export class MusicBrainzClient {
    private mbdumpPath = process.env.MBDUMP_PATH;
    private mbdumpDerivedPath = process.env.MBDUMP_DERIVED_PATH;

    private artistCache: { [key: string]: GetGenres } = {};
    private albumCache: { [key: string]: GetGenres } = {};
    private trackCache: { [key: string]: GetGenres } = {};


    getArtistGenres = async (mbid: string, sqlClient: SqlClient): Promise<GetGenres> => {
        try {
            if (this.artistCache[mbid]) {
                return Promise.resolve(this.artistCache[mbid]);
            }

            const query = `
                SELECT tag.name FROM artist 
                LEFT JOIN artist_tag ON artist_tag.artist = artist.id
                INNER JOIN tag ON artist_tag.tag = tag.id
                INNER JOIN genre ON tag.id = genre.id
                WHERE artist.gid = '${mbid}'            
            `;
            const res = await sqlClient.query(query);

            this.artistCache[mbid] = res;

            return res;
        } catch (e) {
            return [];
        }
    }

    getAlbumGenres = async (mbid: string, sqlClient: SqlClient): Promise<GetGenres> => {
        try {
            if (this.albumCache[mbid]) {
                return Promise.resolve(this.albumCache[mbid]);
            }

            const query = `
                SELECT tag.name FROM release_ 
                LEFT JOIN release_group ON release_group.id = release_.release_group
                LEFT JOIN release_group_tag ON release_group_tag.release_group = release_group.id
                INNER JOIN tag ON release_group_tag.tag = tag.id
                INNER JOIN genre ON tag.id = genre.id
                WHERE release_.gid = '${mbid}'            
            `;
            const res = await sqlClient.query(query);
            
            this.albumCache[mbid] = res;

            return res;
        } catch (e) {
            return [];
        }
    }

    getTrackGenres = async (mbid: string, sqlClient: SqlClient): Promise<GetGenres> => {
        try {
            if (this.trackCache[mbid]) {
                return Promise.resolve(this.trackCache[mbid]);
            }

            const query = `
                SELECT tag.name FROM track 
                LEFT JOIN recording_tag ON recording_tag.recording = track.recording
                INNER JOIN tag ON recording_tag.tag = tag.id
                INNER JOIN genre ON tag.id = genre.id
                WHERE track.gid = '${mbid}'            
            `;
            const res = await sqlClient.query(query);
            
            this.trackCache[mbid] = res;

            return res;
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
                await createArtistTagTable(`${this.mbdumpDerivedPath}/artist_tag`);
                await createReleaseTable(`${this.mbdumpPath}/release`);
                await createReleaseTagTable(`${this.mbdumpDerivedPath}/release_tag`);
                await createReleaseGroupTable(`${this.mbdumpPath}/release_group`);
                await createReleaseGroupTagTable(`${this.mbdumpDerivedPath}/release_group_tag`);
                await createRecordingTagTable(`${this.mbdumpDerivedPath}/recording_tag`);
                await createTrackTable(`${this.mbdumpPath}/track`);
                await createGenreTable(`${this.mbdumpPath}/genre`);

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
        const tables: string[] = ['genre'];

        try {
            console.log('[DELETE-TABLES] Start');
            const sqlClient = new SqlClient();
            sqlClient.connect();
            await sqlClient.query(tables.map(x => `DROP TABLE IF EXISTS ${x}`).join(';'));
            sqlClient.disconnect();
            console.log('[DELETE-TABLES] Done');
        } catch (err) {
            console.log(err);
        }
    }
}