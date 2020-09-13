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
        },
        album: {
            name: raw.album['#text'],
            mbid: raw.album.mbid
        },
        image: raw.image[raw.image.length - 1]['#text'],
        listened_utc: raw.date?.uts && !isNaN(Number(raw.date.uts)) ? parseInt(raw.date.uts) : undefined
    };
};