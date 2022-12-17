import {Image, StyleSheet, Text, TouchableOpacity, View,Vibration} from 'react-native';
import {heatOnOffSet, setHeatGear} from '../../device/heat/HeatFuctions';
import {notify} from '../notify/notify';
import {YouNeedToConnectDeviceNotification} from '../../business/Language';
import React, {Component} from 'react';
import {FONT_COLOR, THEME_BACKEND, THEME_GREY} from '../constant/Color';
import {log_info} from '../../utils/LogUtils';
import HeatSwitch from "../heat_switch/switch";
import {isConnected} from '../../device/DeviceFunctions';

export default class HeatLevelView extends Component {
    constructor(props) {
        super();
        this.state = {
            currentMac: props.mac,
            heatOnOff: props.heatOnOff,
            heatLevel: props.heatLevel,
            heatOnOffImage: props.heatOnOff === 0 ? false : true,
            button1Style:
                props.heatLevel === 1
                    ? {backgroundColor: THEME_BACKEND}
                    : {backgroundColor: THEME_GREY},
            button2Style:
                props.heatLevel === 2
                    ? {backgroundColor: THEME_BACKEND}
                    : {backgroundColor: THEME_GREY},
            button3Style:
                props.heatLevel === 3
                    ? {backgroundColor: THEME_BACKEND}
                    : {backgroundColor: THEME_GREY},
        };
    }

    setMac(mac){
        this.setState({
            currentMac:mac
        })
    }

    setLevel(level) {
        this.setState({
            heatLevel: level,
            button1Style: level === 1 ? {backgroundColor: THEME_BACKEND} : {backgroundColor: THEME_GREY},
            button2Style: level === 2 ? {backgroundColor: THEME_BACKEND} : {backgroundColor: THEME_GREY},
            button3Style: level === 3 ? {backgroundColor: THEME_BACKEND} : {backgroundColor: THEME_GREY},
        })
    }
    setOnOff(heatOnOff){
        this.setState({
            heatOnOff: heatOnOff,
            heatOnOffImage: heatOnOff === 0 ? false : true,
        })
    }

    _heat_click() {
        log_info("heat click"+this.state.currentMac+" on or off "+this.state.heatOnOff)
        if (!isConnected(this.state.currentMac)) {
            notify(YouNeedToConnectDeviceNotification);
            return;
        }
        if (this.state.heatOnOff === 0) {
            heatOnOffSet(this.state.currentMac, 1, () => {
                // this.setState(
                //     {
                //         heatOnOff: 1,
                //         heatOnOffImage: true
                //     }
                // )
            });
        } else {
            heatOnOffSet(this.state.currentMac, 0, () => {
                // this.setState(
                //     {
                //         heatOnOff: 0,
                //         heatOnOffImage: false
                //     }
                // )
            });
        }
    }

    HeatOnOffImageView() {
        if (this.state.heatOnOffImage) {
            return (
                <Image
                    style={styles.fire_image}
                    source={require('../../images/fire_on.png')}
                />
            );
        } else {
            return (
                <Image
                    style={styles.fire_image}
                    source={require('../../images/fire_off.png')}
                />
            );
        }
    }

    _heat_level_click(level) {
        if (!isConnected(this.state.currentMac)) {
            notify(YouNeedToConnectDeviceNotification);
            return;
        }
        Vibration.vibrate();
        switch (level) {
            case 1:
                setHeatGear(this.state.currentMac, 1, () => {
                    // this.setState({
                    //     heatLevel: level,
                    //     button1Style: {backgroundColor: THEME_BACKEND},
                    //     button2Style: {backgroundColor: THEME_GREY},
                    //     button3Style: {backgroundColor: THEME_GREY},
                    // })
                });
                break;
            case 2:
                setHeatGear(this.state.currentMac, 2, () => {
                    // this.setState({
                    //     heatLevel: level,
                    //     button1Style: {backgroundColor: THEME_GREY},
                    //     button2Style: {backgroundColor: THEME_BACKEND},
                    //     button3Style: {backgroundColor: THEME_GREY},
                    // })
                });
                break;
            case 3:
                setHeatGear(this.state.currentMac, 3, () => {
                    // this.setState({
                    //     heatLevel: level,
                    //     button1Style: {backgroundColor: THEME_GREY},
                    //     button2Style: {backgroundColor: THEME_GREY},
                    //     button3Style: {backgroundColor: THEME_BACKEND},
                    // })
                });
                break;
            default:
                break;
        }
    };

    render() {
        return (
            <View style={styles.level_view}>
                <View style={styles.level_button}>
                    <TouchableOpacity
                        onPress={() => {
                            this._heat_click();
                        }}
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 70,
                        }}
                        activeOpacity={1}>
                        {/*<Image*/}
                        {/*    style={styles.fire_image}*/}
                        {/*    source={this.state.heatOnOffImage ? require('../../images/fire_on.png') : require('../../images/fire_off.png')}*/}
                        {/*/>*/}
                        <HeatSwitch heat_switch={this.state.heatOnOffImage}></HeatSwitch>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            this._heat_level_click(1);
                        }}
                        style={[styles.button_level, this.state.button1Style]}
                        activeOpacity={1}>
                        <Text style={styles.level_text}>1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            this._heat_level_click(2);
                        }}
                        style={[styles.button_level, this.state.button2Style]}
                        activeOpacity={1}>
                        <Text style={styles.level_text}>2</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            this._heat_level_click(3);
                        }}
                        style={[styles.button_level, this.state.button3Style]}
                        activeOpacity={1}>
                        <Text style={styles.level_text}>3</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    level_view: {
        flex: 0.8,
        justifyContent: 'center',
        // borderWidth: 1,
        // borderColor: 'green',
        padding: 0,
        margin: 0,
    },
    level_button: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    fire_image: {
        width: 60,
        height: 60,
    },
    button_level: {
        margin: 10,
        width: 70,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME_GREY,
        height: 50,
        borderRadius: 10,
    },
    level_text: {
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
