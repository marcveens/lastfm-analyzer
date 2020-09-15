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
                <date-picker onDateChange={(date) => state.startDate = date} />
                <most-listened-artists />
            </div>
        );
    }
}
