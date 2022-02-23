import React, {Component} from 'react';
import Provider from "@ant-design/react-native/lib/provider";
import {DeviceInfoPage} from "./DeviceInfoPage";


export default class DetailPage extends Component {
    constructor(props) {
        super(props);
        this.navigation = this.props.navigation;
        this.item = this.props.navigation.getParam('item');
    }

    render() {
        return (
            <Provider>
                <DeviceInfoPage
                    navigation={this.navigation}
                    item={this.item}
                />
            </Provider>
        );
    }
}
