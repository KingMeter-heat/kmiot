import {isThisDeviceNearby, sendMessageToHardware,} from '../../bluetooth/BTUtils';
import {asciiStr2intArray, Str2BytesPer2} from '../../bluetooth/BTDataUtils';
import {getEncryptData} from '../../bluetooth/EncryptUtil';
import {log_info} from '../../utils/LogUtils';
import {notify} from "../../components/notify/notify";
import {NameOverLength} from "../../business/Language";
import {store} from "../../bluetooth/redux/BTStore";
import {setNearbyDeviceMap} from "../../bluetooth/redux/BTActions";

import {_sendCommandToLock, validateBeforeAction} from "../DeviceFunctions";
import {DeviceType} from "react-native-device-info";
import {DEVICE_TYPE} from "../DeviceType";

export const isThisShoeNearby = (mac, existCallback, notExistCallback) => {
    isThisDeviceNearby(mac, existCallback, notExistCallback);
}

export const queryHeatShoeInfo = async mac => {
    let peripheral = validateBeforeAction(mac);
    if (!peripheral) {
        log_info('********read device info failed ----------02--');
        return false;
    }
    let res = store.getState().resMap.get(mac);
    log_info("query info ")
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
export const rename = (mac, name, success, error) => {
    name = String(name).trim();
    let nameArray = asciiStr2intArray(name);
    let nameArrayLength = nameArray.length;
    if(nameArrayLength>13){
        notify(NameOverLength)
        return;
    }else if(nameArrayLength<13){
        for (let i=0;i<13-nameArrayLength;i++){
            nameArray.push(0x20);
        }
    }
    let newMap = store.getState().nearbyDeviceMap;
    newMap.set(mac, {
        id: mac,
        title: name,
        type: DEVICE_TYPE.HEAT
    });
    store.dispatch(setNearbyDeviceMap(newMap));

    return _sendCommandToLock(mac, 0x44, nameArray, success, true);
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
