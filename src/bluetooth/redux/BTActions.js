export const SETTING_SCANNING_FLAG = "setScanningFlag";

export const SETTING_LISTENING_FLAG = "setListeningFlag";

export const SETTING_NEARBY_DEVICE = "setNearbyDevice";

export const SETTING_NEARBY_DFU = "setNearbyDFU"

export const SETTING_PERIPHERAL_MAP = "setPeripheralMap";

export const SETTING_COUNT_MAP = "setCountMap";

export const SETTING_RES_MAP = "setResMap";

export const SETTING_DEVICE_INFO_MAP = "setDeviceInfoMap";

export const setScanningFlag = (flag) => {
    return (dispatch) => {
        (() => {
            dispatch({
                type: SETTING_SCANNING_FLAG,
                scanningFlag: flag,
            })
        })()
    }
}

export const setListeningFlag = (flag) => {
    return (dispatch) => {
        (() => {
            dispatch({
                type: SETTING_LISTENING_FLAG,
                listeningFlag: flag,
            })
        })()
    }
}

export const setNearbyDeviceMap = map => {
    let result = [];
    map.forEach((info, id) => {
        result.push({
            id: id, //mac
            title: info.title,
            type:info.type
        });
    });

    return (dispatch) => {
        (() => {
            dispatch({
                type: SETTING_NEARBY_DEVICE,
                nearbyDeviceMap: map,
                nearbyDeviceList: result,
            })
        })()
    }
}

export const setNearbyDFU = (name, peripheral) => {
    return (dispatch) => {
        (() => {
            dispatch({
                type: SETTING_NEARBY_DFU,
                nearbyDFU: {"name": name, "peripheral": peripheral},
            })
        })()
    }
}

export const setPeripheralMap2 = map => {
    return (dispatch) => {
        (() => {
            dispatch({
                type: SETTING_PERIPHERAL_MAP,
                peripheralMap: map,
            })
        })()
    }
}

export const setCountMap2 = map => {
    return (dispatch) => {
        (() => {
            dispatch({
                type: SETTING_COUNT_MAP,
                countMap: map,
            })
        })()
    }
}

export const setResMap2 = map => {
    return (dispatch) => {
        (() => {
            dispatch({
                type: SETTING_RES_MAP,
                resMap: map,
            })
        })()
    }
}

export const setDeviceInfoMap = map => {
    return (dispatch) => {
        (() => {
            dispatch({
                type: SETTING_DEVICE_INFO_MAP,
                deviceInfoMap: map,
            })
        })()
    }
}

