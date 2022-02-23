import {heat_discover_notify, heat_upload_notify,} from '../heat/HeatDeviceNotify';
import {DEVICE_TYPE} from './DeviceType';
import {store} from "../bluetooth/redux/BTStore";

export const device_disconnect_notify_business = mac => {};

export const device_discover_notify_business = async (
    peripheral,
    customerId,
    deviceType,
    data,
) => {
    if (deviceType === DEVICE_TYPE.HEAT) {
        peripheral.device_type = DEVICE_TYPE.HEAT;
        heat_discover_notify(peripheral, customerId, deviceType, data);
    }
};

export const device_upload_notify_business = (mac, data) => {
    let newMap = store.getState().peripheralMap;
    if (newMap.has(mac)) {
        let peripheral = newMap.get(mac);
        if (peripheral.device_type === DEVICE_TYPE.HEAT) {
            heat_upload_notify(mac, data);
        }
    }
};
