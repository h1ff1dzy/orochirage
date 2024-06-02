import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store/store';
import { ThunkAction } from 'redux-thunk';
import { Action } from 'redux';
import 'react-toastify/dist/ReactToastify.css';

interface AdminState {
    permissions: {
        adminPanel: boolean;
        changeOrderStatus: boolean;
        changeUserCredentials: boolean;
        viewUserCredentials: boolean;
        viewUserOrders: boolean;
        addShopItems: boolean;
        editShopItems: boolean;
        removeShopItems: boolean;
        createNewRoles: boolean;
        changeUserRoles: boolean;
        removeUsers: boolean;
        createNewUsers: boolean;
        banUsers: boolean;
    };
    roleName: null | "";
    loading: boolean;
    error: string | null;
}

const initialState: AdminState = {
    permissions: {
        adminPanel: false,
        changeOrderStatus: false,
        changeUserCredentials: false,
        viewUserCredentials: false,
        viewUserOrders: false,
        addShopItems: false,
        editShopItems: false,
        removeShopItems: false,
        createNewRoles: false,
        changeUserRoles: false,
        removeUsers: false,
        createNewUsers: false,
        banUsers: false,
    },
    roleName: null || "",
    loading: false,
    error: null,
};

export const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        setPermissions: (state, action: PayloadAction<AdminState['permissions']>) => {
            state.permissions = action.payload;
        },
        setRoleName: (state, action: PayloadAction<AdminState['roleName']>) => {
            state.roleName = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const { setPermissions, setLoading, setError, setRoleName } = adminSlice.actions;

// Thunk для получения прав пользователя
export const fetchUserPermissions = (): ThunkAction<void, RootState, undefined, Action<string>> => async (dispatch, getState) => {
    dispatch(setLoading(true)); // Устанавливаем флаг загрузки

    try {
        const token = getState().user.token;
        if (!token) {
            throw new Error('Отсутствует токен');
        }

        const responsePermissions = await axios.post('https://api.orochirage.ru/api/user/permissions', null, {
            headers: {
                Authorization: token
            }
        });
        const responseRoleName = await axios.post('https://api.orochirage.ru/api/user/permissions/name', null, {
            headers: {
                Authorization: token
            }
        });

        // Если запрос успешен, сохраняем полученные права в хранилище
        dispatch(setPermissions(responsePermissions.data));
        dispatch(setRoleName(responseRoleName.data));
        dispatch(setLoading(false));
    } catch (error) {
        console.error('Ошибка при получении прав пользователя:', error);
        dispatch(setError('Ошибка при получении прав пользователя'));
        dispatch(setLoading(false));
    }
};

// Селектор для получения прав пользователя из состояния
export const selectPermissions = (state: RootState) => state.admin.permissions;
export const selectRoleName = (state: RootState) => state.admin.roleName;
export const selectError = (state: RootState) => state.admin.error;

// Экспортируем редьюсер
export default adminSlice.reducer;
