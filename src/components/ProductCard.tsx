import { Carousel, IconButton } from "@material-tailwind/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as heartSelected, faHeart as heartUnselected, faChevronRight, faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesProvider";
import {LazyLoadImage} from "react-lazy-load-image-component";

interface ProductCardProps {
    Title: string;
    _id: string;
    Price: number;
    Images: string[];
}

const ProductCard: React.FC<ProductCardProps> = ({ Title, _id, Price, Images }) => {
    const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
    const [loadedImages, setLoadedImages] = useState<boolean[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>(Images);

    useEffect(() => {
        setImageUrls(Images);
    }, [Images]);

    const handleImageLoaded = useCallback((index: number) => {
        setLoadedImages(prevState => {
            const newState = [...prevState];
            newState[index] = true;
            return newState;
        });
    }, []);

    const handleImageError = useCallback((index: number) => {
        setImageUrls(prevUrls => prevUrls.filter((_, idx) => idx !== index));
    }, []);

    const changeFavorite = () => {
        if (isFavorite(_id)) {
            removeFromFavorites(_id);
        } else {
            addToFavorites(_id);
        }
    };

    return (
        <div className="card-container h-auto w-[177.5px] lg:w-fit select-none">
            <div className="card-container--content flex flex-col grow justify-start justify-items-start items-start">
                <div className="card-container__img flex-1">
                    <div className="w-44 h-44 lg:w-60 lg:h-60 overflow-hidden rounded-none overscroll-auto">
                        <Carousel
                            className="group rounded-none overflow-hidden"
                            prevArrow={({ handlePrev }) => (
                                <IconButton
                                    variant="text"
                                    color="white"
                                    size="lg"
                                    onClick={handlePrev}
                                    className="!absolute mix-blend-difference top-2/4 left-4 -translate-y-2/4 transition duration-150 ease-in-out opacity-0 group-hover:opacity-100 rounded-full"
                                >
                                    <FontAwesomeIcon icon={faChevronLeft} fontSize="20" />
                                </IconButton>
                            )}
                            nextArrow={({ handleNext }) => (
                                <IconButton
                                    variant="text"
                                    color="white"
                                    size="lg"
                                    onClick={handleNext}
                                    className="!absolute mix-blend-difference top-2/4 !right-4 -translate-y-2/4 transition duration-150 ease-in-out opacity-0 group-hover:opacity-100 rounded-full"
                                >
                                    <FontAwesomeIcon icon={faChevronRight} fontSize="20" />
                                </IconButton>
                            )}
                            navigation={({ setActiveIndex, activeIndex, length }) => (
                                <div className="absolute bottom-4 left-2/4 z-50 flex -translate-x-2/4 gap-2">
                                    {new Array(length).fill("").map((_, i) => (
                                        <span
                                            key={i}
                                            className={`opacity-0 lg:opacity-0 group-hover:opacity-100 block h-1 cursor-pointer rounded-2xl transition-all content-[''] ${
                                                activeIndex === i ? "w-8 bg-white" : "w-4 bg-white/50"
                                            }`}
                                            onClick={() => setActiveIndex(i)}
                                        />
                                    ))}
                                </div>
                            )}
                        >
                            {imageUrls.map((image, index) => (
                                <Link key={index} to={`/product/${_id}`}>
                                    <LazyLoadImage src={`${image}?size=240x240`}
                                                   loading="lazy"
                                                   alt="Image Alt"
                                                   placeholderSrc={`${image}?size=50x50`}
                                    />
                                </Link>
                            ))}
                        </Carousel>
                    </div>
                </div>
                <div className="card-container__price-block flex-1 grow w-44 lg:w-60 mt-2">
                    <div className="card-container__price-block-group flex">
                        <div className="card-container__price grow lg:text-xl">
                            <span>
                                <Link to={`/product/${_id}`}>{Price} ₽</Link>
                            </span>
                        </div>
                        <div
                            className={`card-container__favorite_btn flex-1 text-right cursor-pointer transition-color ease-linear duration-150 ${
                                isFavorite(_id) ? "text-[#FF7272]" : ""
                            }`}
                            onClick={changeFavorite}
                        >
                            <FontAwesomeIcon
                                icon={isFavorite(_id) ? heartSelected : heartUnselected}
                                fontSize="20"
                            />
                        </div>
                    </div>
                </div>
                <div className="card-container__name w-[11.5rem] text-left mb-auto mt-0.5 uppercase text-balance lg:text-base">
                    <Link to={`/product/${_id}`}>{Title}</Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
