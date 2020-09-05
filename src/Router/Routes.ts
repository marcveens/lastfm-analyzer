import express from 'express';
import path from 'path';
import { ElasticSearchClient } from '../ElasticSearch/ElasticSearchClient';
import { indexNames } from '../ElasticSearch/indexNames';

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

    static populateLastFMIndex = (esClient: ElasticSearchClient) => Routes.processRoute(async (res) => {
        res.send(await esClient.addDocument(indexNames.lastfm, { test: 1, bla: 'test' }));
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