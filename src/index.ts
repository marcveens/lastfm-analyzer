import { FileLoader } from './FileLoader/FileLoader';

require('dotenv').config();

const fileName = process.env.FILENAME;

if (!fileName) {
    throw new Error('No fileName provided as env variable');
}

const fileLoader = new FileLoader();
fileLoader.load(fileName);