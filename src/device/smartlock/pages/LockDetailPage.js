import React, {Component} from 'react';
import Provider from "@ant-design/react-native/lib/provider";
import {LockInfoPage} from "./LockInfoPage";


export default class LockDetailPage extends Component {
    constructor(props) {
        super(props);
        this.navigation = this.props.navigation;
        this.item = this.props.navigation.getParam('item');
    }


    render() {
        return (
            <Provider>
                <LockInfoPage
                    navigation={this.navigation}
                    item={this.item}
                />
            </Provider>
        );
    }
}
