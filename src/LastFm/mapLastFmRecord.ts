import { LastFmTrack, LastFmTrackRaw } from '../types/LastFmImport';

export const mapLastFmRecord = (raw: LastFmTrackRaw): LastFmTrack => {
    return {
        track: {
            name: raw.name,
            mbid: raw.mbid
        },
        artist: {
            name: raw.artist['#text'],
            mbid: raw.artist.mbid
        }
    };
};