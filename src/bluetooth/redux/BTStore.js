import {createStore, combineReducers, applyMiddleware} from "redux";
import reducer from "./BTReducer";
import thunkMiddleware from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

const composedEnhancer = composeWithDevTools(applyMiddleware(thunkMiddleware))

// 全局你可以创建多个reducer 在这里统一在一起
// const rootReducers = combineReducers({reducer},composedEnhancer)
// 全局就管理一个store
export const store = createStore(reducer,composedEnhancer)
