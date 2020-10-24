import { Component, h, State } from '@stencil/core';
import { ElasticClient } from '../../api/ElasticClient';
import ApexCharts from 'apexcharts';
import { mapGenresToChartData, MappedGenresPerDate } from './mappers/mapGenresToChartData';

@Component({
    tag: 'most-listened-genres-all-time'
})
export class MostListenedGenresAllTime {
    @State() genres: MappedGenresPerDate = { series: [], labels: [] };

    async componentWillLoad() {
        await this.getGenres();
    }

    componentDidRender() {
        this.runChart();
    }

    async getGenres() {
        const rawGenres = await ElasticClient.getMostListenedGenresPerMonth();
        const rawUniqueGenres = await ElasticClient.getAllUniqueGenres();
        const genres = rawGenres.aggregations;
        const uniqueGenres = rawUniqueGenres.aggregations.unique_genres.buckets.map(x => x.key);
        this.genres = mapGenresToChartData(genres, uniqueGenres);
    }

    runChart() {
        const options = {
            series: this.genres.series,
            labels: this.genres.labels,
            chart: {
                type: 'line',
                zoom: {
                    enabled: true
                },
                toolbar: {
                    show: false
                }
            },
            xaxis: {

            }
        };
        const chart = new ApexCharts(document.getElementById('genre-trend'), options);
        // Works, but performance is horrible..
        // Might want to look if I only want to show shorter periods or leave out some genres..
        chart.render();
    }

    render() {
        return (
            <div>
                <h3>All time genre trend</h3>
                <div id="genre-trend" />
            </div>
        );
    }
}
