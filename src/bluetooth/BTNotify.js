import {Bytes2Str} from './BTDataUtils';
import {
    device_disconnect_notify_business,
    device_discover_notify_business,
    device_upload_notify_business,
} from '../device/DeviceNotify';
import {store} from "./redux/BTStore";
import {setNearbyDFU} from "./redux/BTActions";

export const device_discover_notify = peripheral => {
    if (peripheral.name == null) {
        return;
    }
    if (
        String(peripheral.name) === 'KM-DFU' ||
        (String(peripheral.name).startsWith('K', 0) &&
            String(peripheral.name).length === 8)
    ) {
        store.dispatch(setNearbyDFU(peripheral.name,peripheral));
        return;
    }
    let data = peripheral.advertising.manufacturerData.bytes;
    let customerId = Bytes2Str([data[6], data[5]]);
    let deviceType = Bytes2Str([data[7]]);
    device_discover_notify_business(peripheral, customerId, deviceType, data);
};

export const device_upload_notify = (mac, data) => {
    device_upload_notify_business(mac, data);
};

export const device_disconnect_notify = mac => {
    device_disconnect_notify_business(mac);
};
