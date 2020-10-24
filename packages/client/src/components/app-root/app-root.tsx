import { Component, h } from '@stencil/core';

@Component({
    tag: 'app-root',
    styleUrl: 'app-root.css'
})
export class AppRoot {
    render() {
        return (
            <div>
                <header>
                    <h1>Stencil App Starter</h1>
                </header>
                <nav>
                    <ul>
                        <li>
                            <stencil-route-link url="/" exact={true} activeClass="active">Home</stencil-route-link>
                        </li>
                        <li>
                            <stencil-route-link url="/artists" exact={true} activeClass="active">Artists</stencil-route-link>
                        </li>
                    </ul>
                </nav>

                <main>
                    <stencil-router>
                        <stencil-route-switch scrollTopOffset={0}>
                            <stencil-route url="/" component="app-home" exact={true} />
                            <stencil-route url="/artists" component="app-artists" exact={true} />
                        </stencil-route-switch>
                    </stencil-router>
                </main>
            </div>
        );
    }
}
