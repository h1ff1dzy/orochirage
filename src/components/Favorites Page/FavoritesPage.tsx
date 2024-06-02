import React, { useEffect, useState } from 'react';
import { useFavorites } from '../../context/FavoritesProvider';
import axios from 'axios';
import ProductCard from '../ProductCard';
import {Spinner} from "@material-tailwind/react";

interface Product {
    _id: string;
    Title: string;
    Price: number;
    Images: string[];
}

const FavoritesPage = () => {
    const { favoriteItems } = useFavorites();
    const [productItems, setProductItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchProductDetails = async () => {
            setLoading(true);
            const promises = favoriteItems.map(item => axios.get<Product>(`https://api.orochirage.ru/api/products/${item._id}`));
            try {
                const responses = await Promise.all(promises);
                const productsData = responses.map(response => response.data);
                setProductItems(productsData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching product details:', error);
                setLoading(false);
            }
        };

        if (favoriteItems.length > 0) {
            fetchProductDetails();
        } else {
            setProductItems([]);
            setLoading(false);
        }
    }, [favoriteItems]);

    return (
        <>
            {loading ? (
                <div className="flex items-center justify-center h-[calc(100vh-30rem)] w-full"><Spinner className="h-12 w-12" /></div>
            ) : (
                <div className="product-list flex flex-wrap gap-x-4 gap-y-6 mb-8 content-center justify-center items-start w-full">
                    {productItems.length === 0 ? (
                        <div className="text-gray-500 h-[14.6rem] flex flex-col items-center justify-center">
                            <div className="text-center text-lg text-wrap">Вы ничего не добавляли в избранное!</div>
                        </div>
                    ) : (
                        productItems.map(item => (
                            <ProductCard
                                key={item._id}
                                Title={item.Title}
                                _id={item._id}
                                Price={item.Price}
                                Images={item.Images}
                            />
                        ))
                    )}
                </div>
            )}
        </>
    );
};

export default FavoritesPage;
