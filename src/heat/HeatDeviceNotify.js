import {Byte2Mac, Bytes2HexString, Bytes2Int, Bytes2Str} from '../bluetooth/BTDataUtils';
import DeviceInfo from './HeatCache';
import {log_info} from '../bluetooth/BTLogUtils';
import {store} from "../bluetooth/redux/BTStore";
import {setCountMap2, setDeviceInfoMap, setNearbyDeviceMap, setResMap2} from "../bluetooth/redux/BTActions";

const CODE_DEVICE_INFO = 'C981';
const CODE_SHUT_DOWN = 'C982';
const CODE_HEAT_ONOFF = 'C983';
const CODE_HEAT_GEAR = 'C984';
const CODE_RENAME = 'C9C4';
const CODE_CUSTOMER_ID_MODIFY = 'C9C5';
const CODE_UPGRADE_MCU = 'C9FC';
const CODE_RESET = 'C9FE';
const CODE_ILLEGAL = 'C9FF';
const CODE_SET_PHONE_MAC = 'C911';


export const device_disconnect_notify_business = mac => {
    // if(nearbyDeviceMap.has(mac)){
    //     nearbyDeviceMap.delete(mac);
    // }
}

export const heat_discover_notify = async (
    peripheral, customerId, deviceType, data
) => {
    let phoneMacFromDevice = Byte2Mac([
        data[13],
        data[12],
        data[11],
        data[10],
        data[9],
        data[8],
    ]);
    let id = peripheral.id;
    let name = String(peripheral.name).trim();

    let deviceInfoMap = store.getState().deviceInfoMap;
    let info = new DeviceInfo();
    if (deviceInfoMap.has(id)) {
        info = deviceInfoMap.get(id);
    }
    info.setName(name);
    info.setCustomerId(customerId);
    info.setPhoneMacFromDevice(phoneMacFromDevice);
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
        log_info("add new shoe for nearby " + name)
        let newMap = store.getState().nearbyDeviceMap;
        newMap.set(id, {
            id: id,
            title: name,
        });
        store.dispatch(setNearbyDeviceMap(newMap));
    }

    // nearbyDeviceMap.set(mac,{
    //     id: mac,
    //     title: peripheral.name,
    //     bond: phoneMacFromDevice==="303030303030"
    // });

    // let newMap = store.getState().peripheralMap;
    // if(!newMap.has(id)){
    //     newMap.set(id,peripheral);
    //     store.dispatch(setPeripheralMap2(newMap));
    // }
    // let newMap = store.getState().peripheralMap;
    // let p = {id:id,name:name,isConnected:false,device_type:DEVICE_TYPE.HEAT};
    // newMap.set(id, p);
    // store.dispatch(setPeripheralMap2(newMap));

    // updatePeripheralMap(peripheral);
};

export const heat_upload_notify = (mac, data) => {
    let result = Bytes2HexString(data);
    if (result.toUpperCase().indexOf('C9') !== -1) {
        let code = result.toUpperCase().substring(0, 4);
        switch (code) {
            case CODE_DEVICE_INFO:
                deviceInfoNotify(mac, data);
                break;
            case CODE_SHUT_DOWN:
                shutdownNotify(mac, data);
                break;
            case CODE_HEAT_ONOFF:
                heatOnOffNotify(mac, data);
                break;
            case CODE_HEAT_GEAR:
                heatGearNotify(mac, data);
                break;
            case CODE_RENAME:
                renameNotify(mac, data);
                break;
            case CODE_CUSTOMER_ID_MODIFY:
                customerIdModifyNotify(mac, data);
                break;
            case CODE_UPGRADE_MCU:
                upgradeMcuNotify(mac, data);
                break;
            case CODE_RESET:
                resetNotify(mac, data);
                break;
            case CODE_ILLEGAL:
                illegalNotify(mac, data);
                break;
            case CODE_SET_PHONE_MAC:
                setPhoneNotify(mac, data);
                break;
            default:
                break;
        }
    }
};

const deviceInfoNotify = (id, res) => {
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

    let software_version = parseFloat(Bytes2Int(res[2])).toFixed(1) / 10;
    let hardware_version = parseFloat(Bytes2Int(res[3])) / 10;

    let heat_state = Bytes2Int(res[4]);
    let heat_gear = Bytes2Int(res[5]);

    let charging_state = Bytes2Int(res[6]);

    // let battery_capacity = (Bytes2Int(res[5]) * 256 + Bytes2Int(res[6])) / 1000;

    let battery_capacity = Bytes2Int(res[7]);

    let customerId = Bytes2Str([res[9], res[8]]);

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

    let phoneMacFromDevice = Byte2Mac([
        res[15],
        res[14],
        res[13],
        res[12],
        res[11],
        res[10],
    ]);

    // let peripheral = peripheralMap.get(mac);
    // peripheral.isConnected = true;
    // updatePeripheralMap(peripheral);

    let newMap = store.getState().peripheralMap;
    let name = '';
    if (newMap.has(id)) {
        name = newMap.get(id).name;
    }

    let info = new DeviceInfo(
        id,
        name,
        software_version,
        hardware_version,
        heat_state,
        heat_gear,
        charging_state,
        customerId,
        phoneMacFromDevice,
        battery_capacity,
    );

    log_info("get info from device : "+JSON.stringify(info))

    let deviceInfoMap = store.getState().deviceInfoMap;
    deviceInfoMap.set(id, info);
    store.dispatch(setDeviceInfoMap(deviceInfoMap));

    //判断是否是第一次验证秘钥
    // if (encryptMap.has(id)) {
    // 这里要 发送秘钥验证
    // validateEncrypt(mac);
    // }
};
const shutdownNotify = (mac, res) => {
};
const heatOnOffNotify = (mac, res) => {
    let heat_state = Bytes2Int(res[2]);
    log_info('turn on or off heat ,response is ', heat_state);
    let deviceInfoMap = store.getState().deviceInfoMap;
    let info = deviceInfoMap.get(mac);
    info.setHeatState(heat_state);
    deviceInfoMap.set(mac, info);
    store.dispatch(setDeviceInfoMap(deviceInfoMap));
};
const heatGearNotify = (mac, res) => {
    let heat_gear = Bytes2Int(res[2]);
    log_info('heat gear set ,response is ', heat_gear);
    let deviceInfoMap = store.getState().deviceInfoMap;
    let info = deviceInfoMap.get(mac);
    info.setHeatGear(heat_gear);
    deviceInfoMap.set(mac, info);
    store.dispatch(setDeviceInfoMap(deviceInfoMap));
};
const renameNotify = (mac, res) => {
    let rename_state = Bytes2Int(res[2]);
    log_info('rename ,response is ', rename_state);
};
const customerIdModifyNotify = (mac, res) => {
    let modify_state = Bytes2Int(res[2]);
    log_info('customerId modified ,response is ', modify_state);
};
const upgradeMcuNotify = (mac, res) => {
    let upgrade_state = Bytes2Int(res[2]);
    log_info('mcu upgrade loading ,upgrade_state is ', upgrade_state);
};
const resetNotify = (mac, res) => {
};
const illegalNotify = (mac, res) => {
};
const setPhoneNotify = (mac, res) => {
    log_info('modify phone mac', mac);
};
