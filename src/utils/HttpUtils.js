import {api_url_prefix, firmwareVersionUrl} from "../business/Core";
import {notify} from "../components/notify/notify";
import {Http401, NoNeedUpgrade} from "../business/Language";
import {log_error, log_info} from "./LogUtils";
import RNFS from "react-native-fs";


export function get(url, params, absoluteUrl = false) {
    return request(url, 'GET', null, params, null, absoluteUrl);
}

export function post(url, data, absoluteUrl = false) {
    return request(url, 'POST', null, null, data, absoluteUrl);
}

export function put(url, data, absoluteUrl = false) {
    return request(url, 'PUT', null, null, data, absoluteUrl);
}

export function deleteR(url, data, absoluteUrl = false) {
    return request(url, 'DELETE', null, null, data, absoluteUrl);
}

function request(url, method, headers, params, body, absoluteUrl = false) {
    if (!(url && method)) {
        // updateLoading();
        throw Error('bad request');
    }

    if (!absoluteUrl) {
        url = `${api_url_prefix}${url}`;
    }

    const options = {
        method,
        mode: 'cors',
        ...(body && {body: JSON.stringify(body)}),
        headers: {
            Accept: 'application/json',
            ...(method !== 'GET' && {'Content-Type': 'application/json'}),
            ...(headers || {}),
        },
    };

    if (params && params.length > 0) {
        url += createQueryParameters(params);
    }

    return timeoutFetch(fetch(url, options))
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
            log_error("http error " + exception);
        })
        .finally(() => {
            // updateLoading();
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

/**
 * deal with timeout of network request
 * @param originalFetch original fetch
 * @param timeout  unit millisecond
 * @returns {Promise.<*>}
 */
const timeoutFetch = (originalFetch, timeout = 30000) => {
    let timeoutBlock = () => {
    };

    const timeoutPromise = new Promise((resolve, reject) => {
        timeoutBlock = () => {
            reject('HTTP-TIMEOUT');
        };
    });
    const abortablePromise = Promise.race([originalFetch, timeoutPromise]);
    setTimeout(timeoutBlock, timeout);
    return abortablePromise;
};

function validateVersion(currentVersion, callback) {
    log_info("currentVersion", currentVersion)
    get(firmwareVersionUrl, null, true).then(data => {
        let version = data.version;
        let filename = data.filename;
        let fileUrl = data.url;
        log_info(
            'upgrading : currentVersion is ' +
            currentVersion +
            ',latestVersion is ' +
            version +
            ',filename is ' +
            filename +
            ',url is ' +
            fileUrl,
        );
        if (version == currentVersion) {
            notify(NoNeedUpgrade);
        } else {
            callback(filename, fileUrl);
        }
    })
}

const fileExist = (filepath, callback) => {
    RNFS.exists(filepath)
        .then(exist => {
            callback(exist);
        })
        .catch(err => {
            callback(false);
            console.log(err.message);
        });
};

const downLoadFile = (downloadDest, fileUrl, succeed) => {
    const options = {
        fromUrl: fileUrl,
        toFile: downloadDest,
        background: true,
        begin: res => {
            // console.log('begin', res);
            // console.log('contentLength:', res.contentLength / 1024 / 1024, 'M');
        },
        progress: res => {
            let pro = res.bytesWritten / res.contentLength;
        },
    };
    try {
        const ret = RNFS.downloadFile(options);
        ret.promise
            .then(res => {
                if (res.statusCode === 200) {
                    succeed(downloadDest);
                }
            })
            .catch(err => {
                console.log('err', err);
            });
    } catch (e) {
        console.log(error);
    }
}

export const downUpgradeFile = (currentVersion, succeed) => {
    validateVersion(currentVersion, (filename, fileUrl) => {
        const downloadDest =
            RNFS.DocumentDirectoryPath + `/` + filename;
        fileExist(downloadDest, exist => {
            if (exist) {
                succeed(downloadDest);
            } else {
                downLoadFile(downloadDest, fileUrl, succeed);
            }
        })
    })
}

