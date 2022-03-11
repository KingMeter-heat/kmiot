import {
    addListener,
    checkBlueToothPermissionAndCallBack,
    connectDevice,
    disconnectDevice,
    isThisDeviceNearby,
    openBlueTooth,
    removeListener,
    scanPeripheral,
    sendMessageToHardware,
    stopScanAll,
} from '../bluetooth/BTUtils';
import {asciiStr2intArray, Str2BytesPer2} from '../bluetooth/BTDataUtils';
import {getEncryptData} from '../bluetooth/EncryptUtil';
import {log_info} from '../utils/LogUtils';
import {notify} from "../components/notify/notify";
import {YouNeedToTurnOnBluetooth} from "../business/Language";
import {store} from "../bluetooth/redux/BTStore";
import {setListeningFlag, setNearbyDeviceMap, setScanningFlag} from "../bluetooth/redux/BTActions";

// export const getDeviceNearby = () => {
//     let result = [];
//     nearbyDeviceMap.forEach((info, id) => {
//         result.push({
//             id: id, //mac
//             title: info.title,
//             bond: info.bond,
//         });
//     });
//     return result;
// }


export const forceRefreshNearbyDeviceMap = () => {
    let tmpMap = store.getState().nearbyDeviceMap;
    tmpMap.forEach((value, mac, map) => {
        isThisDeviceNearby(mac, () => {
            // log_info("this device is nearby # "+value.title);
        }, () => {
            log_info("this device not nearby @ " + mac + "@" + value.title);
            let newMap = store.getState().nearbyDeviceMap;
            newMap.delete(mac);
            store.dispatch(setNearbyDeviceMap(newMap));
            // nearbyDeviceMap.delete(mac);
        });
    })
}

export const scanAllDevice = (callback = () => {
}) => {
    // log_info("scanningFlag is "+scanningMap.get("flag"))
    // if (!scanningMap.get("flag")) {
    //     // log_info("scanAllDevice now ")
    //     scanningMap.set("flag",true);
    //     // log_info(scanningMap.get("flag"))
    //     scanPeripheral(callback);
    // }
    checkBlueToothPermission(
        () => {
            checkBlueToothStateAndOpen(
                () => {
                    // nearbyDeviceMap.clear();
                    _addListenerBeforeScan();
                    if (!store.getState().scanningFlag) {
                        store.dispatch(setScanningFlag(true));
                        scanPeripheral(callback);
                    }
                },
                () => {
                    notify(YouNeedToTurnOnBluetooth);
                },
            );
        },
        () => {
            notify(YouNeedToTurnOnBluetooth);
        },
    );
};

export const scanAllDeviceForce = (callback = () => {
}) => {
    log_info("scanAllDeviceForce2 now ")
    // scanningMap.set("flag",true);
    // // log_info(scanningMap.get("flag"))
    // scanPeripheral(callback);
    if (!store.getState().scanningFlag) {
        store.dispatch(setScanningFlag(true));
        scanPeripheral(callback);
    }
};

export const stopScan = (callback = () => {
}) => {
    if (store.getState().scanningFlag) {
        stopScanAll(callback);
    } else {
        callback();
    }
};

export const removeAllListener = () => {
    // scanningMap.set("flag",false);
    removeListener();
};

export const connect = (mac, name,device_type, success = () => {
}, error = (error_message) => {
},) => {
    // if (!listenerExistFlagMap.get("flag")) {
    //     listenerExistFlagMap.set("flag",true);
    // }
    connectDevice(mac, name,device_type, success, error);
};
export const disConnect = mac => {
    disconnectDevice(mac);
};


export const isThisShoeNearby = (mac, existCallback, notExistCallback) => {
    isThisDeviceNearby(mac, existCallback, notExistCallback);
}

export const checkBlueToothPermission = (permit, forbid) => {
    checkBlueToothPermissionAndCallBack(permit, forbid);
};

export const checkBlueToothStateAndOpen = (permit, forbid) => {
    openBlueTooth(permit, forbid);
};

const _addListenerBeforeScan = () => {
    if (!store.getState().listeningFlag) {
        log_info("addListenerBeforeScan now")
        addListener();
        store.dispatch(setListeningFlag(true));
        // listenerExistFlagMap.set("flag",true);
        // setListenerFlag(true);
    }
};

export const isConnected = mac => {
    let newMap = store.getState().peripheralMap;
    if (newMap.has(mac)) {
        if (newMap.get(mac).isConnected) {
            return true;
        }
    }
    return false;
};

function validateBeforeAction(mac) {
    let newMap = store.getState().peripheralMap;
    if (newMap.has(mac)) {
        if (newMap.get(mac).isConnected) {
            return newMap.get(mac);
        }
    }
    return null;
}

export const queryLockInfo = async mac => {
    let peripheral = validateBeforeAction(mac);
    if (!peripheral) {
        log_info('********read device info failed ----------02--');
        return false;
    }
    // log_info("queryLockInfo-->" + JSON.stringify(peripheral));
    let res = store.getState().resMap.get(mac);
    await sendMessageToHardware(
        mac,
        res.writeWithResponseServiceUUID[0],
        res.writeWithResponseCharacteristicUUID[0],
        Str2BytesPer2('C9A5E7386901'),
        false,
    ).then(r => () => {
    });
    return true;
};
export const heatOnOffSet = (mac, state, callback = () => {
}) => {
    return _sendCommandToLock(mac, 0x03, [state === 0 ? 0x00 : 0x01], callback, true);
};

export const setHeatGear = (mac, gear, callback = () => {
}) => {
    return _sendCommandToLock(mac, 0x04, [gear.toString(16)], callback, true);
};

export const shutDown = (mac, callback = () => {
}, name) => {
    // if (nearbyDeviceMap.has(mac)) {
    //     nearbyDeviceMap.delete(mac);
    // }
    if (store.getState().nearbyDeviceMap.has(mac)) {
        let newMap = store.getState().nearbyDeviceMap;
        newMap.delete(mac);
        store.dispatch(setNearbyDeviceMap(newMap));
    }

    return _sendCommandToLock(mac, 0x02, [], callback, true, name);
};
export const restart = (mac, callback) => {
    return _sendCommandToLock(mac, 0xfe, [0xe6, 0x05, 0x0a, 0x09], callback, true);
};
export const rename = (mac, name, callback) => {
    return _sendCommandToLock(mac, 0x44, asciiStr2intArray(name), callback, true);
};
export const modifyCustomerId = (mac, customerId, callback) => {

    return _sendCommandToLock(mac, 0x45, Str2BytesPer2(customerId), callback, true);
};

export const openUpgrade = (mac, callback) => {
    _sendCommandToLock(
        mac,
        0xfd,
        [0x6e, 0x50, 0x0a, 0x90],
        callback,
        false,
    );
};

const _sendCommandToLock = async (
    mac,
    cmd,
    dataArray,
    callback = () => {
    },
    waitFlag = false,
    name = ""
) => {
    let peripheral = validateBeforeAction(mac);
    if (!peripheral) {
        log_info('******** send cmd failed ---------' + name + ",cmd is " + cmd);
        return false;
    }
    let countMap = store.getState().countMap;
    let counter = countMap.has(mac) ? countMap.get(mac) : 0;
    let res = store.getState().resMap.get(mac);
    let customerId = res.customerId;
    let bytes = getEncryptData(customerId, counter, mac, cmd, dataArray);

    log_info('send command to lock,data is ', customerId + "@" + cmd + "@" + counter + "@" + dataArray + "@" + bytes);

    if (bytes == null) {
        return false;
    }

    await sendMessageToHardware(
        mac,
        waitFlag
            ? res.writeWithResponseServiceUUID[0]
            : res.writeWithoutResponseServiceUUID[0],
        waitFlag
            ? res.writeWithResponseCharacteristicUUID[0]
            : res.writeWithoutResponseCharacteristicUUID[0],
        bytes,
        waitFlag,
        callback,
    ).then(r => () => {
    });

    return true;
};

export const validateEncrypt = mac => {
    // log('******** encrypt validate ----------01');
    // let peripheral = validateBeforeAction(mac);
    // if (!peripheral) {
    //     log('********encrypt validate failed ----------02-');
    //     return false;
    // }
    // let counter = counterMap.get(mac);
    // let res = resMap.get(mac);
    // let customerId = res.customerId;
    // let data = getEncrypt(customerId, counter, mac, 0x06);
    // if (data === null) {
    //     log(
    //         '********encrypt validate failed ----------03--',
    //         mac,
    //         counter,
    //     );
    //     return false;
    // }
    // let dataStr = Bytes2Str(data) + '3030303030303030';
    //
    // sendMessageToHardware(
    //     mac,
    //     res.nofityServiceUUID[0],
    //     res.writeWithResponseCharacteristicUUID[0],
    //     Str2Bytes(dataStr),
    // );
    return _sendCommandToLock(mac, 0x06, [], false);
};
