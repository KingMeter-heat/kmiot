import {Byte2Mac, Bytes2HexString, Bytes2Int, Bytes2Str} from "../../bluetooth/BTDataUtils";
import {store} from "../../bluetooth/redux/BTStore";
import {setCountMap2, setDeviceInfoMap, setNearbyDeviceMap, setResMap2} from "../../bluetooth/redux/BTActions";
import {log_info} from "../../bluetooth/BTLogUtils";
import SmartLockInfo from "./SmartLockCache";


const CODE_DEVICE_INFO = 'C981';
const CODE_ENCRYPT_VALIDATE = 'C986';

export const smartlock_discover_notify = async (
    peripheral, customerId, deviceType, data
) => {
    let id = peripheral.id;
    let name = String(peripheral.name).trim();

    let deviceInfoMap = store.getState().deviceInfoMap;
    let info = new SmartLockInfo();
    if (deviceInfoMap.has(id)) {
        info = deviceInfoMap.get(id);
        info.setCounterInitFlag(0);
    }
    info.setName(name);
    info.setCustomerId(customerId);
    deviceInfoMap.set(id, info);
    store.dispatch(setDeviceInfoMap(deviceInfoMap));

    let resMap = store.getState().resMap;
    if (resMap.has(id)) {
        let res = resMap.get(id);
        if (customerId != res.customerId) {
            res.customerId = customerId;
            resMap.set(id, res);
            store.dispatch(setResMap2(resMap));
        }
    }

    if (!store.getState().nearbyDeviceMap.has(id)) {
        log_info("add new smart lock for nearby " + name)
        let newMap = store.getState().nearbyDeviceMap;
        newMap.set(id, {
            id: id,
            title: name,
            type: deviceType,
        });
        store.dispatch(setNearbyDeviceMap(newMap));
    }
};


export const smartlock_upload_notify = (mac, data) => {
    let result = Bytes2HexString(data);
    if (result.toUpperCase().indexOf('C9') !== -1) {
        let code = result.toUpperCase().substring(0, 4);

        console.log("data notify -> code" + code + ",data:" + data)

        switch (code) {
            case CODE_DEVICE_INFO:
                lockInfoNotify(mac, data);
                break;
            case CODE_ENCRYPT_VALIDATE:
                encryptValidate(mac, data);
                break;
            default:
                break;
        }
    }
};

const lockInfoNotify = (id, res) => {
    let counter = Bytes2Int(res[16]) * 256 + Bytes2Int(res[17]);

    let countMap = store.getState().countMap;
    if (countMap.has(id)) {
        if (counter != countMap.get(id)) {
            countMap.set(id, counter);
            store.dispatch(setCountMap2(countMap));
        }
    } else {
        countMap.set(id, counter);
        store.dispatch(setCountMap2(countMap));
    }

    let ble_version = parseFloat(Bytes2Int(res[2])).toFixed(1) / 10;
    let software_version = parseFloat(Bytes2Int(res[11])) / 10;
    let hardware_version = parseFloat(Bytes2Int(res[12])) / 10;

    let battery_capacity = Bytes2Int(res[3]);
    let error_code = Bytes2Int(res[5]);
    let malfunction = Bytes2Int(res[6]);

    let customerId = '2113';

    let resMap = store.getState().resMap;
    if (resMap.has(id)) {
        let res = resMap.get(id);
        if (customerId != '0000') {
            if (customerId != res.customerId) {
                res.customerId = customerId;
                resMap.set(id, res);
                store.dispatch(setResMap2(resMap));
            }
        }
    }

    let newMap = store.getState().peripheralMap;
    let name = '';
    if (newMap.has(id)) {
        name = newMap.get(id).name;
    }

    let info = new SmartLockInfo(
        id,
        name,
        ble_version,
        software_version,
        hardware_version,
        customerId,
        battery_capacity,
        0
    );

    log_info("counter is " + counter + ",get info from lock " + JSON.stringify(info))

    let deviceInfoMap = store.getState().deviceInfoMap;
    if (deviceInfoMap.has(id)) {
        let previous_info = deviceInfoMap.get(id);
        if (previous_info.getCounterInitFlag() === 0) {
            info.setCounterInitFlag(1);
        } else {
            info.setCounterInitFlag(previous_info.getCounterInitFlag());
        }
    }
    deviceInfoMap.set(id, info);
    store.dispatch(setDeviceInfoMap(deviceInfoMap));
}


const encryptValidate = (id, res) => {
    let result = Bytes2Int(res[2]);
    console.log("encrypt validate result -> " + result)
}
