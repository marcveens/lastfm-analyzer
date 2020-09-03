type LastFmPageAttributes = {
    page: string;
    total: string;
    user: string;
    pagePage: string;
    totlaPages: string;
};

type LastFmTrack = {
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

type LastFmPage = {
    '@attr': LastFmPageAttributes;
    track: LastFmTrack[];
};

export type LastFmImport = LastFmPage[];