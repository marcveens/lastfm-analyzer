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

type ProcessRouteCallbackType = (res: express.Response, req: express.Request) => Promise<void>;

export class Routes {
    static getIndices = (esClient: ElasticSearchClient) => Routes.processRoute(async (res) => {
        res.send(await esClient.getIndices());
    })

    static createLastFmIndex = (esClient: ElasticSearchClient) => Routes.processRoute(async (res) => {
        res.send(await esClient.createIndex(indexNames.lastfm));
    })

    static deleteLastFmIndex = (esClient: ElasticSearchClient) => Routes.processRoute(async (res) => {
        res.send(await esClient.deleteIndex(indexNames.lastfm));
    })

    static resetLastFmIndex = (esClient: ElasticSearchClient) => Routes.processRoute(async (res) => {
        await esClient.deleteIndex(indexNames.lastfm);
        await esClient.createIndex(indexNames.lastfm);
        res.send({ message: 'LastFM index deleted and created' });
    })

    static populateLastFMIndex = (esClient: ElasticSearchClient) => Routes.processRoute(async (res) => {
        const startTime = process.hrtime();

        const populateLastFMIndexQueue = new Queue('populateLastFMIndex');
        setQueues(populateLastFMIndexQueue);
        console.log('start process');
        populateLastFMIndexQueue.process((job, done) => {
            const fileName = process.env.FILENAME;
            const fileLoader = new FileLoader();
            const jsonStream = fileLoader.load(fileName!);
            const musicBrainzClient = new MusicBrainzClient();
            let trackList: LastFmTrack[] = [];
            let artistMbids: string[] = [];
            let albumMbids: string[] = [];
            let trackMbids: string[] = [];

            jsonStream.on('data', ({ value }: { value: LastFmPage }) => {
                trackList = trackList.concat(value.track.map(track => {
                    const artistMbid = track.artist.mbid;
                    const albumMbid = track.album.mbid;
                    const trackMbid = track.mbid;

                    if (artistMbid && artistMbids.indexOf(artistMbid) === -1) {
                        artistMbids.push(artistMbid);
                    }

                    if (albumMbid && albumMbids.indexOf(albumMbid) === -1) {
                        albumMbids.push(albumMbid);
                    }

                    if (trackMbid && trackMbids.indexOf(trackMbid) === -1) {
                        trackMbids.push(trackMbid);
                    }

                    return mapLastFmRecord(track);
                }));
            });

            jsonStream.on('end', async () => {
                const artists = await musicBrainzClient.getArtists(artistMbids);
                job.progress(20);
                const albums = await musicBrainzClient.getAlbums(albumMbids);
                job.progress(40);
                const tracks = await musicBrainzClient.getTracks(trackMbids);
                job.progress(60);
                const artistTags = await musicBrainzClient.getArtistTags(artists.map(x => x.id));
                const albumTags = await musicBrainzClient.getAlbumTags(albums.map(x => x.id));
                const trackTags = await musicBrainzClient.getTrackTags(tracks.map(x => x.recording));

                // Enrich with MusicBrainz data
                trackList = trackList.map(track => {
                    const matchingArtistInfo = artists.find(x => track.artist.mbid === x.gid);
                    const matchingAlbumInfo = albums.find(x => track.album.mbid === x.gid);
                    const matchingTrackInfo = tracks.find(x => track.track.mbid === x.gid);

                    if (matchingArtistInfo) {
                        const matchingArtistTags = artistTags.filter(x => matchingArtistInfo.id === x.artist);
                        const genres = musicBrainzClient.getGenres(matchingArtistTags.map(x => x.tag));
                        track.artist.extras = matchingArtistInfo;
                        track.artist.genres = genres;
                    }

                    if (matchingAlbumInfo) {
                        const matchingAlbumTags = albumTags.filter(x => matchingAlbumInfo.id === x.release);
                        const genres = musicBrainzClient.getGenres(matchingAlbumTags.map(x => x.tag));
                        track.album.extras = matchingAlbumInfo;
                        track.album.genres = genres;
                    }

                    if (matchingTrackInfo) {
                        const matchingTrackTags = trackTags.filter(x => matchingTrackInfo.id === x.recording);
                        const genres = musicBrainzClient.getGenres(matchingTrackTags.map(x => x.tag));
                        track.track.extras = matchingTrackInfo;
                        track.track.genres = genres;
                    }

                    return track;
                });

                await esClient.addDocuments(indexNames.lastfm, trackList);
                job.progress(80);
                const endTime = process.hrtime(startTime);
                console.info(`populateLastFMIndex done | ${trackList.length} items added | execution time: ${endTime[0]}s ${endTime[1] / 1000000}ms`);
                job.progress(100);
                done();
            });
        });

        console.log('add process');
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