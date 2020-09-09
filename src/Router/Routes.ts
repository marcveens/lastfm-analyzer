import express from 'express';
import path from 'path';
import { ElasticSearchClient } from '../ElasticSearch/ElasticSearchClient';
import { indexNames } from '../ElasticSearch/indexNames';
import { FileLoader } from '../FileLoader/FileLoader';
import { mapLastFmRecord } from '../LastFm/mapLastFmRecord';
import { MusicBrainzClient } from '../MusicBrainz/MusicBrainzClient';
import { LastFmPage, LastFmTrack } from '../types/LastFmImport';

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
        const fileName = process.env.FILENAME;
        const fileLoader = new FileLoader();
        const jsonStream = fileLoader.load(fileName!);
        const musicBrainzClient = new MusicBrainzClient();
        let trackList: LastFmTrack[] = [];
        let artistMbids: string[] = [];

        jsonStream.on('data', ({ value }: { value: LastFmPage }) => {
            trackList = trackList.concat(value.track.map(track => {
                const artistMbId = track.artist.mbid;

                if (artistMbId && artistMbids.indexOf(artistMbId) === -1) {
                    artistMbids.push(track.artist.mbid);
                }

                return mapLastFmRecord(track);
            }));
        });

        jsonStream.on('end', async () => {
            const artists = await musicBrainzClient.getArtists(artistMbids);

            // Enrich with MusicBrainz data
            trackList = trackList.map(track => {
                if (artists) {
                    const matchingArtistInfo = artists.find(a => track.artist.mbid === a.gid);

                    if (matchingArtistInfo) {
                        track.artist.extras = matchingArtistInfo;
                    }
                }

                return track;
            });

            await esClient.addDocuments(indexNames.lastfm, trackList);
            res.send(`${trackList.length} documents added`);
        });
    })

    static populateArtistsIndex = (esClient: ElasticSearchClient) => Routes.processRoute(async (res) => {
        const filepath = "E:/musicbrainz/mbdump.tar/mbdump/mbdump/track";
        // parseFile(filepath);

        res.send('ok');
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