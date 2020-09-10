export const trackColumns: (keyof TrackColumns)[] = ['id', 'gid', 'recording', 'medium', 'position', 'number', 'name', 'artist_credit', 'length', 'edits_pending', 'last_updated', 'is_data_track'];
export const recordingColumns: (keyof RecordingColumns)[] = ['id', 'gid', 'name', 'artist_credit', 'length', 'comment', 'edits_pending', 'last_updated', 'video'];
export const recordingTagColumns: (keyof RecordingTagColumns)[] = ['recording', 'tag', 'count'];
export const mediumColumns: (keyof MediumColumns)[] = ['id', 'release', 'position', 'format', 'name', 'edits_pending', 'last_updated', 'track_count'];
export const releaseColumns: (keyof ReleaseColumns)[] = ['id', 'gid', 'name', 'artist_credit', 'release_group', 'status', 'packaging', 'language', 'script', 'barcode', 'comment', 'edits_pending', 'quality'];
export const releaseTagColumns: (keyof ReleaseTagColumns)[] = ['release', 'tag', 'count'];
export const artistColumns: (keyof ArtistColumns)[] = ['id', 'gid', 'name', 'sort_name', 'begin_date_year', 'begin_date_month', 'begin_date_day', 'end_date_year', 'end_date_month', 'end_date_day', 'type', 'area', 'gender', 'comment', 'edits_pending', 'last_updated', 'ended', 'begin_area', 'end_area'];
export const artistTagColumns: (keyof ArtistTagColumns)[] = ['artist', 'tag', 'count', 'last_updated'];
export const tagColumns: (keyof TagColumns)[] = ['id', 'name', 'ref_count'];
export const genreColumns: (keyof GenreColumns)[] = ['id', 'gid', 'genre', 'number', 'last_updated'];

export type TrackColumns = {
    id: string;
    gid: string;
    recording: string;
    medium: string;
    position: string;
    number: string;
    name: string;
    artist_credit: string;
    length: string;
    edits_pending: string;
    last_updated: string;
    is_data_track: string;
};

export type RecordingColumns = {
    id: string;
    gid: string;
    name: string;
    artist_credit: string;
    length: string;
    comment: string;
    edits_pending: string;
    last_updated: string;
    video: string;
};

export type RecordingTagColumns = {
    recording: string;
    tag: string;
    count: string;
    last_updated: string;
};

export type MediumColumns = {
    id: string;
    release: string;
    position: string;
    format: string;
    name: string;
    edits_pending: string;
    last_updated: string;
    track_count: string;
};

export type ReleaseColumns = {
    id: string;
    gid: string;
    name: string;
    artist_credit: string;
    release_group: string;
    status: string;
    packaging: string;
    language: string;
    script: string;
    barcode: string;
    comment: string;
    edits_pending: string;
    quality: string;
    last_updated: string;
};

export type ReleaseTagColumns = {
    release: string;
    tag: string;
    count: string;
    last_updated: string;
};

export type ArtistColumns = {
    id: string;
    gid: string;
    name: string;
    sort_name: string;
    begin_date_year: string;
    begin_date_month: string;
    begin_date_day: string;
    end_date_year: string;
    end_date_month: string;
    end_date_day: string;
    type: string;
    area: string;
    gender: string;
    comment: string;
    edits_pending: string;
    last_updated: string;
    ended: string;
    begin_area: string;
    end_area: string;
};

export type ArtistTagColumns = {
    artist: string;
    tag: string;
    count: string;
    last_updated: string;
};

export type TagColumns = {
    id: string;
    name: string;
    ref_count: string;
};

export type GenreColumns = {
    id: string;
    gid: string;
    genre: string;
    number: string;
    last_updated: number;
};