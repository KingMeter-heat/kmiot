import React, {Component} from 'react';
import Provider from "@ant-design/react-native/lib/provider";
import {HeatInfoPage} from "./HeatInfoPage";


export default class HeatDetailPage extends Component {
    constructor(props) {
        super(props);
        this.navigation = this.props.navigation;
        this.item = this.props.navigation.getParam('item');
    }


    render() {
        return (
            <Provider>
                <HeatInfoPage
                    navigation={this.navigation}
                    item={this.item}
                />
            </Provider>
        );
    }
}
