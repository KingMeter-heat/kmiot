import {Animated, Image, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {
    connect,
    disConnect,
    isConnected,
    modifyCustomerId,
    queryLockInfo,
    rename,
    restart,
    shutDown,
    writePhoneMacToDevice
} from "../heat/HeatFuctions";
import {FONT_COLOR, POWER_OFF_COLOR, THEME_BACKEND, THEME_GREY} from "../components/constant/Color";
import {DEVICE_WIDTH} from "../components/constant/Size";
import Battery from "../components/battery";
import {log_info} from "../utils/LogUtils";
import {notify} from "../components/notify/notify";
import {ClearMacSucceed, YouCanOnlyInputNumber, YouNeedToConnectDeviceNotification} from "../business/Language";
import {BTUpgradeDFU} from "../components/views/BTUpgradeDFU";
import {Modal, Switch} from '@ant-design/react-native';
import InputItem from '@ant-design/react-native/es/input-item';
import {request} from "../utils/http";
import HeatLevelView from "../components/views/HeatLevelView";
import {store} from "../bluetooth/redux/BTStore";
import {setNearbyDeviceMap, setPeripheralMap2} from "../bluetooth/redux/BTActions";
import {DEVICE_TYPE} from "../device/DeviceType";

const SIZE = 40;
const TITLE_SIZE = 80;

// export default class DeviceInfoPage extends Component {
//
//     constructor(props) {
//         super();
//         this.state = {
//             item: props.item,
//             currentMac: props.item.id,
//             navigation: props.navigation
//         }
//     }
//
//     UNSAFE_componentWillMount() {
//         if (isConnected(this.state.currentMac)) {
//             log_info("device info page useEffect,connected")
//             _dealWithConnected();
//         }
//     }
//
//     render() {
//         return <DeviceInfoPageView navigation={this.state.navigation}
//                                    item={this.state.item}/>;
//     }
// }


export const DeviceInfoPage = props => {
    const returnImg = require('../images/return.png');

    const [codeModalVisible, setCodeModalVisible] = useState(false);
    const [newCode, setNewCode] = useState('');

    const item = props.item;
    const currentMac = item.id;
    const navigation = props.navigation;

    const growAnimated = new Animated.Value(0);

    const heat_component = useRef(null);

    const [currentName, setCurrentName] = useState(item.title);
    const [currentCode, setCurrentCode] = useState('');

    const [chargingStatus, setChargingStatus] = useState('');
    const [batteryCapacity, setBatteryCapacity] = useState(0);
    const [softwareVersion, setSoftwareVersion] = useState('');
    const [hardwareVersion, setHardwareVersion] = useState('');

    const [currentPhoneMac, setCurrentPhoneMac] = useState('');

    const [checked, setChecked] = useState(false);

    const [batteryColor, setBatteryColor] = useState(THEME_GREY);

    const [codeButtonColorStyle, setCodeButtonColorStyle] = useState();
    const [restartButtonColorStyle, setRestartButtonColorStyle] = useState();
    const [offButtonColorStyle, setOffButtonColorStyle] = useState();
    const [renameButtonColorStyle, setRenameButtonColorStyle] = useState();
    const [clearButtonColorStyle, setClearButtonColorStyle] = useState();

    const currentUpdateInfoTimer = useRef();

    const _gotoIndexPage = () => {
        navigation.navigate('IndexPage', {refresh: Math.random()});
    };

    useEffect(() => {
        log_info("device info page useEffect")
        // if (isConnected(currentMac)) {
        //     log_info("device info page useEffect,connected")
        //     _dealWithConnected();
        // }
        return (() => {
            clearInterval(currentUpdateInfoTimer.current);
        });
    }, [])

    const _back = () => {
        // Animated.timing(growAnimated, {
        //     toValue: 1,
        //     duration: 300,
        //     easing: Easing.linear,
        //     useNativeDriver: false,
        // }).start();

        clearInterval(currentUpdateInfoTimer.current);

        if (isConnected(currentMac)) {
            log_info("back 0,device connected")
            disConnect(currentMac);
        } else {
            log_info("back 0,device not connected")
        }

        _gotoIndexPage();
    };

    const _showDeviceInfo = (info) => {
        setChecked(true);
        setBatteryColor(THEME_BACKEND)
        setSoftwareVersion(info.software_version);
        setHardwareVersion(info.hardware_version);
        if (heat_component.current != null) {
            heat_component.current.setLevel(info.heat_gear);
            heat_component.current.setOnOff(info.heat_state);
        }
        setCurrentCode(info.customerId);
        setBatteryCapacity(info.battery_capacity <= 100 ? info.battery_capacity : 100);
        setChargingStatus(info.charging_state === 1 ? "Charging" : "Not Charge");
        setCurrentPhoneMac(info.phoneMacFromDevice);
    }

    const _dealWithConnected = () => {
        currentUpdateInfoTimer.current = setInterval(() => {
            // log_info("isConnected " + isConnected(currentMac))
            if (!isConnected(currentMac)) {
                log_info("device not connected");
                _dealWithDisconnected();
            } else {
                queryLockInfo(currentMac);
                let deviceInfoMap = store.getState().deviceInfoMap;
                // log_info(info.toString())
                if (deviceInfoMap != undefined && deviceInfoMap.has(currentMac)) {
                    _showDeviceInfo(deviceInfoMap.get(currentMac));
                }
            }
        }, 1000);
    }

    const _connectPress = (checked) => {
        if (checked) {
            //连接设备
            connect(currentMac, currentName,DEVICE_TYPE.HEAT,() => {
                _dealWithConnected();
            }, (message) => {
                notify(message, 2)
                _dealWithDisconnected();
            })
        } else {
            //断开设备
            disConnect(currentMac);
            setTimeout(() => {
                _dealWithDisconnected();
            }, 1000);
        }
    }

    function ShowPowerImageView(props) {
        const powerOnImage = require('../images/power_on.png');
        const powerOffImage = require('../images/power_off.png');
        if (props.show) {
            return <Image
                // resizeMode={'stretch'}
                // resizeMethod={'scale'}
                style={styles.power_image} source={powerOnImage}/>
        } else {
            return <Image
                // accessible={true}
                // resizeMode={'stretch'}
                // resizeMethod={'scale'}
                style={styles.power_image} source={powerOffImage}/>
        }
    }


    const _shutdownPress = () => {
        if (!isConnected(currentMac)) {
            notify(YouNeedToConnectDeviceNotification);
            return;
        }
        setOffButtonColorStyle({color: POWER_OFF_COLOR});
        shutDown(currentMac, () => {
            _dealWithDisconnected();
            setOffButtonColorStyle({color: FONT_COLOR});
        }, currentName);
    }

    const _dealWithDisconnected = () => {
        setChecked(false);
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
        clearInterval(currentUpdateInfoTimer.current);
    }

    const _clearMac = () => {
        log_info("clearMac" + isConnected(currentMac));
        if (!isConnected(currentMac)) {
            notify(YouNeedToConnectDeviceNotification);
            return;
        }
        setClearButtonColorStyle({color: POWER_OFF_COLOR});
        writePhoneMacToDevice(currentMac, [0x30, 0x30, 0x30, 0x30, 0x30, 0x30], () => {
            // setCurrentPhoneMac('');
            // _dealWithDisconnected();
            notify(ClearMacSucceed);
            setClearButtonColorStyle({color: FONT_COLOR});
        })
    }

    const _rename = () => {
        if (!isConnected(currentMac)) {
            notify(YouNeedToConnectDeviceNotification);
            return;
        }
        setRenameButtonColorStyle({color: POWER_OFF_COLOR});
        request({
            'url': '/device/getNumber',
            'params': {'type': 'HotShoeType', 'mac': '', 'previousNumber': ''}
        }).then((res) => {
            let name = res;
            log_info("rename get " + name);
            rename(currentMac, String(name), () => {
                log_info("rename new name " + name);
                setCurrentName(name);
                let newMap = store.getState().nearbyDeviceMap;
                if (newMap.has(currentMac)) {
                    newMap.set(currentMac, {
                        id: currentMac,
                        title: String(name),
                        bond: true
                    });
                    store.dispatch(setNearbyDeviceMap(newMap));
                }

                let newMap2 = store.getState().peripheralMap;
                if (newMap2.has(currentMac)) {
                    let peripheral = newMap2.get(currentMac);
                    peripheral.name = String(name);
                    newMap2.set(currentMac, peripheral);
                    store.dispatch(setPeripheralMap2(newMap2));
                }
                setRenameButtonColorStyle({color: FONT_COLOR});
                _dealWithDisconnected();
            })
        })
    }

    const _restart = () => {
        if (!isConnected(currentMac)) {
            notify(YouNeedToConnectDeviceNotification);
            return;
        }
        setRestartButtonColorStyle({color: POWER_OFF_COLOR})
        restart(currentMac, () => {
        })
        setTimeout(()=>{
            _dealWithDisconnected();
            setRestartButtonColorStyle({color: FONT_COLOR})
        },1000)
    }
    const footerButtons = [
        {
            text: <Text style={{color: THEME_BACKEND}}>Cancel</Text>,
            onPress: () => {
                setCodeModalVisible(false);
                setNewCode('');
            },
        },
        {
            text: <Text style={{color: THEME_BACKEND}}>Ok</Text>,
            onPress: () => {
                if (!isConnected(currentMac)) {
                    notify(YouNeedToConnectDeviceNotification);
                    return;
                }
                if(typeof newCode ==='number'){
                    modifyCustomerId(currentMac, newCode, () => {
                        setCurrentCode(newCode)
                        setNewCode('')
                        _dealWithDisconnected();
                    });
                }else{
                    setNewCode('')
                    notify(YouCanOnlyInputNumber);
                }
            },
        },
    ];
    const _modifyCode = () => {
        if (!isConnected(currentMac)) {
            notify(YouNeedToConnectDeviceNotification);
            return;
        }
        setCodeButtonColorStyle({color: POWER_OFF_COLOR})
        setCodeModalVisible(true);
    }

    return (
        <View style={styles.container}>
            <Modal
                title={''}
                transparent
                onClose={() => {
                    setCodeModalVisible(false);
                    setCodeButtonColorStyle({color: FONT_COLOR})
                }}
                maskClosable
                visible={codeModalVisible}
                footer={footerButtons}
                style={{
                    margin: 0,
                    padding: 0,
                    borderRadius: 20,
                }}
                bodyStyle={styles.modifyCodeModal}>
                <View style={{}}>
                    <InputItem
                        style={{
                            borderWidth: 1,
                            borderColor: THEME_GREY,
                            borderRadius: 10,
                        }}
                        maxLength={4}
                        value={newCode}
                        onChange={value => {
                            setNewCode(value);
                        }}
                        type={"number"}
                        placeholder="Input new code here"
                    />
                </View>
            </Modal>
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
                                <Text style={[styles.version_text, {}]}>Dealer ID</Text>
                                <Text style={styles.version_text}>Charging Status</Text>
                                <Text style={styles.version_text}>Mac</Text>
                            </View>
                            <View style={styles.value_view}>
                                <Text style={[styles.version_text, {}]}>{currentCode}</Text>
                                <Text style={styles.version_text}>{chargingStatus}</Text>
                                <Text style={styles.version_text}>{currentPhoneMac}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                            {/*<TouchableOpacity*/}
                            {/*    onPress={_connectPress}*/}
                            {/*    activeOpacity={1}>*/}
                            {/*    <ShowPowerImageView show={powerStateImage}></ShowPowerImageView>*/}
                            {/*</TouchableOpacity>*/}
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
                <HeatLevelView ref={(_heat_component) => {
                    heat_component.current = _heat_component;
                }} mac={currentMac} heatOnOff={0}
                               heatLevel={0}></HeatLevelView>
                <View style={styles.button_view}>
                    <View style={styles.button_left}>
                        <TouchableOpacity
                            onPress={() => {
                                _modifyCode();
                            }}
                            style={styles.button_search}
                            activeOpacity={1}>
                            <Text style={[styles.button_text, codeButtonColorStyle]}>Code</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                _restart();
                            }}
                            style={styles.button_search}
                            activeOpacity={1}>
                            <Text style={[styles.button_text,restartButtonColorStyle]}>Restart</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                _shutdownPress();
                            }}
                            style={styles.button_search}
                            activeOpacity={1}>
                            <Text style={[styles.button_text,offButtonColorStyle]}>Off</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.button_right}>
                        <TouchableOpacity
                            onPress={() => {
                                _rename();
                            }}
                            style={styles.button_search}
                            activeOpacity={1}>
                            <Text style={[styles.button_text,renameButtonColorStyle]}>Rename</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                _clearMac();
                            }}
                            style={styles.button_search}
                            activeOpacity={1}>
                            <Text style={[styles.button_text,clearButtonColorStyle]}>
                                Clear Mac
                            </Text>
                        </TouchableOpacity>
                        <BTUpgradeDFU mac={currentMac} name={currentName} preCall={() => {
                            _dealWithDisconnected()
                        }}></BTUpgradeDFU>
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
        backgroundColor: THEME_BACKEND,
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
        fontSize: 30,
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
        flex: 1,
        alignItems: 'flex-end'
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
    value_view: {paddingTop: 10, flex: 2.5, alignItems: 'flex-start'},
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
        flex: 2,
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
        alignItems: 'center',
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
