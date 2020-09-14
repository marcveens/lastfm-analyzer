import { SearchResponse } from '../types/Elasticsearch';
import { ApiHelper } from './ApiHelper';

export class ElasticClient {
    static getElasticData<T>(query: Object): Promise<SearchResponse<T>> {
        return ApiHelper.postData('http://localhost:8080/elastic/lastfm/_search', query);
    }
}
