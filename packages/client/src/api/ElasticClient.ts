import { Aggregations, SearchResponse } from '../types/Elasticsearch';
import { ApiHelper } from './ApiHelper';

type GetFirstAndLastListenDatesAggs = {
    last: SearchResponse<{ listened_utc: number }>;
    first: SearchResponse<{ listened_utc: number }>;
};

export class ElasticClient {
    static getMostListenedArtists(startDate?: string, endDate?: string): Promise<SearchResponse<unknown, Aggregations>> {
        return ElasticClient.getElasticData(Object.assign({
            size: 0,
            aggs: {
                total_artist: {
                    terms: {
                        field: 'artist.name.keyword',
                        size: 10
                    }
                }
            }
        },
            startDate && endDate ? {
                query: {
                    range: {
                        listened_utc: {
                            gte: startDate,
                            lte: endDate,
                            format: 'yyyy-MM-dd'
                        }
                    }
                }
            } : {}
        ));
    }

    static getFirstAndLastListenDates(): Promise<SearchResponse<any, GetFirstAndLastListenDatesAggs>> {
        return ElasticClient.getElasticData({
            size: 0,
            aggs: {
                first: {
                    top_hits: {
                        size: 1,
                        sort: [
                            {
                                listened_utc: {
                                    order: 'asc'
                                }
                            }
                        ],
                        _source: 'listened_utc'
                    }
                },
                last: {
                    top_hits: {
                        size: 1,
                        sort: [
                            {
                                listened_utc: {
                                    order: 'desc'
                                }
                            }
                        ],
                        _source: 'listened_utc'
                    }
                }
            }
        });
    }

    static getElasticData<T>(query: Object): Promise<SearchResponse<T>> {
        return ApiHelper.postData('http://localhost:8080/elastic/lastfm/_search', query);
    }
}
