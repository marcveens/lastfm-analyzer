import { Component, h, State, Watch } from '@stencil/core';
import { ElasticClient } from '../../api/ElasticClient';
import { DateRange, onChange, state } from '../Datepicker/date-store';

@Component({
    tag: 'most-listened-artists'
})
export class MostListenedArtists {
    @State() artists: { name: string, total: number }[];
    @State() dateRange: DateRange = state;

    async componentWillLoad() {
        await this.getArtists();

        onChange('startDate', (date) => {
            this.dateRange = { ...this.dateRange, startDate: date };
            console.log('new start date', date);
        });

        onChange('endDate', (date) => {
            this.dateRange = { ...this.dateRange, endDate: date };
            console.log('new end date', date);
        });
    }

    @Watch('dateRange')
    async getArtists() {
        const artists = await ElasticClient.getMostListenedArtists(this.dateRange.startDate, this.dateRange.endDate);
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
