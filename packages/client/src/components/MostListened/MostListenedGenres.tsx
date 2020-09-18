import { Component, h, State, Watch } from '@stencil/core';
import { ElasticClient } from '../../api/ElasticClient';
import { DateRange, onChange, state } from '../Datepicker/date-store';
import ApexCharts from 'apexcharts';

@Component({
    tag: 'most-listened-genres'
})
export class MostListenedGenres {
    @State() genres: { name: string, total: number }[] = [];
    @State() dateRange: DateRange = state;

    async componentWillLoad() {
        await this.getGenres();

        onChange('startDate', date => this.dateRange = { ...this.dateRange, startDate: date });
        onChange('endDate', date => this.dateRange = { ...this.dateRange, endDate: date });
    }

    componentDidRender() {
        this.runChart();
    }

    @Watch('dateRange')
    async getGenres() {
        const genres = await ElasticClient.getMostListenedGenres(this.dateRange.startDate, this.dateRange.endDate);
        this.genres = genres.aggregations.total_genres.buckets.map(x => ({ name: x.key, total: x.doc_count }));
    }

    runChart() {
        const options = {
            chart: {
                type: 'bar',
                toolbar: {
                    show: false
                }
            },
            series: [
                {
                    name: 'genre',
                    data: this.genres.map(g => g.total)
                }
            ],
            xaxis: {
                categories: this.genres.map(g => g.name)
            }
        };
        const chart = new ApexCharts(document.getElementById('myChart'), options);
        chart.render();
    }

    render() {
        return (
            <div>
                <h3>Top 10 most listened genres</h3>
                <div id="myChart" />

                <ul>
                    {this.genres.map(genre => (
                        <li>{genre.name} ({genre.total})</li>
                    ))}
                </ul>
            </div>
        );
    }
}
