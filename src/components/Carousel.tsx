import React, {useEffect, useState, Suspense} from 'react';
import {Button, Carousel, IconButton, Typography} from "@material-tailwind/react";
import { ThemeProvider } from "@material-tailwind/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faChevronLeft, faChevronRight} from '@fortawesome/free-solid-svg-icons'
import axios from "axios";
import { Link } from 'react-router-dom';
import LazyLoad from "react-lazyload";
import {LazyLoadImage} from "react-lazy-load-image-component";
import {MobileView, BrowserView} from 'react-device-detect'
const theme = {
    carousel: {
        styles: {
            base: {
                carousel: {
                    width: 'w-full',
                    height: 'h-full',
                    overflowX: 'overflow-x-hidden',
                    overflowY: 'overflow-y-hidden',
                    display: 'flex',
                },
            },
        },
    },
};

interface CarouselItem {
    _id: string;
    name: string;
    link: string;
    card_img: string;
    carousel_img: string;
    description: string;
}

const CarouselComponent = () => {
    const [carouselItems, setCarouselItems] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('https://api.orochirage.ru/api/collections', { timeout: 10000 });
                const filteredItems = response.data.filter((item: CarouselItem) => item.carousel_img && item.carousel_img !== '');
                setCarouselItems(filteredItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchProducts();
    }, []);

    return (
        <LazyLoad unmountIfInvisible={true} offset={150}>
            <Suspense fallback={(
                <>
                    Loading....
                </>
            )}>
                <div className="h-72 tw-flex-grow tw-min-h-0 scroll-smooth relative">
                    <ThemeProvider value={theme}>
                        <Carousel
                            className="group"
                            prevArrow={({ loop, handlePrev, firstIndex }) => (
                                <IconButton
                                    variant="text"
                                    color="white"
                                    size="lg"
                                    onClick={handlePrev}
                                    className={`mix-blend-difference !absolute top-2/4 left-4 -translate-y-2/4 transition duration-150 ease-in-out opacity-0 group-hover:opacity-100 rounded-full ${!loop && firstIndex ? 'hidden' : 'visible'}`}
                                >
                                    <FontAwesomeIcon icon={faChevronLeft} fontSize="20" />
                                </IconButton>
                            )}
                            nextArrow={({ loop, handleNext, lastIndex }) => (
                                <IconButton
                                    variant="text"
                                    color="white"
                                    size="lg"
                                    onClick={handleNext}
                                    disabled={!loop && lastIndex}
                                    className={`z-[999] mix-blend-difference !absolute top-2/4 !right-4 -translate-y-2/4 transition duration-150 ease-in-out opacity-0 group-hover:opacity-100 rounded-full ${!loop && lastIndex ? 'hidden' : 'visible'}`}
                                >
                                    <FontAwesomeIcon icon={faChevronRight} fontSize="20" />
                                </IconButton>
                            )}
                        >
                            {carouselItems.map((item, index) => (
                                <CarouselItem key={index} item={item} />
                            ))}
                        </Carousel>
                    </ThemeProvider>
                </div>
            </Suspense>
        </LazyLoad>
    );
};

const SuspenseFallback = () => {
    return (
        <div className="h-72 tw-flex-grow tw-min-h-0 scroll-smooth">
            <ThemeProvider value={theme}>
                <Carousel className="group">
                        <div className="relative w-full h-full" key={"indexkkk_rpleload_fk8n"}>
                            <div className="h-full w-full absolute z-[2]">
                                <div className="flex-1 pb-10 grow animate-pulse">
                                    <div className="flex-1 carousel__title lg:font-size-96 text-left indent-0">
                                        <Typography as="div" variant="h1" className="mb-4 h-3 w-56 rounded-full bg-gray-400">
                                            &nbsp;
                                        </Typography>
                                    </div>
                                    <div className="flex-1 carousel__subtitle text-left text-wrap break-words hyphens-auto">
                                        <Typography as="div" variant="paragraph" className="mb-2 h-2 w-[48rem] rounded-full bg-gray-400">
                                            &nbsp;
                                        </Typography>
                                        <Typography as="div" variant="paragraph" className="mb-2 h-2 w-[48rem] rounded-full bg-gray-400">
                                            &nbsp;
                                        </Typography>
                                    </div>
                                </div>
                                <div className="flex-1 mb-auto mt-auto">
                                    <div className="!w-full lg:!w-64 text-center inline-flex items-center">
                                        <Button disabled tabIndex={-1} className="h-8 w-32 bg-gray-400 shadow-none hover:shadow-none">&nbsp;</Button>
                                    </div>
                                </div>
                            </div>
                            <div className="z-[1] container-img">
                                <div className="bg-gray-300 w-full h-full absolute flex justify-center animate-pulse">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-12 w-12 text-gray-500">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                </Carousel>
            </ThemeProvider>
        </div>
    );
};

const CarouselItem: React.FC<{ item: CarouselItem }> = ({ item }) => {
    return (
        <div className="relative bg-white w-full h-full">
            <div className="relative w-full h-full">
                <div
                    className="h-full w-full collection-info absolute z-[2] uppercase flex flex-col px-12 py-8 lg:px-14">
                    <div className="item-info flex flex-col justify-center h-full gap-2">
                        <div className="item-info__title text-4xl font-inter font-black">{item.name}</div>
                        <div
                            className="item-info__description font-inter font-bold text-sm w-full lg:w-[40%] relative z-10 opacity-100">
                            {item.description}
                        </div>
                    </div>
                    <Link to={`/collection/${item.link}`}
                          className="item-info__controls bg-black font-inter font-semibold text-sm text-white mb-2 flex flex-row justify-center items-center uppercase p-2 rounded-full gap-1 w-full lg:w-[25%] lg:text-md lg:p-3 hover:bg-[#303030] transition-colors">
                        Посмотреть коллекцию
                        <FontAwesomeIcon className="h-[0.85rem] w-[0.85rem]" icon={faChevronRight}/>
                    </Link>
                </div>
                <MobileView className="absolute w-full h-full">
                    <LazyLoadImage
                        loading="lazy"
                        src={`${item.carousel_img}?size=450x300`}
                        placeholder={
                            <div className="bg-gray-300 w-full h-full absolute flex justify-center animate-pulse">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2}
                                     stroke="currentColor" className="h-12 w-12 text-gray-500 self-center">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/>
                                </svg>
                            </div>
                        }
                        className="absolute w-full h-full object-cover lg:object-cover"
                        alt={`Фотография для коллекции ${item.name}`}
                    />
                </MobileView>
                <BrowserView className="absolute w-full h-full">
                    <LazyLoadImage
                        loading="lazy"
                        src={`${item.carousel_img}?size=1910x300`}
                        placeholder={
                            <div className="bg-gray-300 w-full h-full absolute flex justify-center animate-pulse">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2}
                                     stroke="currentColor" className="h-12 w-12 text-gray-500 self-center">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/>
                                </svg>
                            </div>
                        }
                        className="absolute w-full h-full object-cover lg:object-cover"
                        alt={`Фотография для коллекции ${item.name}`}
                    />
                </BrowserView>
                <div
                    className="absolute inset-0 bg-gradient-to-t from-white via-5% to-transparent opacity-100 lg:opacity-50 z-[1]"></div>
            </div>
        </div>
    );
};

export default CarouselComponent;