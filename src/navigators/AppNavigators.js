import {createStackNavigator} from 'react-navigation-stack';
import React from 'react';
import HeatHomePage from '../device/heat/pages/HeatHomePage';
import HeatDetailPage from "../device/heat/pages/HeatDetailPage";
import LockHomePage from "../device/smartlock/pages/LockHomePage";
import LockDetailPage from "../device/smartlock/pages/LockDetailPage";
import HomePage from "./HomePage";

export const AppStackNavigator = createStackNavigator(
    {
        HomePage:{
            screen: HomePage,
            navigationOptions: {headerShown: false},
        },
        HeatHomePage: {
            screen: HeatHomePage,
            navigationOptions: {headerShown: false},
        },
        HeatDetailPage: {
            screen: HeatDetailPage,
            navigationOptions: {headerShown: false},
        },
        LockHomePage:{
            screen: LockHomePage,
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
        initialRouteName:"HomePage"
    },
);
