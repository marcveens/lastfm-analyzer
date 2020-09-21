import { Bucket } from '../../../types/Elasticsearch';
import { convertFromUnix } from '../../../utils/DateUtils';

export type GenresAggregation = {
    group_by_month: {
        buckets: {
            key_as_string: string;
            key: number;
            doc_count: number;
            total_genres: {
                doc_count_error_upper_bound: number;
                sum_other_doc_count: number;
                buckets: Bucket[];
            }
        }[]
    }
};

type MappedGenresPerDateSeries = {
    name: string;
    data: (number | null)[];
}[]

export type MappedGenresPerDate = {
    series: MappedGenresPerDateSeries;
    labels: string[];
};

export const mapGenresToChartData = (aggregations: GenresAggregation, uniqueGenres: string[]): MappedGenresPerDate => {
    const labels = aggregations.group_by_month.buckets.reduce((dateList, bucket) => {
        if (bucket.total_genres.buckets.length > 0) {
            dateList.push(convertFromUnix(Number(bucket.key_as_string), 'YYYY-MM'));
        }

        return dateList;
    }, []);

    const emptySeries = uniqueGenres.map(genre => ({ name: genre, data: [] }));
    const series: MappedGenresPerDateSeries = emptySeries.map(genre => {
        aggregations.group_by_month.buckets.forEach(bucket => {
            if (bucket.total_genres.buckets.length > 0) {
                const index = bucket.total_genres.buckets.findIndex(x => x.key === genre.name);

                if (index > -1) {
                    genre.data.push(index + 1);
                } else {
                    genre.data.push(null);
                }
            }
        });

        return genre;
    });

    return {
        labels,
        series
    };
};
