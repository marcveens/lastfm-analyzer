import { ArtistsFirstAppearancesAggs } from '../components/Artists/FirstAppearance';
import { GenresAggregation } from '../components/MostListened/mappers/mapGenresToChartData';
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

    static getMostListenedGenres(startDate?: string, endDate?: string): Promise<SearchResponse<unknown, Aggregations>> {
        return ElasticClient.getElasticData(Object.assign({
            size: 0,
            aggs: {
                total_genres: {
                    terms: {
                        field: 'album.genres.keyword',
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

    static getMostListenedGenresPerMonth(): Promise<SearchResponse<unknown, GenresAggregation>> {
        return ElasticClient.getElasticData({
            size: 0,
            aggs: {
                group_by_month: {
                    date_histogram: {
                        field: 'listened_utc',
                        calendar_interval: 'month'
                    },
                    aggs: {
                        total_genres: {
                            terms: {
                                field: 'album.genres.keyword',
                                size: 5
                            }
                        }
                    }
                }
            }
        });
    }

    static getAllUniqueGenres(): Promise<SearchResponse<unknown, Aggregations>> {
        return ElasticClient.getElasticData({
            size: 0,
            aggs: {
                unique_genres: {
                    terms: {
                        field: 'album.genres.keyword',
                        size: 1000
                    }
                }
            }
        });
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

    static getArtistFirstAppearances(artist?: string): Promise<SearchResponse<unknown, ArtistsFirstAppearancesAggs>> {
        return ElasticClient.getElasticData(Object.assign({
            size: 0,
            aggs: {
                artists: {
                    terms: {
                        field: 'artist.name.keyword'
                    },
                    aggs: {
                        first_appearance: {
                            top_hits: {
                                size: 1,
                                sort: [
                                    {
                                        listened_utc: {
                                            order: 'asc'
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        }, artist ? {
            query: {
                match: {
                    'artist.name': artist
                }
            }
        } : {}));
    }

    static getElasticData<T>(query: Object): Promise<SearchResponse<T>> {
        return ApiHelper.postData('http://localhost:8080/elastic/lastfm/_search', query);
    }
}
