import {
    addListener,
    checkBlueToothPermissionAndCallBack,
    connectDevice, disconnectDevice,
    isThisDeviceNearby, openBlueTooth,
    removeListener,
    scanPeripheral, sendMessageToHardware,
    startBleManager,
    stopScanAll
} from "../bluetooth/BTUtils";
import {store} from "../bluetooth/redux/BTStore";
import {log_info} from "../utils/LogUtils";
import {setListeningFlag, setNearbyDeviceMap, setScanningFlag} from "../bluetooth/redux/BTActions";
import {notify} from "../components/notify/notify";
import {YouNeedToTurnOnBluetooth} from "../business/Language";
import {getEncryptData} from "../bluetooth/EncryptUtil";

export const startBle = () => {
    startBleManager();
}

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
    checkBlueToothPermission(
        () => {
            checkBlueToothStateAndOpen(
                () => {
                    // nearbyDeviceMap.clear();
                    if (!store.getState().scanningFlag) {
                        _addListenerBeforeScan();
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

export const connect = (mac, name, device_type, success = () => {
}, error = (error_message) => {
},) => {
    connectDevice(mac, name, device_type, success, error);
};
export const disConnect = mac => {
    disconnectDevice(mac);
};


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

export function validateBeforeAction(mac) {
    let newMap = store.getState().peripheralMap;
    if (newMap.has(mac)) {
        if (newMap.get(mac).isConnected) {
            return newMap.get(mac);
        }
    }
    return null;
}

export const _sendCommandToLock = async (
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
        log_info('******** send cmd failed ------- mac : ' + mac + ',name : ' + name + ", cmd : " + cmd);
        return false;
    }
    let countMap = store.getState().countMap;
    let counter = countMap.has(mac) ? countMap.get(mac) : 0;
    let res = store.getState().resMap.get(mac);
    let customerId = res.customerId;
    let bytes = getEncryptData(customerId, counter, mac, cmd, dataArray);

    log_info('send command to lock,customerId:', customerId + ", cmd:" + cmd + ", counter:" + counter + ", bytes:" + bytes);

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
