import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setFavoriteItems as setFavoriteItemsRedux, addToFavorites as addToFavoritesRedux, removeFromFavorites as removeFromFavoritesRedux } from '../slicers/favoriteSlice';

export interface FavoriteItem {
    _id: string;
}

interface FavoriteContextType {
    favoriteItems: FavoriteItem[];
    setFavoriteItems: React.Dispatch<React.SetStateAction<FavoriteItem[]>>;
    addToFavorites: (_id: string) => void;
    removeFromFavorites: (_id: string) => void;
    isFavorite: (_id: string) => boolean;
}

const FavoriteContext = createContext<FavoriteContextType>({
    favoriteItems: [],
    setFavoriteItems: () => {},
    addToFavorites: () => {},
    removeFromFavorites: () => {},
    isFavorite: () => false,
});

export const useFavorites = () => useContext(FavoriteContext);

export const FavoriteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [favoriteItems, setFavoriteItemsState] = useState<FavoriteItem[]>([]);
    const token = useSelector((state: RootState) => state.user.token);
    const dispatch: AppDispatch = useDispatch();

    useEffect(() => {
        const fetchFavoriteItems = async () => {
            try {
                const response = await axios.get('https://api.orochirage.ru/api/user/favorites', {
                    headers: {
                        Authorization: token
                    }
                });
                const dbFavoriteItems = response.data;
                setFavoriteItemsState(dbFavoriteItems);
                dispatch(setFavoriteItemsRedux(dbFavoriteItems));
            } catch (error) {
                console.error('Ошибка загрузки избранного:', error);
            }
        };

        const syncFavoritesWithDB = async () => {
            if (token) {
                try {
                    const localFavoriteItems = JSON.parse(localStorage.getItem('favoriteItems') || '[]');

                    const mergedFavoriteItems = [...localFavoriteItems];
                    const response = await axios.get('https://api.orochirage.ru/api/user/favorites', {
                        headers: {
                            Authorization: token
                        }
                    });
                    const dbFavoriteItems = response.data;

                    dbFavoriteItems.forEach((dbItem: FavoriteItem) => {
                        if (!localFavoriteItems.some((localItem: FavoriteItem) => localItem._id === dbItem._id)) {
                            mergedFavoriteItems.push(dbItem);
                        }
                    });

                    await axios.post('https://api.orochirage.ru/api/user/favorites/sync', { items: mergedFavoriteItems }, {
                        headers: {
                            Authorization: token
                        }
                    });

                    localStorage.removeItem('favoriteItems');
                    fetchFavoriteItems();
                } catch (error) {
                    console.error('Ошибка синхронизации избранного:', error);
                }
            } else {
                const savedFavoriteItems = localStorage.getItem('favoriteItems');
                if (savedFavoriteItems) {
                    setFavoriteItemsState(JSON.parse(savedFavoriteItems));
                }
            }
        };
        syncFavoritesWithDB();
    }, [token, dispatch]);

    useEffect(() => {
        if (!token) {
            const savedFavoriteItems = localStorage.getItem('favoriteItems');
            if (savedFavoriteItems) {
                setFavoriteItemsState(JSON.parse(savedFavoriteItems));
            }
        }
    }, [token]);

    useEffect(() => {
        if (!token) {
            localStorage.setItem('favoriteItems', JSON.stringify(favoriteItems));
        }
    }, [favoriteItems, token]);

    const addToFavorites = async (_id: string) => {
        setFavoriteItemsState(prevItems => [...prevItems, { _id }]);
        dispatch(addToFavoritesRedux({ _id }));
        if (token) {
            try {
                await axios.post('https://api.orochirage.ru/api/user/favorites/add', { item: { _id } }, {
                    headers: {
                        Authorization: token
                    }
                });
            } catch (error) {
                console.error('Ошибка добавления в избранное на сервере:', error);
            }
        }
    };

    const removeFromFavorites = async (_id: string) => {
        setFavoriteItemsState(prevItems => {
            const updatedItems = prevItems.filter(item => item._id !== _id);
            dispatch(removeFromFavoritesRedux(_id));
            if (token) {
                axios.post('https://api.orochirage.ru/api/user/favorites/remove', { item: { _id } }, {
                    headers: {
                        Authorization: token
                    }
                }).catch(error => {
                    console.error('Ошибка удаления из избранного на сервере:', error);
                });
            }
            return updatedItems;
        });
    };

    const isFavorite = (_id: string) => {
        return favoriteItems.some(item => item._id === _id);
    };

    return (
        <FavoriteContext.Provider value={{ favoriteItems, setFavoriteItems: setFavoriteItemsState, addToFavorites, removeFromFavorites, isFavorite }}>
            {children}
        </FavoriteContext.Provider>
    );
};
