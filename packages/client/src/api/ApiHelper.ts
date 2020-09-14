import StatusCode from 'status-code-enum';

export class ApiHelper {
    public static async getData<T>(url: string): Promise<T> {
        let getDataPromise: Promise<T> = new Promise((resolve, reject) => {
            const cleanUrl = url.replace(/([^:]\/)\/+/g, '$1');

            fetch(cleanUrl)
                .then(async (res) => {
                    if (!res.ok) {
                        throw (res);
                    }

                    const text = await res.text();
                    const json = JSON.parse(text);
                    return json;
                })
                .then(res => {
                    resolve(res as T);
                })
                .catch(error => {
                    console.error(`API call GET '${url}' fails with code: ${error.statusCode}. Exception: ${error.toString()}`);
                    reject(error);
                });
        });

        return getDataPromise;
    }

    public static async postData<NewT, ReturnT>(url: string, data: NewT): Promise<ReturnT> {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw response;
            }

            if (response.status === StatusCode.SuccessNoContent) {
                const emptyResponse = {};
                return emptyResponse as ReturnT;
            }

            if (response.body) {
                const body = response.json();
                return body as any;
            }
        } catch (e) {
            console.error(`API call '${url}' fails with code: ${e.statusCode}. Exception: ${e.toString()}`);

            throw e;
        }

        throw new Error(`API call POST '${url}' fails to return a result.`);
    }
}
