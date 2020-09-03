import { Client } from '@elastic/elasticsearch';

export class ElasticSearchClient {
    private client: Client;

    constructor() {
        this.client = new Client({ node: 'http://localhost:9200' });

    }

    getIndices = async () => {
        const indices = await this.client.cat.indices();
        console.log(indices);
    }
}