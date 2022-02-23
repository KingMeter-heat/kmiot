import {
    SETTING_COUNT_MAP, SETTING_DEVICE_INFO_MAP,
    SETTING_LISTENING_FLAG,
    SETTING_NEARBY_DEVICE,
    SETTING_NEARBY_DFU,
    SETTING_PERIPHERAL_MAP, SETTING_RES_MAP,
    SETTING_SCANNING_FLAG
} from "./BTActions";
import {store} from "./BTStore";
import {log_info} from "../../utils/LogUtils";

const init = {
    scanningFlag : false,
    listeningFlag: false,
    nearbyDeviceMap: new Map(),
    nearbyDeviceList:[],
    nearbyDFU: {"name":"","peripheral":null},
    peripheralMap: new Map(),//id,name,isConnected,device_type
    countMap : new Map(),
    resMap : new Map(),
    deviceInfoMap : new Map(),
}


// store.subscribe(() => {
//     console.log("subscribe count is "+store.getState().number);
// }, []);

export default (state = init, action) => {
    // log_info('action',JSON.stringify(action))
    switch (action.type) {
        case SETTING_SCANNING_FLAG:
            return {...state,scanningFlag : action.scanningFlag}
        case SETTING_LISTENING_FLAG:
            return {...state,listeningFlag : action.listeningFlag}
        case SETTING_NEARBY_DEVICE:
            return {...state,nearbyDeviceMap : action.nearbyDeviceMap,nearbyDeviceList:action.nearbyDeviceList}
        case SETTING_NEARBY_DFU:
            return {...state,nearbyDFU:action.nearbyDFU}
        case SETTING_PERIPHERAL_MAP:
            return {...state,peripheralMap:action.peripheralMap}
        case SETTING_COUNT_MAP:
            return {...state,countMap:action.countMap}
        case SETTING_RES_MAP:
            return {...state,resMap:action.resMap}
        case SETTING_DEVICE_INFO_MAP:
            return {...state,deviceInfoMap:action.deviceInfoMap}
        default:
            return state
    }
}
