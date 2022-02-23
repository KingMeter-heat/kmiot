import BleManager from 'react-native-ble-manager';
import {log_error, log_info} from './BTLogUtils';
import {Bytes2Str, fullUUID} from './BTDataUtils';
import {NativeEventEmitter, NativeModules, PermissionsAndroid, Platform,} from 'react-native';

import {device_disconnect_notify, device_discover_notify, device_upload_notify,} from './BTNotify';
import {setListeningFlag, setPeripheralMap2, setResMap2, setScanningFlag} from "./redux/BTActions";
import {store} from "./redux/BTStore";
import {ConnectFailed} from "../business/Language";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

function listener_discover_device(peripheral) {
    device_discover_notify(peripheral);
}

function listener_connected(data) {
    let id = data.peripheral;
    let newMap = store.getState().peripheralMap;

    log_info("device is connected")

    if(newMap.has(id)){
        let peripheral = newMap.get(id);
        peripheral.isConnected = true;
        newMap.set(id,peripheral);
        store.dispatch(setPeripheralMap2(newMap));
    }

    // peripheralMap.forEach((peripheral, id) => {
    //     if (onlineId === id) {
    //         peripheral.isConnected = true;
    //         log_info('######## device connected ########', id+ peripheral.name);
    //     } else {
    //         peripheral.isConnected = false;
    //     }
    //     updatePeripheralMap(peripheral);
    // });
}

function listener_disconnected(data) {
    let id = data.peripheral;
    let newMap = store.getState().peripheralMap;
    if(newMap.has(id)){
        let peripheral = newMap.get(id);
        log_info("device is offline "+peripheral.name);
        peripheral.isConnected = false;
        newMap.set(id,peripheral);
        BleManager.removeBond(id).then(()=>{
            log_info("remove bond succeed")
        }).catch(e=>{
            log_error("remove bond failed "+JSON.stringify(e));
        }).finally(()=>{
            log_info("remove bond finally")
        });
        store.dispatch(setPeripheralMap2(newMap));
    }
    device_disconnect_notify(id);

    // peripheralMap.forEach((peripheral, id) => {
    //     if (offlineId === id) {
    //         log_info('######## device offline ########', id, peripheral.name);
    //         peripheral.isConnected = false;
    //         BleManager.removeBond(id).then(()=>{
    //             log_info("remove bond succeed")
    //         }).catch(e=>{
    //             log_error("remove bond failed "+JSON.stringify(e));
    //         }).finally(()=>{
    //             log_info("remove bond finally")
    //         });
    //         updatePeripheralMap(peripheral);
    //         return;
    //     }
    // });
    // device_disconnect_notify(offlineId);
}

function listener_info_upload(data, peripheralID, characteristic, service) {
    // log_info("listener_info_upload_1_",peripheralMap.toString())
    // log_info("listener_info_upload_2_",data.peripheral)
    let id = data.peripheral;
    if(!store.getState().peripheralMap.has(id)){
        return null;
    }
    // if (!peripheralMap.has(data.peripheral)) {
    //     return null;
    // }
    device_upload_notify(id, data.value);
}

function listener_scan_stopped() {
    log_info('******** detect scan stopped ********');
    // scanningMap.set("flag",false);
    store.dispatch(setScanningFlag(false));
}

export const addListener = () => {
    BleManager.start({showAlert: false})
        .then(() => {
            BleManager.checkState();
            log_info('******** start ble manager succeed ********');
        })
        .catch(error => {
            log_info('******** start ble manager failed ********');
        });
    bleManagerEmitter.addListener(
        'BleManagerDiscoverPeripheral',
        listener_discover_device,
    );
    bleManagerEmitter.addListener(
        'BleManagerDidUpdateValueForCharacteristic',
        listener_info_upload,
    );
    bleManagerEmitter.addListener(
        'BleManagerConnectPeripheral',
        listener_connected,
    );
    bleManagerEmitter.addListener(
        'BleManagerDisconnectPeripheral',
        listener_disconnected,
    );
    bleManagerEmitter.addListener('BleManagerStopScan', listener_scan_stopped);
};

export const removeListener = () => {
    log_info('******** remove listener ********');
    // setListenerFlag(false);
    // listenerExistFlagMap.set("flag",false);

    store.dispatch(setListeningFlag(false));

    bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
    bleManagerEmitter.removeAllListeners(
        'BleManagerDidUpdateValueForCharacteristic',
    );
    bleManagerEmitter.removeAllListeners('BleManagerConnectPeripheral');
    bleManagerEmitter.removeAllListeners('BleManagerDisconnectPeripheral');
    bleManagerEmitter.removeAllListeners('BleManagerStopScan');
};

export const checkBlueToothPermissionAndCallBack = (permit, forbid) => {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
        PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ).then(res => {
            if (res) {
                permit();
            } else {
                PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                ).then(result => {
                    if (result) {
                        log_info('User accept');
                        permit();
                    } else {
                        log_error('User refuse');
                        forbid();
                    }
                });
            }
        });
    }
};

export const openBlueTooth = (permit, forbid) => {
    BleManager.enableBluetooth()
        .then(() => {
            // log_info('turn on bluetooth succeed');
            permit();
        })
        .catch(error => {
            log_error('The user refuse to enable bluetooth'+JSON.stringify(error));
            forbid();
        });
};

export const scanPeripheral = (callback = () => {}, nameArray = []) => {
    // log_info('******** start to scan device ********');
    BleManager.scan(nameArray, 30, false)
        .then(results => {
            // log_info('******** scanning ********');
            callback();
        })
        .catch(err => {
            log_error('scanPeripheral' + err);
        });
};

export const stopScanAll = (callback = () => {}) => {
    // scanningMap.set("flag",false);
    // peripheralMap.forEach((value, id) => {
    //     if (peripheralMap.get(id).isConnected) {
    //         peripheralMap.get(id).disconnect;
    //     }
    //     // dealWithOffline(peripheralMap.get(id));
    // });
    BleManager.stopScan().then(result => {
        log_info('******** scan stopped ********');
        callback();
    });
};

export const disconnectDevice = mac => {
    let newMap = store.getState().peripheralMap;
    if (!newMap.has(mac)) {
        log_info('******** disconnect failed ----------02--');
        return;
    }
    let peripheral = newMap.get(mac);
    log_info('******** disconnect device ********', mac, peripheral.name);
    // let res = resMap.get(mac);
    let res = store.getState().resMap.get(mac);

    if (res != null) {
        log_info(
            'stopNotification-->' +
            res.nofityServiceUUID[0] +
            res.nofityCharacteristicUUID[0],
        );

        BleManager.stopNotification(
            mac,
            res.nofityServiceUUID[0],
            res.nofityCharacteristicUUID[0],
        ).then(() => {
            log_info("stop notification succeed")
        }).catch(e=>{
            log_info("stop notification failed"+JSON.stringify(e))
        }).finally(()=>{
            log_info("remove bond now")
            BleManager.removeBond(mac).then(()=>{
                log_info("remove bond succeed")
            }).catch(e=>{
                log_error("remove bond failed "+JSON.stringify(e));
            }).finally(()=>{
                log_info("remove bond finally")
            });
            log_info("disconnect device now")
            BleManager.disconnect(mac, true).then(r =>{
            });
        });
    } else {
        BleManager.disconnect(mac, true).then(r =>{
        });
    }
};

export const isThisDeviceNearby = (mac, existCallback, notExistCallback) => {
    BleManager.getDiscoveredPeripherals().then(list => {
        let exist = false;
        list.forEach((p, number, list) => {
            if (p.id === mac) {
                exist = true;
            }
        });
        if (exist) {
            existCallback();
        } else {
            notExistCallback();
        }
    });
};

export const connectDevice = (
    mac, name,device_type,
    success = () => {},
    error = error_message => {},
) => {
    let needReScan = false;
    //1,获取列表 isConnected
    BleManager.getDiscoveredPeripherals().then(list => {
        //2,如果列表没有则重新扫描
        if (list.length == 0) {
            needReScan = true;
        } else {
            let exist = false;
            list.forEach((p, number, list) => {
                if (p.id === mac) {
                    exist = true;
                    if (p.rssi == 0) {
                        needReScan = true;
                    }
                }
            });
            if (!exist) {
                needReScan = true;
            }
        }
        log_info('needReScan2', needReScan);
        if (needReScan) {
            BleManager.scan([], 10, false)
                .then(results => {
                    log_info('******** scanning ********');
                    setTimeout(() => {
                        _connect(mac, name,device_type,success, error, 0);
                    }, 1000);
                })
                .catch(err => {
                    log_error(err);
                });
        } else {
            //3,扫描发现有这个内容的时候，尝试连接，没有则报错返回
            _connect(mac, name,device_type, success, error, 0);
        }
    });
};

export const _connect = (
    mac, name,device_type,
    success = () => {},
    error = error_message => {},
    connectingTimes,
) => {
    log_info(
        '~~~~~~~~~~~~~~~~~~~~~~~~~~connecting---~~~~~~~~~~~~~~~~~~~~~~~~',
        connectingTimes,
    );
    if (connectingTimes === 10) {
        error(ConnectFailed);
        return;
    }
    BleManager.connect(mac)
        .then(() => {
            log_info("try to retrieveServices now")
            retrieveServices(mac,  name,device_type,success, error, connectingTimes);
        })
        .catch(error_message => {
            // Failure code
            log_error('error_message', error_message);
            error(error_message);
        });
};

const retrieveServices = (mac,name,device_type, success, error, connectingTimes) => {
    BleManager.retrieveServices(mac).then(peripheralData => {
        let res = getUUID(peripheralData);
        log_info(
            'startNotification-->' +
                res.nofityServiceUUID[0] +
                res.nofityCharacteristicUUID[0],
        );

        if (
            res.nofityServiceUUID == null ||
            res.nofityServiceUUID.length == 0
        ) {
            setTimeout(() => {
                disconnectDevice(mac);
                _connect(mac,  name,device_type,success, error, connectingTimes + 1);
            }, 1000);
            return;
        }

        BleManager.startNotification(
            mac,
            res.nofityServiceUUID[0],
            res.nofityCharacteristicUUID[0],
        )
            .then(() => {
                log_info('startNotification-1 true ');
                let resMap = store.getState().resMap;
                resMap.set(mac, res);
                store.dispatch(setResMap2(resMap))

                let newMap = store.getState().peripheralMap;
                let p = {id:mac,name:name,isConnected:true,device_type:device_type};
                newMap.set(mac, p);
                store.dispatch(setPeripheralMap2(newMap));

                success();
            })
            .catch(e => {
                log_info('startNotification-1 false ' + e);
                setTimeout(() => {
                    disconnectDevice(mac);
                    _connect(mac,  name,device_type,success, error, connectingTimes + 1);
                }, 1000);
                return;
            });
    });
};

export const sendMessageToHardware = async (
    mac,
    serviceId,
    characteristicId,
    data,
    waitFlag = true,
    callback = () => {},
) => {
    //todo set waitFlag with false .
    waitFlag=false;
    if (waitFlag) {
        await BleManager.write(mac, serviceId, characteristicId, data).then(
            result => {
                if (callback != null) {
                    callback();
                }
            },
        ).catch(e=>{
            log_error("send message failed1: "+data+";e is "+JSON.stringify(e))
        });
    } else {
        await BleManager.writeWithoutResponse(
            mac,
            serviceId,
            characteristicId,
            data,
        ).then(()=>{
            if (callback != null) {
                callback();
            }
        }).catch(e=>{
            log_error("send message failed2: "+data+";e is "+JSON.stringify(e))
        });
    }
};

function getUUID(peripheralInfo) {
    let result = {};
    result.readServiceUUID = [];
    result.readCharacteristicUUID = [];
    result.writeWithResponseServiceUUID = [];
    result.writeWithResponseCharacteristicUUID = [];
    result.writeWithoutResponseServiceUUID = [];
    result.writeWithoutResponseCharacteristicUUID = [];
    result.nofityServiceUUID = [];
    result.nofityCharacteristicUUID = [];
    result.customerId = '2113';

    let bytes = peripheralInfo.advertising.manufacturerData.bytes;
    result.bytes = bytes;

    if (bytes.length > 6) {
        result.customerId = Bytes2Str([bytes[6], bytes[5]]);
    }
    // log_info("peripheralInfo is "+JSON.stringify(peripheralInfo));

    for (let item of peripheralInfo.characteristics) {
        item.characteristic = fullUUID(item.characteristic);
        if (Platform.OS === 'android') {
            // log_info("item.properties is "+JSON.stringify(item.properties))
            if (item.properties.Notify === 'Notify') {
                result.nofityServiceUUID.push(item.service);
                result.nofityCharacteristicUUID.push(item.characteristic);
            }
            if (item.properties.Read === 'Read') {
                result.readServiceUUID.push(item.service);
                result.readCharacteristicUUID.push(item.characteristic);
            }
            if (
                item.properties.Write === 'Write' &&
                item.properties.Read !== 'Read'
            ) {
                result.writeWithResponseServiceUUID.push(item.service);
                result.writeWithResponseCharacteristicUUID.push(
                    item.characteristic,
                );
            }
            if (
                item.properties.Write === 'Write' &&
                item.properties.WriteWithoutResponse === 'WriteWithoutResponse'
            ) {
                result.writeWithoutResponseServiceUUID.push(item.service);
                result.writeWithoutResponseCharacteristicUUID.push(
                    item.characteristic,
                );
            }
        } else {
            //ios
            for (let property of item.properties) {
                if (property === 'Notify') {
                    result.nofityServiceUUID.push(item.service);
                    result.nofityCharacteristicUUID.push(item.characteristic);
                }
                if (property === 'Read') {
                    result.readServiceUUID.push(item.service);
                    result.readCharacteristicUUID.push(item.characteristic);
                }
                if (property === 'Write') {
                    result.writeWithResponseServiceUUID.push(item.service);
                    result.writeWithResponseCharacteristicUUID.push(
                        item.characteristic,
                    );
                }
                if (property === 'WriteWithoutResponse') {
                    result.writeWithoutResponseServiceUUID.push(item.service);
                    result.writeWithoutResponseCharacteristicUUID.push(
                        item.characteristic,
                    );
                }
            }
        }
    }
    return result;
}
