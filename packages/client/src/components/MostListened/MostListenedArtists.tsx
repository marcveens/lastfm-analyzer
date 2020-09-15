import { Component, h, State } from '@stencil/core';
import { ElasticClient } from '../../api/ElasticClient';
import { onChange } from '../Datepicker/date-store';

@Component({
    tag: 'most-listened-artists'
})
export class MostListenedArtists {
    @State() artists: { name: string, total: number }[];

    async componentWillLoad() {
        const artists = await ElasticClient.getMostListenedArtists();
        this.artists = artists.aggregations.total_artist.buckets.map(x => ({ name: x.key, total: x.doc_count }));

        onChange('startDate', (date) => {
            console.log('new start date', date);
        });

        onChange('endDate', (date) => {
            console.log('new end date', date);
        });
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
