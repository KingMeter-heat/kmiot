import {createStackNavigator} from 'react-navigation-stack';
import React from 'react';
import HeatIndexPage from '../device/heat/pages/HeatIndexPage';
import HeatDetailPage from '../device/heat/pages/HeatDetailPage';
import LockIndexPage from "../device/smartlock/pages/LockIndexPage";
import LockDetailPage from "../device/smartlock/pages/LockDetailPage";

export const AppStackNavigator = createStackNavigator(
    {
        HeatIndexPage: {
            screen: HeatIndexPage,
            navigationOptions: {headerShown: false},
        },
        HeatDetailPage: {
            screen: HeatDetailPage,
            navigationOptions: {headerShown: false},
        },
        LockIndexPage:{
            screen: LockIndexPage,
            navigationOptions: {headerShown: false},
        },
        LockDetailPage:{
            screen:LockDetailPage,
            navigationOptions: {headerShown: false},
        }
    },
    {
        defaultNavigationOptions: {
            headerShown: false,
        },
        initialRouteName:"LockIndexPage"
    },
);
