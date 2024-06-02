import React, {Suspense, useEffect, useState} from "react";
import {CardItem, CardItemLazy} from "./CardCollection";
import axios from "axios";
import LazyLoad from "react-lazyload";
import ProductCardLazy from "./Lazy/LazyProductCard";
import {Spinner} from "@material-tailwind/react";

const CardSlider = () =>{
    interface CarouselItem {
        _id: string;
        name: string;
        link: string;
        card_img: string;
        carousel_img: string;
        description: string;
    }

    const [isLoading, setLoading] = React.useState(true);
    const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            axios.get<CarouselItem[]>('https://api.orochirage.ru/api/collections', { timeout: 10000 })
                .then(response => {
                    // Фильтрация элементов
                    const filteredItems = response.data.filter(item =>
                        item.card_img && item.card_img !== ""
                    );
                    setCarouselItems(filteredItems);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    setLoading(false);
                });
        }
        fetchProducts();
    }, []);

    if(isLoading)
        return (
            <>
                <div className="flex flex-row h-fit overflow-x-auto px-6 gap-4 lg:justify-between lg:overflow-x-hidden snap-x">
                    {[...Array(6)].map((_, index) => (
                        <CardItemLazy/>
                    ))}
                </div>
            </>
        )

    const LazyList = () => {
        return (
            <>
                <div className="flex flex-row h-fit overflow-x-auto px-6 gap-4 lg:justify-between lg:overflow-x-hidden snap-x">
                    {[...Array(6)].map((_, index) => (
                        <CardItemLazy/>
                    ))}
                </div>
            </>
        )
    }

    return (
        <LazyLoad className="flex flex-row h-fit overflow-x-auto px-6 gap-4 lg:justify-between lg:overflow-x-hidden snap-x" offset={150}>
            <Suspense fallback={<LazyList/>}>
            {carouselItems.map((item, index) => (
                        <CardItem
                            card_img={item.card_img}
                            _id={item._id}
                            name={item.name}
                            link={item.link}
                            index={index}
                            description={item.description}/>

            ))}
            </Suspense>
        </LazyLoad>
    );
}

export default CardSlider;