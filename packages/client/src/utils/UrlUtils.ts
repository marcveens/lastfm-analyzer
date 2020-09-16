import qs from 'qs';

type KeyValue = {
    [key: string]: string;
};

export class QueryString {
    static getQueryString = () => {
        return window.location.search;
    }

    static getParsed = <T>(queryString?: string): T => {
        const parsedQueryString = qs.parse(queryString || QueryString.getQueryString(), { ignoreQueryPrefix: true });

        return (parsedQueryString || {}) as unknown as T;
    }

    static set = (keyValue: KeyValue) => {
        let parsedQueryString = QueryString.getParsed<KeyValue>();

        parsedQueryString = { ...parsedQueryString, ...keyValue };

        return QueryString.apply(parsedQueryString);
    }

    static getValue = <T>(key: string, defaultValue?: T) => {
        const parsedQs = QueryString.getParsed<KeyValue>();

        return (parsedQs[key] ?? defaultValue) as unknown as T;
    }

    static apply = (state: KeyValue) => {
        const queryString = QueryString.stringify(state);
        const queryPrefix = queryString ? '?' : '';

        window.history.replaceState({}, '', `${window.location.pathname}${queryPrefix}${queryString}${window.location.hash}`);

        return state;
    }

    static deleteKey = (key: string) => {
        let parsedQueryString = QueryString.getParsed<KeyValue>();

        delete parsedQueryString[key];

        return QueryString.apply(parsedQueryString);
    }

    static stringify = (state: KeyValue) => {
        return qs.stringify(state, { encode: false });
    }
}
