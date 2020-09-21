import { mapGenresToChartData, MappedGenresPerDate } from '../mapGenresToChartData';
const jsonGenresData = require('./data/genresPerMonth.json');

describe('mapGenresToChartData', () => {
    it('should map Elastic genres data to chart data', () => {
        // arrange
        const uniqueGenres = ['rock', 'hard rock', 'heavy metal', 'metal', 'alternative rock', 'pop'];
        const expectedChartData: MappedGenresPerDate = {
            labels: ['2009-11', '2010-01'],
            series: [
                {
                    name: 'rock',
                    data: [1, 1]
                },
                {
                    name: 'hard rock',
                    data: [2, 5]
                },
                {
                    name: 'heavy metal',
                    data: [3, 2]
                },
                {
                    name: 'metal',
                    data: [4, null]
                },
                {
                    name: 'alternative rock',
                    data: [5, 3]
                },
                {
                    name: 'pop',
                    data: [null, 4]
                },
            ]
        };

        // act

        // assert
        expect(mapGenresToChartData(jsonGenresData, uniqueGenres)).toStrictEqual(expectedChartData);
    });
});
