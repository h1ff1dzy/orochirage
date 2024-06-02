import React, {Suspense} from 'react';
import FilterDrawer from "../Admin Panel/Filter/FilterDrawer";
import {Helmet} from "react-helmet";
import LazyLoad from "react-lazyload";
import { Spinner } from '@material-tailwind/react';
import {Footer} from "../Footer"
import CardSlider from "../CardPanel"
import ProductList from "../ProductList";
import CarouselComponent from "../Carousel";


export const MainPage = () => {
    return (
        <>
            <Helmet>
                <title>OROCHI - Главная страница</title>
            </Helmet>
            <CarouselComponent/>
            <div className="block-title py-4 px-8 text-base lg:text-lg uppercase font-semibold font-inter">Коллекции</div>
            <CardSlider/>
            <div className="block-title py-4 px-8 text-base lg:text-lg uppercase font-semibold font-inter">Каталог</div>
            <ProductList/>
            <LazyLoad offset={100} unmountIfInvisible={true}>
                <Suspense fallback={(
                    <div className="w-full h-full flex flex-row justify-center items-center">
                        <Spinner className="h-6 w-6" />
                    </div>
                )}/>
                <Footer/>
            </LazyLoad>
        </>
    )
}

export default MainPage;
