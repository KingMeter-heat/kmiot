import {log_info} from "../../utils/LogUtils";
import {store} from "../../bluetooth/redux/BTStore";
import {sendMessageToHardware} from "../../bluetooth/BTUtils";
import {asciiStr2intArray, Str2Bytes, Str2BytesPer2} from "../../bluetooth/BTDataUtils";
import {_sendCommandToLock, validateBeforeAction} from "../DeviceFunctions";



export const querySmartLockInfo = async mac => {
    let peripheral = validateBeforeAction(mac);
    if (!peripheral) {
        log_info('********read device info failed ----------02--');
        return false;
    }
    let res = store.getState().resMap.get(mac);
    log_info("query info data is "+Str2BytesPer2('C9A5E738690101'))
    await sendMessageToHardware(
        mac,
        res.writeWithResponseServiceUUID[0],
        res.writeWithResponseCharacteristicUUID[0],
        Str2BytesPer2('C9A5E738690101'),
        false,
    ).then(r => () => {
    });
    return true;
};

export const unlock = (mac, callback = () => {
}) => {
    return _sendCommandToLock(mac, 0x02, [0x0,0x0,0x0,0x0], callback, true);
};


export const encrypt_device = (mac,encrypt_str, callback = () => {
})=>{
    return _sendCommandToLock(mac, 0x06, asciiStr2intArray(encrypt_str), callback, false);
}
