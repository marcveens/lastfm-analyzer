import { ArtistColumns } from '../MusicBrainz/Columns';

type LastFmPageAttributes = {
    page: string;
    total: string;
    user: string;
    pagePage: string;
    totalPages: string;
};

export type LastFmTrackRaw = {
    artist: {
        mbid: string;
        '#text': string;
    };
    '@attr'?: {
        nowplaying: string;
    };
    mbid: string;
    album: {
        mbid: string;
        '#text': string;
    };
    streamable: string;
    url: string;
    name: string;
    image: {
        size: 'small' | 'medium' | 'large' | 'extralarge',
        '#text': string;
    }[];
    date?: {
        uts: string;
        '#text': string;
    };
};

export type LastFmTrack = {
    track: {
        name: string;
        mbid: string;
    },
    artist: {
        name: string;
        mbid: string;
        extras?: ArtistColumns;
    }
};

export type LastFmPage = {
    '@attr': LastFmPageAttributes;
    track: LastFmTrackRaw[];
};

export type LastFmImport = LastFmPage[];