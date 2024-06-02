import React, {Suspense, useEffect, useState} from "react";
import {Spinner} from "@material-tailwind/react";
import axios from "axios";
import ProductCard from "../ProductCard";
import {useParams} from "react-router-dom";
import LazyLoad from "react-lazyload";
import ProductCardLazy from "../Lazy/LazyProductCard";


interface Collection {
    _id: string;
    name: string;
    link: string;
    items: Product[];
    createdBy: string;
    description: string;
}

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

const ProductCollections = () => {
    const params = useParams()
    const [loading, setLoading] = useState<boolean>(true);
    const [collection, setCollection] = useState<Collection | null>(null);
    useEffect(() => {
        const fetchCollection = async () => {
            setLoading(true);
            try {
                const response = await axios.get<Collection>(`https://api.orochirage.ru/api/collections/${params.collection}`, { timeout: 10000 });
                setCollection(response.data);
            } catch (error) {
                console.error('Error fetching collection:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchCollection();
    }, [params.collection]);


    if(loading)
    {
        return (
            <>
                <div className="flex items-center justify-center h-[calc(100vh-30rem)] w-full"><Spinner className="h-12 w-12" /></div>
            </>
        )
    }

    const SuspenceFallBack = () => {
        return(
            <div className="product-list flex flex-row flex-wrap justify-center lg:gap-x-[1.887rem] gap-x-4 gap-y-6 w-full lg:justify-start lg:px-8 pb-8">
                {[...Array(10)].map((_, index) => (
                    <ProductCardLazy/>
                ))}
            </div>
        )
    }

    if(!collection || !params.collection)
        return (
            <>
                <div className="flex flex-col gap-2 items-center justify-center h-[calc(100vh-30rem)] w-full text-2xl">
                    <div className="text-4xl font-semibold">Ошибка 404</div>
                    <div className="text-lg">Мы не смогли найти такую коллекцию, возможно она больше не доступна.</div>
                </div>
            </>
        )

    console.log(`items lenght: ${collection.items.length}`)

    return (
        <>
            <div className="products-collection p-8">
                <div className="products-collection__header flex flex-col gap-2">
                    <div className="products-collection__title text-xl">
                        Коллекция <span className="font-semibold uppercase">{collection.name}</span>
                    </div>
                    <div className="products-collection__description opacity-75">
                        {collection.description}
                    </div>
                </div>
            </div>
            <div className={`product-collection__items mt-2 ${collection.items.length === 1 ? 'px-8' : 'px-[1.30rem]'}`}>
                <LazyLoad height={300} offset={100} className="product-list flex flex-row flex-wrap justify-center lg:gap-x-[1.887rem] gap-x-4 gap-y-6 lg:gap-x-[4.25rem] w-full lg:justify-start">
                    <Suspense fallback={<SuspenceFallBack/>}>
                    {collection.items.length === 0 ? (
                        <div className="text-gray-500 h-[14.6rem] flex flex-col">
                            <div className="text-center text-lg text-wrap">Эта коллекция пока что пустая</div>
                        </div>
                    ) : (
                        collection.items.map(item => (
                            <ProductCard
                                key={item._id}
                                Title={item.Title}
                                _id={item._id}
                                Price={item.Price}
                                Images={item.Images}
                            />
                        ))
                    )}
                    </Suspense>
                </LazyLoad>
            </div>
        </>
    )
}

export default ProductCollections;