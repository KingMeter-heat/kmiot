import {createStackNavigator} from 'react-navigation-stack';
import React from 'react';
import IndexPage from '../pages/IndexPage';
import DetailPage from '../pages/DetailPage';

export const AppStackNavigator = createStackNavigator(
    {
        IndexPage: {
            screen: IndexPage,
            navigationOptions: {headerShown: false},
        },
        DetailPage: {
            screen: DetailPage,
            navigationOptions: {headerShown: false},
        },
    },
    {
        defaultNavigationOptions: {
            headerShown: false,
        },
        // initialRouteName:"IndexPage"
    },
);
