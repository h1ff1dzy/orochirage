import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store/store';
import { ThunkAction } from 'redux-thunk';
import { Action } from 'redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartItem } from '../context/CartProvider';
import { FavoriteItem } from '../context/FavoritesProvider'
import { setCartItems } from './cartSlice';
import { setFavoriteItems } from './favoriteSlice';

interface ProfileUpdatePayload {
    firstName?: string;
    secondName?: string;
    sex?: string;
    email?: string;
    Address?: { Address: string; name: string; Index: number }[];
    Notifications?: { Sale: boolean; Discount: boolean; NewItems: boolean };
    Social?: { Telegram: string; Instagram: string; VK: string };
}

interface User {
    Notifications: {
        Sale: boolean;
        Discount: boolean;
        NewItems: boolean;
    };
    Social: {
        Telegram: string;
        Instagram: string;
        VK: string;
    };
    _id: string;
    Phone: string;
    Sex: string;
    "First name": string;
    "Second name": string;
    "Middle name": string;
    Email: string;
    Orders: {
        price: number;
    }[];
    Achievements: {
        name: string;
        description: string;
        rarity: string;
        icon: string;
        dateUnlocked: string;
    }[];
    Address: {
        Address: string;
        Index: number;
        name: string;
    }[];
}

interface SignInPayload {
    phone: string;
    password: string;
}

interface OrderedBy {
    $timestamp: {
        t: number;
        i: number;
    };
}

interface Order {
    payment_details: {
        card_info: {
            card_type: string;
            last4: string;
        }
    }
    delivery_address: {
        address: string;
        index: string;
    }
    amount: number;
    payment_id: string;
    status: string;
    adminStatus: string;
    paid: boolean;
    delivery_type: string;
    promo: string;
    products: {
        ProductDetails: {
            color: string;
            size: string;
            quantity: number;
        }
        productId: {
            _id: string;
            Title: string;
            Images: [];
        };

    }[]
    orderId: string;
    createdBy: string;
}

const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null as null | User,
        orders: null as null | Order[],
        loading: false,
        error: null as null | string,
        token: localStorage.getItem('token') || null,
        tokenValid: false
    },
    reducers: {
        updateProfile: (state, action: PayloadAction<ProfileUpdatePayload>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
        saveToken: (state, action) => {
            state.token = action.payload;
            localStorage.setItem('token', action.payload);
        },
        saveUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
        saveOrders: (state, action: PayloadAction<Order[] | null>) => {
            state.orders = action.payload;
        },
        setTokenValidity: (state, action: PayloadAction<boolean>) => {
            state.loading = false;
            state.tokenValid = action.payload;
        },
        signInPending: (state) => {
            state.loading = true;
            state.error = null;
        },
        signInFulfilled: (state, action: PayloadAction<User>) => {
            state.loading = false;
            state.user = action.payload;
        },
        signInRejected: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        signOut: (state) => {
            state.user = null;
            state.orders = null;
            state.token = null;
            state.tokenValid = false;
            state.loading = false;
            state.error = null;
            localStorage.removeItem('token');
        },
    },
});

export const Logout = (): ThunkAction<void, RootState, undefined, Action<string>> => async (dispatch) => {
    dispatch(signOut());
    dispatch(checkTokenValidity());
    toast.info("Вы вышли из профиля")
};

export const { saveToken, signOut, saveOrders, updateProfile, saveUser, setTokenValidity, signInPending, signInFulfilled, signInRejected } = userSlice.actions;

interface SignUpPayload {
    phone: string;
    password: string;
    reCaptchaToken: string | null;
}

export const signUp = (credentials: SignUpPayload): ThunkAction<void, RootState, undefined, Action<string>> => async (dispatch) => {
    dispatch(signInPending());

    try {
        const { phone, password, reCaptchaToken } = credentials;

        if (!phone.trim() || !password.trim()) {
            dispatch(signInRejected("Необходимо заполнить все поля"));
            return;
        }

        const response = await axios.post('https://api.orochirage.ru/api/user/sign-up', {
            phone,
            password,
            reCaptchaToken,
        });

        dispatch(signInFulfilled(response.data));
        dispatch(saveToken(response.data.token));
        dispatch(saveUser(response.data));
        dispatch(checkTokenValidity());

        toast.success("Регистрация прошла успешно!");
    } catch (error: any) {
        if (error.response) {
            const status = error.response.status;
            let errorMessage = '';

            switch (status) {
                case 400:
                    errorMessage = 'Такой пользователь уже существует.';
                    break;
                case 401:
                    errorMessage = 'Вы не прошли каптчу.';
                    break;
                case 500:
                    errorMessage = 'Регистрация на данный момент невозможна.';
                    break;
                default:
                    errorMessage = "Неизвестная ошибка";
                    break;
            }

            dispatch(signInRejected(errorMessage));
        }
    }
};

export const saveProfileChanges = (changes: ProfileUpdatePayload): ThunkAction<void, RootState, undefined, Action<string>> => async (dispatch, getState) => {
    try {
        const token = getState().user.token;
        if (!token) {
            throw new Error('Отсутствует токен');
        }

        const response = await axios.post('https://api.orochirage.ru/api/user/update-profile', changes, {
            headers: {
                Authorization: token
            },
            timeout: 10000
        });

        dispatch(updateProfile(changes));
        toast.success("Данные профиля успешно сохранены");
    } catch (error) {
        console.error('Ошибка при сохранении изменений профиля:', error);
        toast.error("Не удалось изменить данные профиля");
    }
}

export const signIn = (credentials: SignInPayload): ThunkAction<void, RootState, undefined, Action<string>> => async (dispatch, getState) => {
    dispatch(signInPending());
    try {
        const { phone, password } = credentials;
        if (!phone.trim() || !password.trim()) {
            dispatch(signInRejected("Необходимо заполнить оба поля"));
            return;
        }

        const response = await axios.post('https://api.orochirage.ru/api/user/sign-in', {
            phone,
            password,
        });

        const ordersResponse = await axios.post('https://api.orochirage.ru/api/user/orders', null, {
            headers: {
                Authorization: response.data.token
            }
        });

        dispatch(saveOrders(ordersResponse.data));

        dispatch(signInFulfilled(response.data));
        dispatch(saveToken(response.data.token));
        dispatch(saveUser(response.data));

        dispatch(checkTokenValidity());

        const profileResponse = await axios.post('https://api.orochirage.ru/api/user/profile', null, {
            headers: {
                Authorization: response.data.token
            }
        });

        dispatch(saveUser(profileResponse.data));

        const cartItems: CartItem[] = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const favoriteItems: FavoriteItem[] = JSON.parse(localStorage.getItem('favoriteItems') || '[]');

        await axios.post('https://api.orochirage.ru/api/user/cart/sync', { items: cartItems }, {
            headers: {
                Authorization: response.data.token
            }
        });

        await axios.post('https://api.orochirage.ru/api/user/favorites/sync', { items: favoriteItems }, {
            headers: {
                Authorization: response.data.token
            }
        });

        // Fetch the updated cart and favorite items from the server
        const updatedCartResponse = await axios.get('https://api.orochirage.ru/api/user/cart', {
            headers: {
                Authorization: response.data.token
            }
        });
        const updatedFavoriteResponse = await axios.get('https://api.orochirage.ru/api/user/favorites', {
            headers: {
                Authorization: response.data.token
            }
        });

        dispatch(setCartItems(updatedCartResponse.data));
        dispatch(setFavoriteItems(updatedFavoriteResponse.data));
        localStorage.removeItem('cartItems');
        localStorage.removeItem('favoriteItems');

        toast.success("Вы успешно авторизовались!");
    } catch (error: any) {
        if (error.response) {
            const status = error.response.status;
            let errorMessage = '';

            switch (status) {
                case 404:
                case 401:
                    errorMessage = 'Номер телефона и/или пароль неверные.';
                    break;
                case 500:
                    errorMessage = 'Авторизация на данный момент невозможна.';
                    break;
                default:
                    errorMessage = "Неизвестная ошибка";
                    break;
            }

            dispatch(signInRejected(errorMessage));
        }
    }
};

export const checkTokenValidity = (): ThunkAction<void, RootState, undefined, Action<string>> => async (dispatch, getState) => {
    try {
        const token = getState().user.token;
        if (!token) {
            throw new Error('Отсутствует токен');
        }

        const response = await axios.post('https://api.orochirage.ru/api/user/profile', null, {
            headers: {
                Authorization: token
            }
        });

        dispatch(setTokenValidity(true));
        dispatch(saveUser(response.data));

        const ordersResponse = await axios.post('https://api.orochirage.ru/api/user/orders', null, {
            headers: {
                Authorization: token
            }
        });

        dispatch(saveOrders(ordersResponse.data));
    } catch (error) {
        console.error('Ошибка проверки валидности токена:', error);
        dispatch(setTokenValidity(false));
        localStorage.removeItem('token');
    }
};

export default userSlice.reducer;
