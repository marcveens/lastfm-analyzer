import { LastFmTrack, LastFmTrackRaw } from '../types/LastFmImport';

export const mapLastFmRecord = (raw: LastFmTrackRaw): LastFmTrack => {
    return {
        name: raw.name
    };
};