import { Client } from '@elastic/elasticsearch';

export class ElasticSearchClient {
    // https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html
    private client: Client;

    constructor() {
        this.client = new Client({ node: 'http://localhost:9200' });
    }

    getIndices = async () => {
        return await this.client.cat.indices();
    }

    createIndex = async (name: string) => {
        return await this.client.indices.create({
            index: name
        });
    }

    deleteIndex = async (name: string) => {
        return await this.client.indices.delete({
            index: name
        });
    }

    addDocument = async (index: string, body: Object) => {
        return await this.client.index({
            index,
            body
        });
    }

    addDocuments = async (index: string, data: any[]) => {
        console.log('bulk', data.length);
        return await this.client.helpers.bulk({
            datasource: data,
            onDocument (doc) {
                return {
                  index: { _index: index }
                }
              }
        })
        .then(() => console.log('done'))
        .catch(e => console.log(e.meta));
    }
}