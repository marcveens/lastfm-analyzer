import { Component, h } from '@stencil/core';
import { state } from '../Datepicker/date-store';

@Component({
    tag: 'app-home',
    styleUrl: 'app-home.css',
    shadow: true,
})
export class AppHome {
    render() {
        return (
            <div class="app-home">
                Start date
                <date-picker onDateChange={event => state.startDate = event.detail} />
                End date
                <date-picker onDateChange={event => state.endDate = event.detail} />
                <most-listened-artists />
            </div>
        );
    }
}
