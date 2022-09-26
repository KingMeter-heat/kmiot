import React, {Component, useEffect, useRef, useState} from 'react';
import {Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import headerImg from '../images/index_header.png';
import {FlatList} from 'react-native-gesture-handler';
import {FONT_COLOR, THEME_BACKEND, THEME_LIST_BACKEND,} from '../components/constant/Color';
import {DEVICE_WIDTH} from '../components/constant/Size';
import Provider from '@ant-design/react-native/lib/provider';
import {
    connect,
    forceRefreshNearbyDeviceMap,
    queryLockInfo,
    removeAllListener,
    scanAllDevice,
    shutDown, startBle,
} from '../heat/HeatFuctions';
import {notify} from '../components/notify/notify';
import {log_info} from '../utils/LogUtils';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux'
import {store} from "../bluetooth/redux/BTStore";
import {DEVICE_TYPE} from "../device/DeviceType";
import {downLoadFile, get} from "../utils/HttpUtils";
import {appVersion, appVersionUrl} from "../business/Core";
import {NoNeedUpgradeApp, upgradingAppNow} from "../business/Language";
import Progress from "@ant-design/react-native/es/progress";
import {Modal} from "@ant-design/react-native";
import ApkInstaller from "react-native-apk-installer";


const SIZE = 40;
const MARGIN = 40;

const Item = ({item, onPress, style}) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, style]}>
        <Text style={styles.listTitle}>{item.title}</Text>
        <Text style={styles.listTitle}>See More></Text>
    </TouchableOpacity>
);

export default class IndexPage extends Component {

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        log_info("error is "+JSON.stringify(error))
    }

    constructor(props) {
        super(props);
        this.navigation = this.props.navigation;
        startBle();
    }

    render() {
        return (
            <Provider>
                <IndexPageView navigation={this.navigation}/>
            </Provider>
        );
    }
}

export const IndexPageView = props => {
    const navigation = props.navigation;
    const currentTimer = useRef();

    // const [nearbyDeviceList,setNearbyDeviceList] = useState();
    // let [countTime,setCountTime] = useState(0);
    const [refreshingFlag, setRefreshingFlag] = useState(false);

    let [nearbyDeviceList_changed_times, setNearbyDeviceList_changed_times] = useState(0);

    const nearbyDeviceList = useSelector(store => store.nearbyDeviceList);

    const [progress, setProgress] = useState(0);
    const [progressModalVisible, setProgressModalVisible] = useState(false);

    useEffect(() => {
        // log_info("index useEffect");
        currentTimer.current = setInterval(() => {
            // log_info('进入定时器');
            // 注:在setCount中使用箭头函数是最好方式之一,只有一个timer生成
            // setCountTime(countTime++);
            // if(countTime>10000){
            //     setCountTime(0);
            // }
            getMoreData();
        }, 2000);
        return () => {
            clearInterval(currentTimer.current);
            removeAllListener();
        }
    }, []);

    const getMoreData = () => {
        // log_info("nearbyDeviceList is "+JSON.stringify(nearbyDeviceList))
        // log_info("store "+JSON.stringify(store.getState().nearbyDeviceList))
        scanAllDevice();
        setTimeout(() => {
            // setNearbyDeviceList(getDeviceNearby());
            if (nearbyDeviceList_changed_times === 10000) {
                nearbyDeviceList_changed_times = 0;
            }
            setNearbyDeviceList_changed_times(nearbyDeviceList_changed_times + 1);
        }, 1000);
    }

    const _logOut = () => {
        // Animated.timing(growAnimated, {
        //     toValue: 1,
        //     duration: 100,
        //     easing: Easing.linear,
        //     useNativeDriver: false,
        // }).start();

        // setTimdeout(() => {
        //     stopScan();
        //     removeAllListener();
        //     _gotoLoginPage();
        //     // buttonAnimated.setValue(0);
        //     // growAnimated.setValue(0);
        // }, 100);
    };

    const _gotoLoginPage = () => {
        navigation.navigate('LoginPage');
    };

    const _renderItem = ({item}) => {
        return (
            <Item
                item={item}
                onPress={() => {
                    _itemClick(item);
                }}
            />
        );
    };

    const _itemClick = item => {
        // scanAllDevice();
        clearInterval(currentTimer.current);
        navigation.navigate('DetailPage', {item: item});
    };

    const _stopOneByOne = (deviceList, index) => {
        if (index === deviceList.length) {
            forceRefreshNearbyDeviceMap();
            setNearbyDeviceList_changed_times(nearbyDeviceList_changed_times++);
            getMoreData();
            return;
        }
        let id = deviceList[index].id;
        let name = deviceList[index].title;
        notify(name + " is shutting down");
        setTimeout(() => {
            connect(id, name, DEVICE_TYPE.HEAT, () => {
                setTimeout(() => {
                    queryLockInfo(id);
                    setTimeout(() => {
                        shutDown(id, () => {
                            _stopOneByOne(deviceList, (index + 1))
                        }, name).then(
                        );
                    }, 2000)
                }, 2000)
            })
        }, 1000)
    }

    const _stopAll = () => {
        let deviceList = [];

        store.getState().nearbyDeviceMap.forEach((info, id) => {
            deviceList.push(info);
        })

        log_info("deviceList is " + JSON.stringify(deviceList))
        _stopOneByOne(deviceList, 0);
    }

    const _process=(percent)=>{
        log_info("percent is "+percent)
        setProgress(percent);
    }
    const dealWithUpgradeCanceled = () => {
        setProgressModalVisible(false);
        setProgress(0);
    }

    const _updateApp = async () => {
        if(progress!=0){
            setProgressModalVisible(true);
            return;
        }
        let data = await get(appVersionUrl, null, true);
        let version = data.version;
        let appName = data.filename;
        let appUrl = data.url;
        log_info("version is"+version)
        if (version != appVersion) {
            notify(upgradingAppNow);
            setProgressModalVisible(true);
            downLoadFile(appName, appUrl, (filePath) => {
                log_info("download okay 1" + filePath)
                setProgressModalVisible(false);
                setProgress(0);
                ApkInstaller.install(filePath);
            },_process);
        } else {
            notify(NoNeedUpgradeApp)
        }
    }

    return (
        <View style={styles.container}>
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
                        source={require('../images/loading.gif')}
                        style={{width: 24, height: 24}}
                    />
                    <Progress percent={progress} barStyle={{}} />
                    <Text>{progress}%</Text>
                </View>
            </Modal>
            <Image
                resizeMode={'contain'}
                style={styles.headerImg}
                source={headerImg}></Image>
            <ActionButton buttonColor="green" zIndex={99}>
                <ActionButton.Item buttonColor='#3498db' title="Upgrade App" onPress={() => {
                    _updateApp()
                }}>
                    <Icon name="download" style={styles.actionButtonIcon}/>
                </ActionButton.Item>
                <ActionButton.Item buttonColor='rgba(231,76,60,1)' title="Stop All" onPress={() => {
                    _stopAll()
                }}>
                    <Icon name="stop-circle" style={styles.actionButtonIcon}/>
                </ActionButton.Item>
            </ActionButton>
            <View style={styles.flatView}>
                <FlatList
                    extraData={nearbyDeviceList_changed_times}
                    style={styles.flatStyle}
                    data={nearbyDeviceList}
                    renderItem={_renderItem}
                    keyExtractor={(item) => item.id}
                    refreshing={false}
                    refreshControl={
                        <RefreshControl
                            title=""
                            color="#ccc"
                            refreshing={refreshingFlag}
                            onRefresh={() => {
                                setRefreshingFlag(true);
                                log_info("刷新~~~~~~~");
                                forceRefreshNearbyDeviceMap();
                                getMoreData();
                                setTimeout(() => {
                                    setRefreshingFlag(false);
                                }, 500);
                            }}
                        />
                    }
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 0,
        margin: 0,
        // marginTop: 100,
        // alignItems: 'flex-start',
        // justifyContent: 'flex-start',
    },
    headerTitle: {
        color: FONT_COLOR,
        fontSize: 40,
        margin: -40,
    },
    headerImg: {
        margin: 0,
        padding: 0,
        width: DEVICE_WIDTH,
        height: (DEVICE_WIDTH * 384) / 839,
    },
    logout_view: {
        flex: 1,
        marginBottom: 30,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        marginRight: 30,
    },
    logout_button: {
        alignItems: 'center',
        justifyContent: 'center',
        // width: SIZE,
        // height: SIZE,
        // borderRadius: 100,
        fontSize: 20,
        zIndex: 99,
        color: THEME_BACKEND,
    },
    circle: {
        height: SIZE,
        width: SIZE,
        marginTop: -SIZE,
        borderRadius: 100,
        backgroundColor: THEME_BACKEND,
    },
    image: {
        width: 24,
        height: 24,
    },
    flatView: {
        flex: 1,
        // borderWidth: 1,
        // borderColor: 'red',
    },
    flatStyle: {
        // borderWidth: 1,
        // borderColor: 'red',
        // zIndex: 200,
    },
    item: {
        // borderWidth: 1,
        // borderColor: BATTERY_GRID,
        backgroundColor: THEME_LIST_BACKEND,
        padding: 15,
        marginVertical: 10,
        marginHorizontal: 16,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    listTitle: {
        fontSize: 20,
        color: 'black',
        fontWeight: 'bold',
        backgroundColor: 'transparent',
    },
    button_view: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    button_style: {
        marginTop: 25,
        width: DEVICE_WIDTH / 2 - 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME_BACKEND,
        height: MARGIN,
        borderRadius: 10,
        zIndex: 100,
    },
    button_text: {
        color: FONT_COLOR,
        height: 45,
        fontSize: 40,
        textAlign: 'center',
        textAlignVertical: 'center',
        ...Platform.select({
            ios: {lineHeight: 30},
            android: {},
        }),
    },
    addShoesModal: {
        borderRadius: 20,
        margin: 0,
        padding: 0,
    },
    addShoesHeaderView: {
        // borderTopLeftRadius: 40,
        // borderTopRightRadius: 40,
        margin: 0,
        height: 50,
        // backgroundColor: THEME_BACKEND,
        color: THEME_BACKEND,
        fontSize: 20,
        textAlign: 'center',
        textAlignVertical: 'center',
        ...Platform.select({
            ios: {lineHeight: 30},
            android: {},
        }),
    },
    actionButtonView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonIcon: {
        fontSize: 20,
        height: 22,
        color: 'white',
    },
    actionButtonText: {
        fontSize: 18,
        color: 'white',
    }
});
