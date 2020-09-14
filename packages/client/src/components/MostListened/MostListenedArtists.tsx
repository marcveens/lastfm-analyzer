import { Component, h, State } from '@stencil/core';
import { ElasticClient } from '../../api/ElasticClient';

@Component({
    tag: 'most-listened-artists'
})
export class MostListenedArtists {
    @State() artists: { name: string, total: number }[];

    async componentWillLoad() {
        const artists = await ElasticClient.getElasticData({
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

        this.artists = artists.aggregations.total_artist.buckets.map(x => ({ name: x.key, total: x.doc_count }));
    }

    render() {
        return (
            <div>
                <h3>Top 10 most listened artists</h3>
                <ul>
                    {this.artists.map(artist => (
                        <li>{artist.name} ({artist.total})</li>
                    ))}
                </ul>
            </div>
        );
    }
}
