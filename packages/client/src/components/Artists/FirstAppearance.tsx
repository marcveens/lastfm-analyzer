import { Component, h, State } from '@stencil/core';
import { ElasticClient } from '../../api/ElasticClient';
import { LastFmTrack } from '../../types/LastFmImport';
import { convertFromUnix } from '../../utils/DateUtils';

export type ArtistsFirstAppearancesAggs = {
    artists: {
        doc_count_error_upper_bound: number;
        sum_other_doc_count: number;
        buckets: {
            key: string;
            doc_count: number;
            first_appearance: {
                hits: {
                    hits: {
                        _source: LastFmTrack;
                    }[]
                }
            }
        }[];
    };
};

@Component({
    tag: 'artists-first-appearance'
})
export class ArtistsFirstAppearance {
    @State() artists = [];

    async componentWillLoad() {
        await this.getArtists();
    }

    async getArtists() {
        const artists = await ElasticClient.getArtistFirstAppearances('Devin Townsend');
        this.artists = artists.aggregations.artists.buckets;

        console.log(this.artists);
    }

    render() {
        return (
            <div class="app-home">
                <table>
                    {this.artists.map(artist => (
                        <tr>
                            <td>{artist.key}</td>
                            <td>{artist.first_appearance.hits.hits[0]._source.track.name}</td>
                            <td>{convertFromUnix(artist.first_appearance.hits.hits[0]._source.listened_utc)}</td>
                        </tr>
                    ))}
                </table>
            </div>
        );
    }
}
