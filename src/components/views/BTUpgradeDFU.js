import React, {useRef, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {DFUEmitter, NordicDFU} from 'react-native-nordic-dfu';
import {downUpgradeFile} from '../../utils/common';
import {latestFirmWareUrl} from '../../business/Core';
import {isConnected, openUpgrade, scanAllDevice, stopScan} from '../../heat/HeatFuctions';
import {log_info} from '../../utils/LogUtils';
import {Modal} from '@ant-design/react-native';
import Progress from '@ant-design/react-native/es/progress';
import {DEVICE_WIDTH} from '../constant/Size';
import {FONT_COLOR, POWER_OFF_COLOR, THEME_GREY} from '../constant/Color';
import {notify} from '../notify/notify';
import {UpgradeFailed, YouNeedToConnectDeviceNotification} from '../../business/Language';
import {log_error} from "../../bluetooth/BTLogUtils";
import {store} from "../../bluetooth/redux/BTStore";
import {setNearbyDFU} from "../../bluetooth/redux/BTActions";
import {string} from "prop-types";

export const BTUpgradeDFU = props => {
    const currentMac = props.mac;
    const currentName = props.name;

    const [progress, setProgress] = useState(0);
    const [progressModalVisible, setProgressModalVisible] = useState(false);
    const currentUpgradeTryTimes = useRef(0);

    const [upgradeButtonColorStyle, setUpgradeButtonColorStyle] = useState();

    // const [upgradeAbleMap,setUpgradeAbleMap] = useState(new Map());
    // const setUpgradeAblePeripheralMap = peripheral => {
    //     if (peripheral == null) {
    //         upgradeAbleMap.clear();
    //     } else {
    //         upgradeAbleMap.set(peripheral.name, peripheral);
    //     }
    // };

    const getUpgradeAblePeripheral = originName => {
        log_info("getUpgradeAblePeripheral",originName)
        let tmpName = 'K' + String(originName).substring(6);
        log_info("tmpName",tmpName)
        let tmpDFU = store.getState().nearbyDFU;
        if(tmpDFU.name==='KM-DFU') {
            tmpName = 'KM-DFU';
        }
        if (tmpDFU.name === tmpName) {
            return tmpDFU.peripheral;
        }
        return null;
    };

    const start_upgrade_listener = mac => {
        DFUEmitter.addListener('DFUProgress', ({percent}) => {
            log_info('DFU progress:', percent);
            setProgress(percent);
        });
        DFUEmitter.addListener('DFUStateChanged', ({state}) => {
            log_info('DFU state:', state);
            if (state === 'DEVICE_DISCONNECTING') {
                dealWithUpgradeCanceled();
            } else if (state === 'DFU_FAILED') {
                notify(UpgradeFailed);
                dealWithUpgradeCanceled();
            }
        });
    };
    const dealWithUpgradeCanceled = () => {
        currentUpgradeTryTimes.current = 0;
        setProgressModalVisible(false);
        setUpgradeButtonColorStyle({color: FONT_COLOR});
        setProgress(0);
        store.dispatch(setNearbyDFU("",null));
        remove_upgrade_listener();
    };

    const remove_upgrade_listener = () => {
        DFUEmitter.removeAllListeners('DFUProgress');
        DFUEmitter.removeAllListeners('DFUStateChanged');
    };

    const upgradeDFU = filePath => {
        currentUpgradeTryTimes.current += 1;
        if (currentUpgradeTryTimes.current > 50) {
            dealWithUpgradeCanceled();
            return;
        }
        log_info('upgrade 006 ');
        let p = getUpgradeAblePeripheral(currentName);
        log_info('try to get KM-DFU ~~~ ', JSON.stringify(p));
        if (p != null) {
            let mac = p.id;
            log_info('upgrade 007 ', p.id + p.name);
            currentUpgradeTryTimes.current = 0;
            start_upgrade_listener(mac);
            NordicDFU.startDFU({
                deviceAddress: mac,
                filePath: filePath,
            })
                .then(res => {
                    log_info('upgrade succeed');
                })
                .catch(exception => {
                    log_error('upgrade failed ', JSON.stringify(exception));
                })
                .finally(() => {
                    dealWithUpgradeCanceled();
                });
        } else {
            setTimeout(() => {
                upgradeDFU(filePath);
            }, 100);
        }
    };

    const _upgradeFirmware = () => {
        if (!isConnected(currentMac)) {
            notify(YouNeedToConnectDeviceNotification);
            return;
        }
        log_info("upgrade 001 "+currentMac);
        setProgressModalVisible(true);
        setUpgradeButtonColorStyle({color: POWER_OFF_COLOR});
        downUpgradeFile(latestFirmWareUrl, filePath => {
            log_info("upgrade 002 ")
            openUpgrade(currentMac);
            props.preCall();
            log_info('upgrade 003 ');
            stopScan(() => {
                scanAllDevice(() => {
                    log_info('upgrade 005 ');
                    upgradeDFU(filePath);
                });
            });
        });
    };

    return (
        <View>
            <Modal
                title={null}
                transparent
                maskClosable
                visible={progressModalVisible}
                onClose={() => {
                    dealWithUpgradeCanceled();
                }}
                style={{backgroundColor: 'white'}}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <Image
                        // resizeMode={'stretch'}
                        // resizeMethod={'scale'}
                        source={require('../../images/loading.gif')}
                        style={{width: 24, height: 24}}
                    />
                    <Progress percent={progress} barStyle={{}} />
                    <Text>{progress}%</Text>
                </View>
            </Modal>
            <TouchableOpacity
                onPress={() => {
                    _upgradeFirmware();
                }}
                style={styles.button_upgrade}
                activeOpacity={1}>
                <Text style={[styles.button_text,upgradeButtonColorStyle]}>Upgrade</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    button_upgrade: {
        margin: 10,
        width: DEVICE_WIDTH / 2 - 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME_GREY,
        height: 50,
        borderRadius: 10,
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
});
