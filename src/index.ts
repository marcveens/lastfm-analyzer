import express from 'express';
import { ElasticSearchClient } from './ElasticSearch/ElasticSearchClient';
import { Routes } from './Router/Routes';

require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;
const fileName = process.env.FILENAME;
const esClient = new ElasticSearchClient();

if (!fileName) {
    throw new Error('No fileName provided as env variable');
}

app.get('/', Routes.homepage());
app.get('/indices', Routes.getIndices(esClient));
app.get('/create-lastfm-index', Routes.createLastFmIndex(esClient));
app.get('/delete-lastfm-index', Routes.deleteLastFmIndex(esClient));
app.get('/reset-lastfm-index', Routes.resetLastFmIndex(esClient));
app.get('/populate-lastfm-index', Routes.populateLastFMIndex(esClient));
app.get('/populate-artists-index', Routes.populateArtistsIndex(esClient));

app.listen(port, () => {
    console.log(`LastFM analyzer listening at http://localhost:${port}`)
});