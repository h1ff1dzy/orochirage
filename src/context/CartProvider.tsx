import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setCartItems as setCartItemsRedux, addToCart as addToCartRedux, removeFromCart as removeFromCartRedux, updateCartItemQuantity as updateCartItemQuantityRedux } from '../slicers/cartSlice';

export interface CartItem {
    _id: string;
    Color: string;
    Size: string;
    Quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
    addToCart: (item: CartItem) => Promise<void>;
    removeFromCart: (_id: string, color: string, size: string) => Promise<void>;
    clearCart: () => void;
    updateQuantity: (_id: string, color: string, size: string, newQuantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextType>({
    cartItems: [],
    setCartItems: () => {},
    addToCart: async () => {},
    removeFromCart: async () => {},
    clearCart: () => {},
    updateQuantity: async () => {}
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItemsState] = useState<CartItem[]>([]);
    const token = useSelector((state: RootState) => state.user.token);
    const dispatch: AppDispatch = useDispatch();

    useEffect(() => {
        const syncCartWithDB = async () => {
            if (token) {
                try {
                    const response = await axios.get('https://api.orochirage.ru/api/user/cart', {
                        headers: {
                            Authorization: token
                        }
                    });
                    const dbCartItems = response.data;
                    setCartItemsState(dbCartItems);
                    dispatch(setCartItemsRedux(dbCartItems));
                } catch (error) {
                    console.error('Ошибка синхронизации корзины:', error);
                }
            }
        };
        syncCartWithDB();
    }, [token, dispatch]);

    const clearCart = () => {
        setCartItemsState([]);
    };

    const addToCart = async (item: CartItem) => {
        setCartItemsState(prevItems => [...prevItems, item]);
        dispatch(addToCartRedux(item));
        if (token) {
            try {
                await axios.post('https://api.orochirage.ru/api/user/cart/add', { item }, {
                    headers: {
                        Authorization: token
                    }
                });
            } catch (error) {
                console.error('Ошибка при добавлении товара в корзину:', error);
            }
        }
    };

    const removeFromCart = async (_id: string, color: string, size: string) => {
        setCartItemsState(prevItems => prevItems.filter(item => !(item._id === _id && item.Color === color && item.Size === size)));
        dispatch(removeFromCartRedux({ _id, Color: color, Size: size }));
        if (token) {
            try {
                await axios.post('https://api.orochirage.ru/api/user/cart/remove', { item: { _id, Color: color, Size: size } }, {
                    headers: {
                        Authorization: token
                    }
                });
            } catch (error) {
                console.error('Ошибка при удалении товара из корзины:', error);
            }
        }
    };

    const updateQuantity = async (_id: string, color: string, size: string, newQuantity: number) => {
        const updatedItems = cartItems.map(item => {
            if (item._id === _id && item.Color === color && item.Size === size) {
                return { ...item, Quantity: newQuantity };
            }
            return item;
        });
        setCartItemsState(updatedItems);
        dispatch(updateCartItemQuantityRedux({ _id, Color: color, Size: size, Quantity: newQuantity }));
        if (token) {
            try {
                await axios.post('https://api.orochirage.ru/api/user/cart/update', { item: { _id, Color: color, Size: size, Quantity: newQuantity } }, {
                    headers: {
                        Authorization: token
                    }
                });
            } catch (error) {
                console.error('Ошибка при обновлении количества товара в корзине:', error);
            }
        }
    };

    return (
        <CartContext.Provider value={{ cartItems, setCartItems: setCartItemsState, addToCart, removeFromCart, clearCart, updateQuantity }}>
            {children}
        </CartContext.Provider>
    );
};
