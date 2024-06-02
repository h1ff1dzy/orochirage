import { configureStore, Middleware } from '@reduxjs/toolkit';
import rootReducer from '../slicers/rootReducer';
import { counterMiddleware } from "../middlewares/counterMiddleware";
import {thunk} from 'redux-thunk'; // Исправлен импорт
import { useDispatch } from "react-redux";



const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(counterMiddleware as Middleware, thunk),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export default store;
