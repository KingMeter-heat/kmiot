import {heat_discover_notify, heat_upload_notify,} from './heat/HeatDeviceNotify';
import {DEVICE_TYPE} from './DeviceType';
import {store} from "../bluetooth/redux/BTStore";
import {smartlock_discover_notify, smartlock_upload_notify} from "./smartlock/SmartLockDeviceNotify";

export const device_disconnect_notify_business = mac => {
};

export const device_discover_notify_business = async (
    peripheral,
    customerId,
    deviceType,
    data,
) => {
    // if (deviceType === DEVICE_TYPE.HEAT) {
    //     peripheral.device_type = DEVICE_TYPE.HEAT;
    //     heat_discover_notify(peripheral, customerId, deviceType, data);
    // }else
    console.log("device_type - 0 ->{}", deviceType);
    if (deviceType === DEVICE_TYPE.SmartLockGen1) {
        peripheral.device_type = DEVICE_TYPE.SmartLockGen1;
        smartlock_discover_notify(peripheral, customerId, deviceType, data);
    } else if (deviceType === DEVICE_TYPE.SmartLockGen2) {
        peripheral.device_type = DEVICE_TYPE.SmartLockGen2;
        smartlock_discover_notify(peripheral, customerId, deviceType, data);
    }
};

export const device_upload_notify_business = (mac, data) => {
    let newMap = store.getState().peripheralMap;
    if (newMap.has(mac)) {
        let peripheral = newMap.get(mac);
        let device_type = peripheral.device_type;

        // if (peripheral.device_type === DEVICE_TYPE.HEAT) {
        //     heat_upload_notify(mac, data);
        // }else
        if (peripheral.device_type === DEVICE_TYPE.SmartLockGen1) {
            smartlock_upload_notify(mac, data);
        } else if (peripheral.device_type === DEVICE_TYPE.SmartLockGen2) {
            console.log("device_type - 1 ->{}", device_type);
            console.log(data);
            if (data[0] === 0xc9 && data[1] === 0xff) {
                console.log("command error");
            } else {
                smartlock_upload_notify(mac, data);
            }
        }
    }
};
