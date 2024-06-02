import React, { useEffect, useState } from 'react';
import { Carousel, IconButton, Spinner, Collapse, Card } from "@material-tailwind/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faChevronDown, faChevronLeft, faChevronRight, faHeart as heartSelected } from "@fortawesome/free-solid-svg-icons";
import { faHeart as heartUnselected } from "@fortawesome/free-regular-svg-icons";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../context/CartProvider";
import { Helmet } from 'react-helmet';
import { useFavorites } from "../../context/FavoritesProvider";
import { useMediaQuery } from 'usehooks-ts';
import { LazyLoadImage } from "react-lazy-load-image-component";

interface Product {
    Title: string;
    _id: string;
    Price: number;
    Images: string[];
    Colors: string[];
    Sizes: string[];
    Tags: {
        name: string;
        value: string;
    }[];
    collection: {
        name: string;
        link: string;
        description: string;
    }
}

export const ProductPage = () => {
    const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [isFavoriteState, setIsFavoriteState] = useState(false);
    const { cartItems, addToCart, removeFromCart, updateQuantity } = useCart();
    const [isLoading, setIsLoading] = useState(true);

    const [quantity, setQuantity] = useState(1);

    const [open, setOpen] = useState(false);
    const [selectedColor, selectColor] = useState(0);
    const [selectedSize, selectSize] = useState(0);

    const isLargeScreen = useMediaQuery('(min-width: 1024px)');

    const navigate = useNavigate();

    const handleGoBack = () => navigate(-1);

    const handleAddToCart = async () => {
        if (!product) return;
        const newItem = { _id: product._id, Size: product.Sizes[selectedSize], Color: product.Colors[selectedColor], Quantity: 1 };
        await addToCart(newItem);
    };

    const incrementQuantity = () => {
        const item = getCartItem();
        if (item) {
            updateQuantity(item._id, item.Color, item.Size, item.Quantity + 1);
        }
    };

    const decrementQuantity = () => {
        const item = getCartItem();
        if (item && item.Quantity > 1) {
            updateQuantity(item._id, item.Color, item.Size, item.Quantity - 1);
        }
    };

    const getCartItem = () => {
        if (!product) return null;
        return cartItems.find(item => item._id === product._id && item.Color === product.Colors[selectedColor] && item.Size === product.Sizes[selectedSize]);
    };

    const sizeSelect = (index: number, value: string, event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        selectSize(index);
        setQuantity(1);
    };

    const colorSelect = (index: number, value: string, event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        selectColor(index);
        setQuantity(1);
    };

    const changeFavorite = () => {
        if (product) {
            if (isFavoriteState) {
                removeFromFavorites(product._id);
            } else {
                addToFavorites(product._id);
            }
            setIsFavoriteState(!isFavoriteState);
        }
    };

    const toggleOpen = () => setOpen((cur) => !cur);

    useEffect(() => {
        if (isLargeScreen) {
            console.log("large screen detected");
            setOpen(true);
        }
    }, [isLargeScreen]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get<Product>(`https://api.orochirage.ru/api/products/${params.id}`, {
                    timeout: 10000,
                    timeoutErrorMessage: "Истекло время запроса к серверу.",
                });
                setProduct(response.data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [params.id]);

    useEffect(() => {
        if (product) {
            setIsFavoriteState(isFavorite(product._id));
        }
    }, [product, isFavorite]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-30rem)] w-full">
                <Spinner className="h-12 w-12" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col gap-2 w-dvw justify-center items-center h-[40dvh] p-8">
                <div className="caption text-3xl font-inter font-semibold uppercase">
                    Товар не найден
                </div>
                <div className="items-center text-center opacity-70">
                    К сожалению, мы не смогли найти товар, который вы пытаетесь найти. Попробуйте найти его по названию.
                </div>
            </div>
        );
    }

    const cartItem = getCartItem();

    return (
        <>
            <Helmet>
                <title>{product ? (`OROCHI - ${product.Title}`) : "OROCHI - Товар не найден"}</title>
            </Helmet>
            <div className="product_details lg:grid lg:grid-cols-2 lg:gap-8 text-left">
                <div className="product_details__images lg:col-span-1">
                    <div
                        className="product_details__close_btn flex flex-row gap-0.5 items-center uppercase font-bold w-full justify-start pl-7 cursor-pointer"
                        onClick={handleGoBack}
                    >
                        <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
                        <p>Назад</p>
                    </div>
                    <Carousel className="rounded-none h-[33.5rem] lg:h-[86vh] group overflow-hidden"
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
                    >
                        {product.Images.map((image, index) => (
                            <LazyLoadImage src={`${image}`}
                                           loading="lazy"
                                           className="h-full w-full object-scale-down overflow-hidden"
                                           alt={`Фотография товара ${index + 1}`}
                                           wrapperClassName="h-full w-full overflow-hidden"
                                           placeholderSrc={`${image}?size=50x50`}
                            />
                        ))}
                    </Carousel>
                </div>
                <div className="product_details__description ml-5 mt-5 mr-5 lg:mr-0 lg:ml-0 lg:col-span-1 flex flex-col grow select-none lg:pr-7">
                    <div className="product_details__description_title flex flex-row w-full justify-between lg:items-center">
                        <div className="flex-1 product_details__item-title">{product.Title}</div>
                        <div
                            className={`text-right transition-color ease-linear duration-150 flex-1 product_details__favorite-btn ${isFavoriteState && 'text-[#FF7272]'}`}
                        >
                            <FontAwesomeIcon
                                icon={isFavoriteState ? heartSelected : heartUnselected}
                                fontSize="28"
                                className="cursor-pointer"
                                onClick={changeFavorite}
                            />
                        </div>
                    </div>
                    <div className="product_details__description_price">
                        {product.Price}
                    </div>
                    <div className="product_details__description_colors mt-2">
                        <div className="color_selector flex flex-row gap-3 items-center">
                            {product.Colors.map((color, index) => (
                                color === "white" ?
                                    <a href="#" key={index}
                                       className={`transition-colors duration-300 ease-out color_selector__item border-collapse ${index === selectedColor ? 'active' : ''}`}
                                       style={{ backgroundColor: color }}
                                       onClick={(e) => colorSelect(index, color, e)}></a> :
                                    <a href="#" key={index}
                                       className={`transition-colors duration-300 ease-out color_selector__item ${index === selectedColor ? 'active' : ''}`}
                                       style={{ backgroundColor: color }}
                                       onClick={(e) => colorSelect(index, color, e)}></a>
                            ))}
                        </div>
                    </div>
                    <div className="product_details__description_size mt-3 lg:mt-6">
                        <div className="size_selector flex flex-row gap-2">
                            {product.Sizes.map((size, index) => (
                                <a href="#" key={index}
                                   className={`transition-colors duration-300 ease-out size_selector__item ${index === selectedSize ? 'active' : ''}`}
                                   onClick={(e) => sizeSelect(index, size, e)}>{size}</a>
                            ))}
                        </div>
                    </div>
                    <div className="product_details__description_item_info mt-5 mb-2 w-full">
                        <a className="collapse_open_btn mb-3 transition-transform flex flex-row justify-between lg:hidden"
                           onClick={toggleOpen}>
                            <div className="flex flex-row w-full justify-between">
                                <div className="w-fit">Открыть описание</div>
                                <div className="w-fit">
                                    <FontAwesomeIcon
                                        className={`transition-transform ${open === true ? "rotate-180" : ""}`}
                                        icon={faChevronDown} strokeWidth={2.5} />
                                </div>
                            </div>
                        </a>
                        <Collapse open={open} className="shadow-none">
                            <Card className="w-full h-fit border-collapse lg:border-none lg:bg-transparent">
                                <div className="collapse_items__description pl-4 pt-4 pr-4 lg:pl-0">
                                    Описание
                                </div>
                                <div className="collapse_items flex flex-col w-full p-4 gap-2 lg:pl-0">
                                    {product.Tags && product.Tags.map((tag, index) => (
                                        tag.value !== '##' && (
                                            <div className="collapse_items__item flex w-full items-center" key={index}>
                                                <div
                                                    className="collapse_items__item_label text-black !font-inter">{tag.name}:
                                                </div>
                                                <div
                                                    className="flex-grow mx-2 border-b border-dotted border-black opacity-15"></div>
                                                <div
                                                    className="collapse_items__item_value text-black font-medium !font-inter">{tag.value}</div>
                                            </div>

                                        )
                                    ))}
                                    {product.collection && (
                                        <div
                                            className="collapse_items__item flex flex-row w-full justify-between items-center">
                                            <div className="collapse_items__item_label text-black">Коллекция:</div>
                                            <div className="flex-grow mx-2 relative">
                                                <div
                                                    className="border-t border-dotted border-black absolute inset-0 opacity-15"></div>
                                            </div>
                                            <div className="collapse_items__item_value text-black">
                                                <Link
                                                    className="!font-inter font-bold underline underline-offset-4"
                                                    to={`/collection/${product.collection.link}`}
                                                >
                                                    {product.collection.name}
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </Collapse>
                    </div>
                    <div className={`product_details__description_cart_btn ${cartItem ? "mb-16" : "mb-16"} mt-auto`}>
                        <div className="flex flex-col lg:flex-row items-center w-full gap-4">
                            <Link to={cartItem ? "/cart" : ""} className="w-full grow">
                                <button onClick={cartItem ? () => {} : handleAddToCart}
                                        className={`transition flex max-h-[4rem] flex-col justify-center items-center ease-in-out cart_add_btn uppercase ${cartItem ? "!bg-[#3E8233] hover:!bg-[#4ea141]" : "hover:bg-[#2f2f2f]"}`}>
                                    {cartItem ? (
                                        <div className="btn_text--container flex flex-col justify-center items-center">
                                            <div className="btn_text--header">
                                                В корзине
                                            </div>
                                            <div className="btn_text--footer muted">
                                                Перейти
                                            </div>
                                        </div>
                                    ) : "Добавить в корзину"}
                                </button>
                            </Link>
                            {cartItem && (
                                <div className="flex items-center">
                                    <button onClick={decrementQuantity} className="counter_btn">
                                        <span className="text-lg font-bold">-</span>
                                    </button>
                                    <span className="mx-2 w-[16px] max-w-[16px] text-center">{cartItem.Quantity}</span>
                                    <button onClick={incrementQuantity} className="counter_btn">
                                        <span className="text-lg font-bold">+</span>
                                    </button>
                                </div>
                            )}
                            <a target="_blank" href="https://t.me/orochi_otpravki"
                               className="w-full lg:max-w-64 max-w-full" rel="noreferrer">
                                <button
                                    className={`transition ease-in-out ask-support__btn uppercase hover:!bg-black hover:!text-white`}>
                                    Есть вопросы?
                                </button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductPage;
