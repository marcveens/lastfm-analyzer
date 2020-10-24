import { Component, h } from '@stencil/core';

@Component({
    tag: 'app-artists'
})
export class Artists {
    render() {
        return (
            <div class="app-home">
                <div class="container">
                    <div class="row">
                        <div class="col">
                            <artists-first-appearance />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
