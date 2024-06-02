import React, { useEffect, useState, Suspense } from "react";
import {Card, CardBody, Spinner, Typography} from "@material-tailwind/react";
import axios from "axios";
import ProductCard from "../ProductCard";
import {Link, useParams} from "react-router-dom";
import {Helmet} from "react-helmet";
import LazyLoad from "react-lazyload";
import ProductCardLazy from "../Lazy/LazyProductCard";

interface Product {
    _id: string;
    Title: string;
    Price: number;
    Images: string[];
    Colors: string[];
    Sizes: string[];
    Category: string[];
    Tags: Tag[];
}

interface Tag {
    _id: string;
    name: string;
    value: string;
}

interface Item {
    _id: string;
    name: string;
    link: string;
    products: Product[];
}

interface Category {
    _id: string;
    name: string;
    link: string;
    items: Item[];
    createdBy: string;
}

interface RouteParams {
    [key: string]: string;
}


const ProductCategories = () => {
    const params = useParams<RouteParams>();
    const [loading, setLoading] = useState<boolean>(true);
    const [category, setCategory] = useState<Category | null>(null);

    useEffect(() => {
        const fetchCollection = async () => {
            setLoading(true);
            try {
                const response = await axios.get<Category>(`https://api.orochirage.ru/api/categories/${params.category}`, { timeout: 10000 });
                setCategory(response.data);
            } catch (error) {
                console.error('Error fetching collection:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchCollection();
    }, [params.category]);

    if (loading) {
        return (
            <>
                <div className="flex items-center justify-center h-[calc(100vh-30rem)] w-full"><Spinner className="h-12 w-12" /></div>
            </>
        );
    }

    const SuspenceFallBack = () => {
        return(
            <div className="product-list flex flex-row flex-wrap justify-center lg:gap-x-[1.887rem] gap-x-4 gap-y-6 w-full lg:justify-start lg:px-8 pb-8">
                {[...Array(10)].map(() => (
                    <ProductCardLazy/>
                ))}
            </div>
        )
    }

    if (!category || !params.category) {
        return (
            <>
                <div className="flex flex-col gap-2 items-center justify-center h-[calc(100vh-30rem)] w-full text-2xl">
                    <div className="text-4xl font-semibold">Ошибка 404</div>
                    <div className="text-lg">Мы не смогли найти такую категорию, возможно она больше не доступна.</div>
                </div>
            </>
        );
    }

    if (params.category && params.subcategory) {
        const filteredItems = category.items.filter(item => item.link === params.subcategory); // Фильтрация товаров по саб-категории

        if (filteredItems.length === 0) {
            return (
                <div className="products-collection p-8">
                    <div className="products-collection__header flex flex-col gap-2">
                        <div className="products-collection__title text-xl flex-col">
                            <span className="font-semibold uppercase">{category.name}</span>
                            <div className="flex flex-col gap-1.5">
                                                            <span className="block text-gray-500 text-base">
                                Товары в данной подкатегории отсутствуют.
                            </span>
                                <span className="block text-gray-500 text-sm opacity-50">
                                Если Вы считаете что это ошибка, напишите в <a className="underline-offset-4 underline" href="#">поддержку</a>.
                            </span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if(category.items.length <= 0)
            return (
                <>
                    <div className="flex flex-col gap-2 items-center justify-center h-[calc(100vh-30rem)] w-full text-2xl">
                        <div className="text-4xl font-semibold">Ошибка 404</div>
                        <div className="text-lg">Мы не смогли найти такую категорию, возможно она больше не доступна.</div>
                    </div>
                </>
            )
        return (
            <>
                <Helmet>
                    <title>OROCHI - {category.name}</title>
                </Helmet>
                <div className="products-collection p-8">
                    <div className="products-collection__header flex flex-col gap-2">
                        <div className="products-collection__title text-xl flex-col">
                            <span className="font-semibold uppercase">{category.name}</span>
                            <span className="block text-gray-500 text-base">
                                {category.items
                                    .filter(item => item.link === params.subcategory) // Фильтрация товаров по саб-категории
                                    .map(item => (
                                        item.name
                                    ))}
                            </span>
                        </div>
                    </div>
                </div>
                <div className={`product-collection__items mt-2 px-[1.30rem]`}>
                    <LazyLoad height={300} offset={100} className="product-list flex flex-row flex-wrap justify-center lg:gap-x-[1.887rem] gap-x-4 gap-y-6 lg:gap-x-[4.25rem] w-full lg:justify-start">
                        <Suspense fallback={<SuspenceFallBack/>}>
                        {category.items.length === 0 ? (
                            <div className="text-gray-500 h-[14.6rem] flex flex-col">
                                <div className="text-center text-lg text-wrap">Эта категория пока что пустая</div>
                            </div>
                        ) : (
                            category.items
                                .filter(item => item.link === params.subcategory) // Фильтрация товаров по саб-категории
                                .map(item => (
                                    item.products.map(productItem => (
                                        <ProductCard
                                            key={productItem._id}
                                            Title={productItem.Title}
                                            _id={productItem._id}
                                            Price={productItem.Price}
                                            Images={productItem.Images}
                                        />
                                    ))
                                ))
                        )}
                        </Suspense>
                    </LazyLoad>
                </div>
            </>
        )
    }

    return (
        <>
            <div className="products-collection p-8">
                <div className="products-collection__header flex flex-col gap-2">
                    <div className="products-collection__title text-xl">
                        <span className="font-semibold uppercase">{category.name}</span>
                    </div>
                </div>
            </div>
            <div className={`product-collection__items mt-2 px-8 flex flex-row gap-4 flex-wrap`}>
                {category.items.map((item) => (
                    <Link to={`/category/${params.category}/${item.link}`}>
                        <Card className="hover:bg-gray-100 transition-colors cursor-pointer">
                            <CardBody >
                                <Typography variant="lead" color="blue-gray" className="">
                                    {item.name}
                                </Typography>
                            </CardBody>
                        </Card>
                    </Link>
                ))}
            </div>
        </>
    );
}

export default ProductCategories;
