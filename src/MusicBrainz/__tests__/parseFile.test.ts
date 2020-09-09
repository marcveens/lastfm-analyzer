import { parseFile } from '../parseFile';
import path from 'path';

describe('parseFile', () => {
    it('should return correct lines', async () => {
        // arrange
        const filepath = path.resolve(__dirname, './data/artist');
        const expectedResult = [['349986', '4fd53e84-ffa1-4434-9146-3fab25ece7e0', 'Suicide Silence', 'Suicide Silence', '2002', '', '', '', '', '', '2', '222', '', '', '0', '2019-06-05 16:33:32.675021+00', 'f', '7746', '']];

        // act
        const results = await parseFile(filepath, (record: string[]) => {
            return record[1] === '4fd53e84-ffa1-4434-9146-3fab25ece7e0';
        });

        // assert
        expect(results).toEqual(expectedResult);
    });
});