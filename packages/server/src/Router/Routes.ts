import express from 'express';
import path from 'path';
import { ElasticSearchClient } from '../ElasticSearch/ElasticSearchClient';
import { indexNames } from '../ElasticSearch/indexNames';
import { FileLoader } from '../FileLoader/FileLoader';
import { mapLastFmRecord } from '../LastFm/mapLastFmRecord';
import { MusicBrainzClient } from '../MusicBrainz/MusicBrainzClient';
import { LastFmPage, LastFmTrack } from '../types/LastFmImport';
import Queue from 'bull';
import { setQueues } from 'bull-board';
import { SqlClient } from '../Sql/SqlClient';

type ProcessRouteCallbackType = (res: express.Response, req: express.Request) => Promise<void>;

async function asyncForEach<T>(array: T[], callback: (item: T, index: number, array: T[]) => Promise<void>) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

export class Routes {
    static getIndices = (esClient: ElasticSearchClient) => Routes.processRoute(async (res) => {
        res.send(await esClient.getIndices());
    })

    static createLastFmIndex = (esClient: ElasticSearchClient) => Routes.processRoute(async (res) => {
        res.send(await esClient.createIndex(indexNames.lastfm, {
            mappings: {
                properties: {
                    listened_utc: { type: 'date', format: 'epoch_second' }
                }
            }
        }));
    })

    static deleteLastFmIndex = (esClient: ElasticSearchClient) => Routes.processRoute(async (res) => {
        res.send(await esClient.deleteIndex(indexNames.lastfm));
    })

    static resetLastFmIndex = (esClient: ElasticSearchClient) => Routes.processRoute(async (res) => {
        await esClient.deleteIndex(indexNames.lastfm);
        await esClient.createIndex(indexNames.lastfm, {
            mappings: {
                properties: {
                    listened_utc: { type: 'date', format: 'epoch_second' }
                }
            }
        });
        res.send({ message: 'LastFM index deleted and created' });
    })

    static populateLastFMIndex = (esClient: ElasticSearchClient) => Routes.processRoute(async (res) => {
        
        const populateLastFMIndexQueue = new Queue('populateLastFMIndex');
        setQueues(populateLastFMIndexQueue);
        console.log('start process');
        populateLastFMIndexQueue.process((job, done) => {
            const startTime = process.hrtime();
            const fileName = process.env.FILENAME;
            const fileLoader = new FileLoader();
            const jsonStream = fileLoader.load(fileName!);
            const musicBrainzClient = new MusicBrainzClient();
            const sqlClient = new SqlClient();
            const processTrackPromises: Promise<void>[] = [];
            let trackCountPerPage = 0;
            let trackCount = 0;

            sqlClient.connect();

            jsonStream.on('data', ({ value }: { value: LastFmPage }) => {
                const trackList: LastFmTrack[] = value.track.map(mapLastFmRecord);
                trackCountPerPage += value.track.length;

                const processTrack = new Promise<void>(async (resolve, reject) => {
                    try {
                        const enrichedTrackList: LastFmTrack[] = [];
                        await asyncForEach(trackList, async (track) => {
                            trackCount++;
                            const artistsGenres = await musicBrainzClient.getArtistGenres(track.artist.mbid, sqlClient);
                            const albumGenres = await musicBrainzClient.getAlbumGenres(track.album.mbid, sqlClient);
                            const trackGenres = await musicBrainzClient.getTrackGenres(track.track.mbid, sqlClient);

                            console.log('Fetched data for track', trackCount);

                            if (artistsGenres.length > 0) {
                                track.artist.genres = artistsGenres.map(x => x.name);
                            }

                            if (albumGenres.length > 0) {
                                track.album.genres = albumGenres.map(x => x.name);
                            }

                            if (trackGenres.length > 0) {
                                track.track.genres = trackGenres.map(x => x.name);
                            }

                            enrichedTrackList.push(track);
                        });

                        await esClient.addDocuments(indexNames.lastfm, enrichedTrackList);

                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                });

                processTrackPromises.push(processTrack);
            });

            jsonStream.on('end', async () => {
                Promise.all(processTrackPromises)
                    .then(() => {
                        sqlClient.disconnect();

                        const endTime = process.hrtime(startTime);
                        console.info(`populateLastFMIndex done | ${trackCountPerPage} items added | execution time: ${endTime[0]}s ${endTime[1] / 1000000}ms`);
                        job.progress(100);
                        done();
                    });
            });
        });

        populateLastFMIndexQueue.add({});

        res.send(`Index population in progress..`);
    })

    static createMusicBrainzTables = (mbClient: MusicBrainzClient) => Routes.processRoute(async (res) => {
        mbClient.createTables();
        res.send(`Tables created`);
    })

    static deleteMusicBrainzTables = (mbClient: MusicBrainzClient) => Routes.processRoute(async (res) => {
        mbClient.deleteTables();
        res.send(`Tables deleted`);
    })

    static homepage = () => Routes.processRoute(async (res) => {
        res.sendFile(path.resolve(__dirname, '../views/index.html'));
    })

    private static processRoute = (cb: ProcessRouteCallbackType) => async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            await cb(res, req);
        } catch (e) {
            next(e);
        }
    }
};