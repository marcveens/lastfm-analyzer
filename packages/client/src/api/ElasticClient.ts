import { Aggregations, SearchResponse } from '../types/Elasticsearch';
import { ApiHelper } from './ApiHelper';

export class ElasticClient {
    static getMostListenedArtists(): Promise<SearchResponse<unknown, Aggregations>> {
        return ElasticClient.getElasticData({
            size: 0,
            aggs: {
                total_artist: {
                    terms: {
                        field: 'artist.name.keyword',
                        size: 10
                    }
                }
            }
        });
    }

    static getElasticData<T>(query: Object): Promise<SearchResponse<T>> {
        return ApiHelper.postData('http://localhost:8080/elastic/lastfm/_search', query);
    }
}
