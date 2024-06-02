import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import LazyLoad from 'react-lazyload';
import ProductCardLazy from "./Lazy/LazyProductCard";
const ProductCard = React.lazy(() => import('./ProductCard'));

interface Product {
    Title: string;
    _id: string;
    Price: number;
    Images: string[];
}

interface ProductListProps {}

const ProductList: React.FC<ProductListProps> = () => {
    const [productItems, setProductItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await axios.get<Product[]>('https://api.orochirage.ru/api/products', { timeout: 10000 });
                setProductItems(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) {
        return (
            <>
                <div className="product-list flex flex-row flex-wrap justify-center lg:gap-x-[1.887rem] gap-x-4 gap-y-6 w-full lg:justify-center lg:px-8 pb-8">
                    {[...Array(10)].map((_, index) => (
                        <ProductCardLazy key={index} />
                    ))}
                </div>
            </>
        );
    }

    if (productItems.length === 0) {
        return (
            <div className="text-gray-500 h-[14.6rem] flex flex-col items-center justify-center">
                <div className="text-center text-lg text-wrap">Технические шоколадки, мы пока это исправляем!</div>
            </div>
        );
    }

    return (
        <LazyLoad key="items_list_lazy__key" offset={50} className={`product-list flex flex-row flex-wrap justify-center lg:gap-x-[1.887rem] gap-x-4 gap-y-6 lg:gap-x-[4.25rem] w-full ${productItems.length <= 3 ? "lg:justify-start" : "lg:justify-center"} lg:px-8 pb-8`}>
            <Suspense fallback={<LazyList />}>
                {productItems.map((item, index) => (
                    <ProductCard
                        key={item._id}
                        Title={item.Title}
                        _id={item._id}
                        Price={item.Price}
                        Images={item.Images}
                    />
                ))}
            </Suspense>
        </LazyLoad>
    );
};

const LazyList = () => {
    return (
        <>
                {[...Array(10)].map((_, index) => (
                    <ProductCardLazy key={index} />
                ))}
        </>
    );
};

export default ProductList;
