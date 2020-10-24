import { Component, h } from '@stencil/core';
import { ElasticClient } from '../../api/ElasticClient';
import { convertFromUnix } from '../../utils/DateUtils';
import { QueryString } from '../../utils/UrlUtils';
import { onChange, state } from '../Datepicker/date-store';

@Component({
    tag: 'app-home'
})
export class AppHome {
    firstDate: string;
    endDate: string;

    async componentWillLoad() {
        const dates = await ElasticClient.getFirstAndLastListenDates();
        this.firstDate = convertFromUnix(dates.aggregations.first.hits.hits[0]._source.listened_utc);
        this.endDate = convertFromUnix(dates.aggregations.last.hits.hits[0]._source.listened_utc);

        onChange('startDate', (date) => {
            QueryString.set({ startDate: date });
        });

        onChange('endDate', (date) => {
            QueryString.set({ endDate: date });
        });
    }

    render() {
        return (
            <div class="app-home">
                <div class="container">
                    <div class="row">
                        <div class="col">
                            Start date
                            <date-picker
                                onDateChange={event => state.startDate = event.detail}
                                value={state.startDate}
                                min={this.firstDate}
                                max={this.endDate}
                            />
                            End date
                            <date-picker
                                onDateChange={event => state.endDate = event.detail}
                                value={state.endDate}
                                min={this.firstDate}
                                max={this.endDate}
                            />
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <most-listened-artists />
                        </div>
                        <div class="col">
                            <most-listened-genres />
                        </div>
                    </div>
                    {/* <div class="row">
                        <div class="col">
                            <most-listened-genres-all-time />
                        </div>
                    </div> */}
                </div>
            </div>
        );
    }
}
