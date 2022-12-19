import React, {Component} from "react";
import {Image, StyleSheet, LayoutAnimation, Text, TouchableOpacity, PanResponder, View} from 'react-native';
import Util from '../utils/utils';
import Icon from 'react-native-vector-icons/Ionicons';
import IconFA from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import {startBle} from "../device/DeviceFunctions";


class Sortable extends Component {
    constructor(props) {
        super(props);
        this.navigation = this.props.navigation;
        this._width = Util.size.width / 3;
        this.leftIndex = 0;
        this.finalTopIndex = 0;
        this.left = 0;
        this.top = 0;
        // last item to be selected as default
        this.state = {
            // navigation:this.navigation,
            selected: 2,
            days: [{
                key: 0,
                title: "HeatShoes",
                type: 0,
                icon: "shoe-formal",
                size: 80,
                color: "#2c2c2c",
                hideNav: true,
            }, {
                key: 1,
                title: "SmartLock",
                type: 1,
                icon: "locked",
                size: 50,
                color: "#2aa2ef",
                hideNav: false,
            }
            ]
        }
        startBle();
    }


    render() {
        let navigation = this.navigation;
        const boxes = this.state.days.map((elem, index) => {
            // let top = Math.floor(index / 3) * this._width ;

            function showIcon(item) {
                switch (item.type) {
                    case 0:
                        return <MaterialCommunityIcons size={item.size} name={item.icon}
                                                       style={[styles.boxIcon, {color: item.color}]}></MaterialCommunityIcons>;

                    case 1:
                        return <Fontisto size={item.size} name={item.icon}
                                         style={[styles.boxIcon, {color: item.color}]}></Fontisto>;
                    default:
                        return <Icon size={item.size} name={item.icon}
                                     style={[styles.boxIcon, {color: item.color}]}></Icon>;
                }
            }
            function onPress(type){
                switch (type){
                    case 0://heat shoes
                        navigation.navigate('HeatHomePage');
                        break;
                    case 1://smart lock
                        navigation.navigate('LockHomePage');
                        break;
                    default:
                        break;
                }
            }

            return (
                <TouchableOpacity onPress={()=>{
                    onPress(elem.key)
                }} key={elem.key}>
                    <View ref={"box" + index} key={elem.key} style={[styles.touchBox, {}]} underlayColor="#eee">
                        <View style={styles.boxContainer}>
                            <Text style={styles.boxText}>{elem.title}</Text>
                            {showIcon(elem)}
                        </View>
                    </View>
                </TouchableOpacity>
            );
        })

        return (
            <View style={styles.touchBoxContainer}>
                {boxes}
            </View>
        );
    }
}

export default class HomePage extends Component {
    constructor(props) {
        super(props);
        this.navigation = this.props.navigation;
    }

    render() {
        return (
            <View>
                <Sortable navigation={this.navigation}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    itemWrapper: {
        backgroundColor: '#f3f3f3'
    },
    touchBox: {
        marginTop: 30,
        width: Util.size.width / 2,
        height: Util.size.width / 2,
        backgroundColor: "#fff",
        // position:"absolute",
        // left:0,
        // top:0,
        borderWidth: Util.pixel,
        borderColor:"#ccc"
        // borderColor:'#dc5718'
    },
    touchBoxContainer: {
        width: Util.size.width,
        height: Util.size.height,
        alignItems: "center",
        justifyContent: "center",
    },
    boxContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: Util.size.width / 2,
        height: Util.size.width / 2,
    },
    boxIcon: {
        position: "relative",
        top: -10
    },
    boxText: {
        position: "absolute",
        bottom: 40,
        width: Util.size.width / 2,
        textAlign: "center",
        left: 0,
        backgroundColor: "transparent"
    },
});


