import { Component, h, Prop } from '@stencil/core';

@Component({
    tag: 'date-picker'
})
export class Datepicker {
    @Prop() onDateChange: (date: string) => void;

    onChange = (event: Event) => {
        const elem = event.currentTarget as HTMLInputElement;
        this.onDateChange(elem.value);
    }

    render() {
        return (
            <div>
                <input type="date" onChange={this.onChange} />
            </div>
        );
    }
}
