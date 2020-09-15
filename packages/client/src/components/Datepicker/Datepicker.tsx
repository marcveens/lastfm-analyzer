import { Component, Event, EventEmitter, h } from '@stencil/core';

@Component({
    tag: 'date-picker'
})
export class Datepicker {
    @Event() dateChange: EventEmitter<string>;

    onChange = (event: Event) => {
        const elem = event.currentTarget as HTMLInputElement;
        this.dateChange.emit(elem.value);
    }

    render() {
        return (
            <div>
                <input type="date" onChange={this.onChange} />
            </div>
        );
    }
}
