import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

@Component({
    tag: 'date-picker'
})
export class Datepicker {
    @Prop() value?: string;
    @Prop() min?: string;
    @Prop() max?: string;
    @Event() dateChange: EventEmitter<string>;

    onChange = (event: Event) => {
        const elem = event.currentTarget as HTMLInputElement;
        this.dateChange.emit(elem.value);
    }

    render() {
        return (
            <div>
                <input type="date" onChange={this.onChange} value={this.value} min={this.min} max={this.max} />
            </div>
        );
    }
}
