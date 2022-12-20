import React, {Component, useEffect, useRef, useState} from 'react';
import Provider from "@ant-design/react-native/lib/provider";
import {BATTERY_GRID, FONT_COLOR, THEME_BACKEND, THEME_GREY, UPGRADE_COLOR} from "../../../components/constant/Color";
import {log_info} from "../../../utils/LogUtils";
import {connect, disConnect, isConnected} from "../../DeviceFunctions";
import {store} from "../../../bluetooth/redux/BTStore";
import {encrypt_device, querySmartLockInfo, unlock} from "../SmartLockFunctions";
import {DEVICE_TYPE} from "../../DeviceType";
import {notify} from "../../../components/notify/notify";
import {setDeviceInfoMap, setPeripheralMap2} from "../../../bluetooth/redux/BTActions";
import {YouNeedToConnectDeviceNotification} from "../../../business/Language";
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import Battery from "../../../components/battery";
import {Switch} from "@ant-design/react-native";
import {DEVICE_WIDTH} from "../../../components/constant/Size";


export default class LockDetailPage extends Component {
    constructor(props) {
        super(props);
        this.navigation = this.props.navigation;
        this.item = this.props.navigation.getParam('item');
    }

    render() {
        return (
            <Provider>
                <LockDetailPageHook
                    navigation={this.navigation}
                    item={this.item}
                />
            </Provider>
        );
    }
}

const SIZE = 40;
const TITLE_SIZE = 80;

export const LockDetailPageHook = props => {
    const returnImg = require('../../../images/return.png');

    const item = props.item;
    const currentMac = item.id;
    const navigation = props.navigation;

    const heat_component = useRef(null);

    const [currentName, setCurrentName] = useState(item.title);
    const [currentCode, setCurrentCode] = useState('');

    const [chargingStatus, setChargingStatus] = useState('');
    const [batteryCapacity, setBatteryCapacity] = useState(0);
    const [softwareVersion, setSoftwareVersion] = useState('');
    const [hardwareVersion, setHardwareVersion] = useState('');

    const [checked, setChecked] = useState(false);

    const [batteryColor, setBatteryColor] = useState(THEME_GREY);

    const [codeButtonColorStyle, setCodeButtonColorStyle] = useState();

    const currentUpdateInfoTimer = useRef(0);

    const _gotoIndexPage = () => {
        navigation.navigate('LockHomePage');
    };

    useEffect(() => {
        log_info("device info page useEffect")
        return (() => {
            clearInterval(currentUpdateInfoTimer.current);
        });
    }, [])

    const _back = () => {
        clearInterval(currentUpdateInfoTimer.current);
        if (isConnected(currentMac)) {
            log_info("back 0,device connected")
            disConnect(currentMac);
            _dealWithDisconnected();
        } else {
            log_info("back 0,device not connected")
        }
        _gotoIndexPage();
    };

    const _showDeviceInfo = (info) => {
        setChecked(true);
        setBatteryColor(THEME_BACKEND)
        setSoftwareVersion('V' + info.software_version);
        setHardwareVersion('V' + info.hardware_version);
        if (heat_component.current != null) {
            heat_component.current.setLevel(info.heat_gear);
            heat_component.current.setOnOff(info.heat_state);
        }
        setCurrentCode(info.customerId);
        setBatteryCapacity(info.battery_capacity <= 100 ? info.battery_capacity : 100);
        setChargingStatus(info.charging_state === 1 ? "Yes" : "No");
    }

    const _dealWithConnected = async () => {
        //we need to know the current capacity of the battery
        currentUpdateInfoTimer.current = setInterval(() => {
            if (!isConnected(currentMac)) {
                log_info("device not connected");
                _dealWithDisconnected();
            } else {
                let deviceInfoMap = store.getState().deviceInfoMap;
                if (deviceInfoMap !== undefined && deviceInfoMap.has(currentMac)) {
                    let info = deviceInfoMap.get(currentMac);
                    if (info.getCounterInitFlag() === 1) {
                        encrypt_device(currentMac, "00000000", () => {
                            console.log("send validation");
                            info.setCounterInitFlag(2);
                            deviceInfoMap.set(currentMac, info);
                            store.dispatch(setDeviceInfoMap(deviceInfoMap));
                        });
                    } else if (info.getCounterInitFlag() === 2) {
                        querySmartLockInfo(currentMac);
                    }
                    _showDeviceInfo(deviceInfoMap.get(currentMac));
                    setCodeButtonColorStyle({color: THEME_BACKEND});
                }
            }
        }, 1000);
    }

    const _connectPress = (checked) => {
        if (checked) {
            //连接设备
            connect(currentMac, currentName, DEVICE_TYPE.SmartLockGen2, () => {
                _dealWithConnected();
            }, (message) => {
                notify(message, 2)
                _dealWithDisconnected();
            })
        } else {
            //断开设备
            disConnect(currentMac);
            _dealWithDisconnected();
        }
    }


    const _dealWithDisconnected = () => {
        setCodeButtonColorStyle({color: BATTERY_GRID});
        setChecked(false);
        setCurrentCode('')
        setHardwareVersion('')
        setSoftwareVersion('')
        setBatteryColor(THEME_GREY)
        setChargingStatus('');
        setBatteryCapacity(0);
        if (heat_component.current != null) {
            heat_component.current.setLevel(0);
            heat_component.current.setOnOff(0);
        }
        //这里要讲连接状态设置成false
        let newMap = store.getState().peripheralMap;
        if (newMap.has(currentMac)) {
            let peripheral = newMap.get(currentMac);
            if (peripheral.isConnected) {
                peripheral.isConnected = false;
                newMap.set(currentMac, peripheral);
                store.dispatch(setPeripheralMap2(newMap));
            }
        }
        let deviceInfoMap = store.getState().deviceInfoMap;
        let info = deviceInfoMap.get(currentMac);
        info.setCounterInitFlag(0);
        deviceInfoMap.set(currentMac, info);
        store.dispatch(setDeviceInfoMap(deviceInfoMap));

        clearInterval(currentUpdateInfoTimer.current);
    }

    const _unlock_now = () => {
        if (!isConnected(currentMac)) {
            notify(YouNeedToConnectDeviceNotification);
            return;
        }

        unlock(currentMac, () => {

        });
    }

    return (
        <View style={styles.container}>
            <View style={styles.top_view1}>
                <View style={styles.top_view2}>
                    <View style={styles.top_back}>
                        <TouchableOpacity
                            onPress={_back}
                            activeOpacity={1}>
                            <Image style={styles.image} source={returnImg}/>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.top_title_text}>
                        {currentName}
                    </Text>
                    <View style={styles.top_center}>
                    </View>
                </View>
            </View>
            <View style={styles.bottom_view}>
                <View style={styles.info_view}>
                    <View style={styles.left_view}>
                        <Battery
                            type="default"
                            percent={batteryCapacity}
                            width={150}
                            height={150}
                            borderColor={batteryColor}
                            color={THEME_BACKEND}
                            gridColor={FONT_COLOR}></Battery>
                        <Text style={{fontSize: 20,}}>{batteryCapacity}%</Text>
                    </View>
                    <View style={styles.right_view}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <View style={styles.label_view}>
                                <Text style={[styles.version_text, {}]}>Customer ID:</Text>
                                <Text style={styles.version_text}>Charging Status:</Text>
                            </View>
                            <View style={styles.value_view}>
                                <Text style={[styles.version_text, {}]}>{currentCode}</Text>
                                <Text style={styles.version_text}>{chargingStatus}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                            <Switch uncheckedText='关' checked={checked} checkedText='开' onChange={checked => {
                                _connectPress(checked);
                            }}/>
                        </View>
                    </View>
                </View>
                <View style={styles.version_view}>
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={styles.sh_version_text}>Software:</Text>
                        <Text style={styles.sh_version_text}>{softwareVersion}</Text>
                    </View>
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
                        <Text style={styles.sh_version_text}>Hardware:</Text>
                        <Text style={styles.sh_version_text}>{hardwareVersion}</Text>
                    </View>
                </View>
                <View style={styles.button_view}>
                    <View style={styles.button_left}>
                        <TouchableOpacity
                            onPress={() => {
                                _unlock_now();
                            }}
                            style={styles.button_search}
                            activeOpacity={1}>
                            <Text style={[styles.button_text, codeButtonColorStyle]}>UnLock</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>);
}

const styles = StyleSheet.create({
    container: {
        margin: 0,
        // flexDirection: 'column',
        height: '100%',
    },
    top_view1: {
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: '#248af8',
        height: 80,
    },
    top_view2: {
        height: 30,
        // borderWidth: 1,
        // borderColor: 'black',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 20,
        paddingRight: 20,
    },
    button_text: {
        height: 40,
        fontSize: 25,
        color: FONT_COLOR,
        margin: 8,
        textAlignVertical: 'center',
        ...Platform.select({
            ios: {lineHeight: 20},
            android: {},
        }),
    },
    top_title_text: {
        // borderWidth:1,
        padding: 0,
        color: FONT_COLOR,
        height: 30,
        fontSize: 23,
        textAlign: 'center',
        textAlignVertical: 'center',
        ...Platform.select({
            ios: {lineHeight: 30},
            android: {},
        }),
    },
    top_delete_text: {
        height: 30,
        fontSize: 20,
        textAlign: 'center',
        textAlignVertical: 'center',
        ...Platform.select({
            ios: {lineHeight: 30},
            android: {},
        }),
    },
    bottom_view: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: FONT_COLOR,
    },
    info_view: {
        flex: 2.0,
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: -30,
        // borderWidth: 1,
        // borderColor: 'green',
    },
    left_view: {
        flex: 1.2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label_view: {
        paddingTop: 10,
        flex: 3.2,
        alignItems: 'flex-end',
        // borderWidth:1,
        // borderColor:'red'
    },
    version_text: {
        height: 40,
        fontSize: 19,
        margin: 4,
        textAlignVertical: 'center',
        ...Platform.select({
            ios: {lineHeight: 20},
            android: {},
        }),
    },
    value_view: {paddingTop: 10, flex: 1.8, alignItems: 'center'},
    right_view: {
        flex: 2.2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    version_view: {
        flex: 0.5,
        // marginLeft:10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        // borderWidth: 1,
        // borderColor: 'green',
    },
    sh_version_text: {
        // borderWidth: 1,
        // borderColor: 'green',
        height: 25,
        fontSize: 20,
        margin: 8,
        textAlignVertical: 'center',
        ...Platform.select({
            ios: {lineHeight: 20},
            android: {},
        }),
    },
    button_view: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        // marginTop: 10,
        alignItems: 'center',
        // borderWidth:1,
        // borderColor:'red'
    },
    button_left: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    button_right: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    button_search: {
        margin: 10,
        width: DEVICE_WIDTH / 2 - 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME_GREY,
        height: 50,
        borderRadius: 10,
    },
    top_back: {
        width: SIZE,
        height: SIZE,
        borderRadius: 100,
        // zIndex: 99,
    },
    top_center: {
        height: TITLE_SIZE,
    },
    image: {
        width: 30,
        height: 30,
    },
    power_image: {
        width: 40,
        height: 40,
    },
    modifyCodeModal: {
        borderRadius: 20,
        margin: 0,
        padding: 0,
    },
});
