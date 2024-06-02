import {combineReducers} from '@reduxjs/toolkit';
import userReducer from './userSlice';
import adminReducer from "./adminSlice"
import cartReducer from "./cartSlice"
import favoriteReducer from "./favoriteSlice"


const rootReducer = combineReducers({
    user: userReducer,
    admin: adminReducer,
    cart: cartReducer,
    favorite: favoriteReducer
});


export default rootReducer;
