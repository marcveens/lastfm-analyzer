import express from 'express';
import path from 'path';
import { ElasticSearchClient } from '../ElasticSearch/ElasticSearchClient';
import { indexNames } from '../ElasticSearch/indexNames';
import { FileLoader } from '../FileLoader/FileLoader';
import { mapLastFmRecord } from '../LastFm/mapLastFmRecord';
import { MusicBrainzClient } from '../MusicBrainz/MusicBrainzClient';
import { LastFmPage } from '../types/LastFmImport';

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
        res.send(await esClient.createIndex(indexNames.lastfm));
    })

    static populateLastFMIndex = (esClient: ElasticSearchClient) => Routes.processRoute(async (res) => {
        res.send(await MusicBrainzClient.getRelease());
        
        // const fileName = process.env.FILENAME;
        // const fileLoader = new FileLoader();
        // const jsonStream = fileLoader.load(fileName!);
        // let docList: unknown[] = [];

        // jsonStream.on('data', ({ value }: { value: LastFmPage }) => {
        //     docList = docList.concat(value.track.map(mapLastFmRecord));
        // });

        // jsonStream.on('end', async () => {
        //     await esClient.addDocuments(indexNames.lastfm, docList);
        //     res.send(`${docList.length} documents added`);
        // });
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