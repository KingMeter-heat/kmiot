import {api_url_prefix} from "../business/Core";
import {notify} from "../components/notify/notify";
import {Http401, HttpTimeOut} from "../business/Language";
import {log_error, log_info} from "./LogUtils";


/**
 * deal with timeout of network request
 * @param originalFetch original fetch
 * @param timeout  unit millisecond
 * @returns {Promise.<*>}
 */
const timeoutFetch = (originalFetch, timeout = 30000) => {
    let timeoutBlock = () => {};

    const timeoutPromise = new Promise((resolve, reject) => {
        timeoutBlock = () => {
            reject('HTTP-TIMEOUT');
        };
    });
    const abortablePromise = Promise.race([originalFetch, timeoutPromise]);
    setTimeout(timeoutBlock, timeout);
    return abortablePromise;
};

function request(requestDto) {
    const {
        body=null,
        errorMsg,
        method = 'GET',
        headers,
        updateLoading = () => {}
    } = requestDto;

    let { url, params } = requestDto;

    if (!(url && method)) {
        updateLoading();
        throw Error('bad request');
    }

    url = `${api_url_prefix}${url}`;

    const options = {
        method,
        mode: 'cors',
        ...(body && { body: JSON.stringify(body) }),
        headers: {
            Accept: 'application/json',
            ...(method !== 'GET' && { 'Content-Type': 'application/json' }),
            ...(headers || {}),
        },
    };

    const queryParameters = createQueryParameters(params);

    return timeoutFetch(fetch(`${url}?${queryParameters}`, options))
        .then((response) => {
            const status = response.status;
            switch (status) {
                case 401:
                    notify(Http401)
                    break;
                case 402:
                    break;
                case 200:
                    return response.json();
                default:
                    throw Error(response.statusText || status);
            }
            return response;
        })
        .then((results) => {
            return results;
        })
        .catch((exception) => {
            if (exception === 'HTTP-TIMEOUT') {
                throw Error(exception);
            }
            log_error("http error "+exception);
        })
        .finally(() => {
            updateLoading();
        });
}

function createQueryParameters(parametersObject) {
    return Object.entries(parametersObject)
        .reduce(
            (parameters, [key, value]) =>
                value != null
                    ? parameters.concat([`${encodeURIComponent(key)}=${encodeURIComponent(value)}`])
                    : parameters,
            []
        )
        .join('&');
}

export {
    request,
};
