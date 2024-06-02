import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faPen } from "@fortawesome/free-solid-svg-icons";
import CartItem from "./CartItem";
import { Footer } from "../Footer";
import { useCart } from "../../context/CartProvider";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { checkTokenValidity } from "../../slicers/userSlice";
import { Link } from "react-router-dom";
import axios from "axios";
import {
    Alert,
    Button,
    Chip,
    Dialog,
    DialogBody,
    DialogFooter,
    DialogHeader,
    Input,
    Radio,
    Typography,
    Spinner
} from "@material-tailwind/react";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";
import numeral from "numeral";

const CartPage = () => {
    const { cartItems, removeFromCart, setCartItems } = useCart();
    const token = useSelector((state: RootState) => state.user.token);
    const tokenValid = useSelector((state: RootState) => state.user.tokenValid);
    const [productDetails, setProductDetails] = useState<any[]>([]);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [unroundPosition, setUnroundPosition] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const dispatch: AppDispatch = useDispatch();

    interface Promo {
        discount: number;
        phrase: string;
    }

    const [promoOpened, setPromoOpened] = useState(false);

    const [promoCode, setPromoCode] = useState<string>('');
    const [promoApplied, setPromoApplied] = useState(false);
    const [promoError, setPromoError] = useState(false);

    const [promoDetails, setPromoDetails] = useState<Promo | null>(null);

    const [deliveryDetails, setDeliveryDetails] = useState({
        deliveryType: 0,
        deliveryAddress: 0,
    });

    const user = useSelector((state: RootState) => state.user.user);

    const [isLoading, setIsLoading] = useState(true);

    const isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone/i.test(navigator.userAgent);

    const [deliveryPage, setDeliveryPage] = useState(1);

    useEffect(() => {
        if (token) {
            dispatch(checkTokenValidity());
        }
    }, [token]);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const response = await axios.post('https://api.orochirage.ru/api/products/details', {
                    items: cartItems
                });
                setProductDetails(response.data);
                setIsLoading(false);
            } catch (error) {
                console.error('Ошибка получения данных о товарах:', error);
                setIsLoading(false);
            }
        };

        if (cartItems.length > 0) {
            fetchProductDetails();
        } else {
            setProductDetails([]);
            setIsLoading(false);
        }
    }, [cartItems]);

    useEffect(() => {
        const handleScroll = () => {
            setScrollPosition(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            const lastCartItem = document.querySelector(".cartItem:nth-last-of-type(2)");
            if (lastCartItem) {
                const { y } = lastCartItem.getBoundingClientRect();
                setUnroundPosition(y);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [cartItems]);

    const getBorderRadius = () => {
        const maxScrollPosition = unroundPosition;
        const maxBorderRadius = 32;
        const minBorderRadius = 0;
        const slope = (maxBorderRadius - minBorderRadius) / maxScrollPosition;

        if (scrollPosition <= maxScrollPosition) {
            return maxBorderRadius - slope * scrollPosition;
        } else {
            return minBorderRadius;
        }
    };

    const handleQuantityChange = async (id: string, color: string, size: string, newQuantity: number) => {
        if (token) {
            try {
                await axios.post('https://api.orochirage.ru/api/user/cart/update', {
                    item: { _id: id, Color: color, Size: size, Quantity: newQuantity },
                }, {
                    headers: {
                        Authorization: `${token}`,
                    },
                });
                setCartItems(prevItems =>
                    prevItems.map(item =>
                        item._id === id && item.Color === color && item.Size === size
                            ? { ...item, Quantity: newQuantity }
                            : item
                    )
                );
            } catch (error) {
                console.error('Ошибка при обновлении количества товара:', error);
            }
        } else {
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item._id === id && item.Color === color && item.Size === size
                        ? { ...item, Quantity: newQuantity }
                        : item
                )
            );
        }
    };

    const handleRemoveItem = async (id: string, color: string, size: string) => {
        if (token) {
            try {
                await axios.post('https://api.orochirage.ru/api/user/cart/remove', {
                    item: { _id: id, Color: color, Size: size },
                }, {
                    headers: {
                        Authorization: `${token}`,
                    },
                });
                removeFromCart(id, color, size);
            } catch (error) {
                console.error('Ошибка при удалении товара из корзины:', error);
            }
        } else {
            removeFromCart(id, color, size);
        }
    };

    const handleNextDeliveryPage = () => {
        if (deliveryPage < 3) {
            setDeliveryPage(deliveryPage + 1);
        }
    };

    const handlePreviousDeliveryPage = () => {
        if (deliveryPage > 1) {
            setDeliveryPage(deliveryPage - 1);
        }
    };

    const totalItems = cartItems.reduce((total, item) => total + item.Quantity, 0);

    const handleDeliveryTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDeliveryDetails({
            ...deliveryDetails,
            deliveryType: parseInt(event.target.value)
        });
    };

    const handleDeliveryAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDeliveryDetails({
            ...deliveryDetails,
            deliveryAddress: parseInt(event.target.value)
        });
    };

    useEffect(() => {
        let total = 0;
        productDetails.forEach(product => {
            const cartItem = cartItems.find(item => item._id === product._id && item.Color === product.Color && item.Size === product.Size);
            if (cartItem) {
                total += product.Price * cartItem.Quantity;
            }
        });
        setTotalPrice(total);
    }, [productDetails, cartItems]);

    const handlePromoCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPromoCode(value.toUpperCase());
    };

    const handleApplyPromo = async () => {
        try {
            const response = await axios.get(`https://api.orochirage.ru/api/promo/${promoCode}`, { timeout: 10000 });
            if (response.status !== 200) {
                setPromoError(true);
            } else {
                if (response.data.uses <= 0) {
                    setPromoError(true);
                    return;
                }
                setPromoDetails(response.data);
                setPromoOpened(false);
                setPromoError(false);
                toast.success("Промокод успешно применен, скидка будет рассчитана при оплате");
                setPromoApplied(true);
            }
        } catch (e) {
            setPromoError(true);
        }
    };

    const calculateDiscountedPrice = (totalPrice: number, percentage: number): number => {
        if (totalPrice === undefined) return totalPrice;
        const decimalPercentage = percentage / 100;
        const discountedPrice = totalPrice * (1 - decimalPercentage);
        const roundedPrice = Math.max(discountedPrice, 0);
        return +roundedPrice.toFixed(3);
    };

    async function sendPayment() {
        try {
            const response = await axios.post(`https://api.orochirage.ru/api/payment/create`, {
                items: cartItems,
                promo: promoDetails,
                user: {
                    Phone: user?.Phone,
                    Email: user?.Email,
                    Id: user?._id,
                    delivery: deliveryDetails.deliveryType === 0 ? "PochtaRF" : "CDEK",
                    address: user?.Address[deliveryDetails.deliveryAddress],
                }
            }, { timeout: 10000 });

            if (response.status !== 200) {
                return toast.error("Невозможно произвести оплату, обратитесь в поддержку.");
            }

            handleOpenDeliveryDialog();
            toast.success("Ссылка на оплату была сформирована, сейчас Вы будете перенаправлены...", {
                autoClose: 1500,
                onClose: () => {
                    if (isMobileDevice) {
                        window.location.href = response.data.paymentUrl;
                    } else {
                        window.open(response.data.paymentUrl, '_blank');
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching collection:', error);
        }
    }

    const [selectDeliveryDialog, setSelectDeliveryDialog] = useState(false);

    const handleOpenDeliveryDialog = () => setSelectDeliveryDialog(!selectDeliveryDialog);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner className="h-12 w-12" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>OROCHI - Корзина</title>
            </Helmet>
            {user && tokenValid &&
                <Dialog open={selectDeliveryDialog} handler={handleOpenDeliveryDialog}>
                    <DialogHeader>
                        Выбор способа доставки
                    </DialogHeader>
                    <DialogBody>
                        {deliveryPage === 1 && (
                            <div className="flex flex-col gap-4">
                                <Radio
                                    crossOrigin
                                    checked={deliveryDetails.deliveryType === 0}
                                    onChange={handleDeliveryTypeChange}
                                    name="description"
                                    value={0}
                                    disabled={user.Address.length <= 0}
                                    label={
                                        <div>
                                            <Typography color="blue-gray" className="font-semibold">
                                                <div className="flex flex-row gap-2 items-center">
                                                    <div className="title">
                                                        Почта РФ
                                                    </div>
                                                    <div className="icon">
                                                        <Chip value="350 ₽" />
                                                    </div>
                                                </div>
                                            </Typography>
                                            <Typography variant="small" color="gray" className="font-normal">
                                                Доставка в среднем займет от 3 дней.
                                            </Typography>
                                        </div>
                                    }
                                    containerProps={{
                                        className: "-mt-5",
                                    }}
                                />
                                <Radio
                                    crossOrigin
                                    value={1}
                                    name="description"
                                    checked={deliveryDetails.deliveryType === 1}
                                    onChange={handleDeliveryTypeChange}
                                    disabled={user.Address.length <= 0}
                                    label={
                                        <div>
                                            <Typography color="blue-gray" className="font-semibold">
                                                <div className="flex flex-row gap-2 items-center">
                                                    <div className="title">
                                                        Доставка СДЭК
                                                    </div>
                                                    <div className="icon">
                                                        <Chip value="350 ₽" />
                                                    </div>
                                                </div>
                                            </Typography>
                                            <Typography variant="small" color="gray" className="font-normal">
                                                Доставка займет в среднем от 7 дней.
                                            </Typography>
                                        </div>
                                    }
                                    containerProps={{
                                        className: "-mt-5",
                                    }}
                                />
                                {user.Address.length <= 0 && (
                                    <Alert className="!bg-[#8b9097]">
                                        Для продолжения, вам необходимо создать адрес для доставки в <Link className="underline underline-offset-4" to="/user/">личном кабинете.</Link>
                                    </Alert>
                                )}
                            </div>
                        )}
                        {deliveryPage === 2 && (
                            <>
                                {user["First name"] === "" || user["Second name"] === "" ? (
                                    <div className="text-base text-gray-600">
                                        Для продолждения, необходимо заполнить ФИО в <Link className="underline underline-offset-4 font-semibold" to="/user/">личном кабинете</Link>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2 text-base text-gray-600">
                                        <span className="pb-3">Теперь нужно выбрать адрес для доставки, ваши доступные адреса:</span>
                                        {user.Address.map((address, index) => (
                                            <Radio
                                                crossOrigin
                                                name="description"
                                                defaultChecked
                                                checked={deliveryDetails.deliveryAddress === index}
                                                onChange={handleDeliveryAddressChange}
                                                value={index}
                                                label={
                                                    <div>
                                                        <Typography color="blue-gray" className="font-semibold">
                                                            <div className="flex flex-row gap-2 items-center">
                                                                <div className="title">
                                                                    {address.name}
                                                                </div>
                                                            </div>
                                                        </Typography>
                                                        <Typography variant="small" color="gray" className="font-normal">
                                                            {address.Address}, индекс {address.Index}
                                                        </Typography>
                                                    </div>
                                                }
                                                containerProps={{
                                                    className: "-mt-5",
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                        {deliveryPage === 3 && (
                            <div className="flex flex-col gap-2 text-base text-gray-600">
                                <div className="block font-semibold flex-col">
                                    Доставим по адресу
                                    <span className="block font-normal">{user.Address[deliveryDetails.deliveryAddress].Address}</span>
                                </div>
                                <div className="block font-semibold flex-col">
                                    С помощью
                                    <span className="block font-normal">{deliveryDetails.deliveryType === 1 ? "СДЭК" : "Почты России"}</span>
                                </div>
                            </div>
                        )}
                    </DialogBody>
                    <DialogFooter>
                        <div className="flex flex-row gap-2">
                            <Button variant="text" color="red" onClick={handleOpenDeliveryDialog}>
                                <span>Отмена</span>
                            </Button>
                            {deliveryPage > 1 && (
                                <Button variant="gradient" color="blue-gray" onClick={handlePreviousDeliveryPage}>
                                    <span>Назад</span>
                                </Button>
                            )}
                            {deliveryPage <= 2 ? (
                                <Button
                                    disabled={deliveryPage === 1 && (user.Address.length <= 0 || user["First name"] === "" || user["Second name"] === "")}
                                    variant="gradient" color="gray" onClick={handleNextDeliveryPage}>
                                    <span>Далее</span>
                                </Button>
                            ) : (
                                <Button variant="gradient" color="green" onClick={sendPayment}>
                                    <span>Перейти к оплате</span>
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </Dialog>
            }
            <div className="pl-5 pr-5 pt-12 pb-12 flex flex-col grow gap-3 min-h-dvh h-fit">
                {cartItems.length === 0 ? (
                    <div className="text-gray-500 h-[14.6rem] flex flex-col items-center justify-center">
                        <div className="text text-lg">
                            <FontAwesomeIcon className="cursor-pointer transition-opacity opacity-40 hover:opacity-100" icon={faCartShopping} size="4x" strokeWidth={2.5} />
                        </div>
                        <div className="text text-2xl text-wrap mt-6 text-center">Ой-ой! Кажется ваша корзина пустует</div>
                    </div>
                ) : (
                    productDetails.map((product, index) => {
                        const cartItem = cartItems.find(item => item._id === product._id && item.Color === product.Color && item.Size === product.Size);
                        return cartItem ? (
                            <CartItem
                                key={`${product._id}-${product.Color}-${product.Size}`}
                                Title={product.Title}
                                _id={product._id}
                                Color={cartItem.Color}
                                Size={cartItem.Size}
                                Price={product.Price}
                                Quantity={cartItem.Quantity}
                                onRemove={handleRemoveItem}
                                onQuantityChange={handleQuantityChange}
                                className={index === productDetails.length - 1 ? "cartItem" : ""}
                            />
                        ) : null;
                    })
                )}
                <div style={{ position: scrollPosition >= unroundPosition - 300 ? 'static' : 'fixed', borderTopLeftRadius: `${getBorderRadius()}px`, borderTopRightRadius: `${getBorderRadius()}px` }} className={`transition-shadow ease-in-out cart_checkout--block bottom-0 left-0 w-full bg-white text-black py-4 z-[999] min-h-[17rem] border-collapse mt-auto ${scrollPosition >= unroundPosition - 300 ? "!rounded-t-lg!important mb-24" : "shadow-xl drop-shadow-xl mb-0"} ${totalItems === 0 ? 'hidden' : ''}`}>
                    <div className="cart_checkout--block-content flex flex-col pt-1 pl-8 pr-8 text-left">
                        <div className="cart_checkout--block-content_title">
                            Оформление <span className="underline underline-offset-4">доставки</span>
                        </div>
                        <div className={`cart_checkout--block-content_promo flex flex-row justify-between mt-2 content-center ${promoError ? "" : "items-center"} ${promoOpened && "gap-4"}`}>
                            {!promoOpened ? (
                                <>
                                    <div className="promo_text">
                                        {promoApplied ? (
                                            <>
                                                {promoCode} <span className="muted">скидка {promoDetails?.discount}%</span>
                                            </>
                                        ) : (
                                            <>
                                                промокод
                                            </>
                                        )}
                                    </div>
                                    <div className="promo_btn">
                                        <FontAwesomeIcon onClick={() => setPromoOpened(!promoOpened)} className="cursor-pointer transition-opacity opacity-100 border-collapse rounded-full p-[0.35em] hover:bg-[#E2E2E2]" icon={faPen} size="sm" strokeWidth={2.5} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="promo_text w-full">
                                        <Input crossOrigin value={promoCode} error={promoError} onChange={handlePromoCodeChange} label="Промокод" />
                                        {promoError && (
                                            <span className="text-red-500">Промокод несуществует, или больше не доступен.</span>
                                        )}
                                    </div>
                                    <div className="promo_btn">
                                        <Button onClick={handleApplyPromo} size="md">Применить</Button>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="cart_checkout--block-content_total flex flex-row justify-between mt-2 content-center items-center">
                            <div className="total-caption flex flex-col">
                                <div className="text-block">{totalItems} {totalItems === 1 ? 'товар' : totalItems <= 4 ? 'товара' : 'товаров'}</div>
                            </div>
                            <div className="text-block price_text after:!content-['']">
                                {numeral(totalPrice).format('0,0.00 $')}
                            </div>
                        </div>
                        <div className="cart_checkout--block-content_total flex flex-row justify-between content-center items-center">
                            <div className="total-caption flex flex-col">
                                <div className="text-block font-bold">
                                    <div className="flex flex-row gap-1">
                                        итого {promoApplied && <span className="text-gray-400">(со скидкой)</span>}
                                    </div>
                                </div>
                                <div className="text-block muted">без учета доставки</div>
                            </div>
                            <div className="text-block price_text after:!content-['']">
                                {numeral(calculateDiscountedPrice(totalPrice, promoDetails?.discount ?? 0)).format('0,0.00 $')}
                            </div>
                        </div>
                        <div className="w-full">
                            <button onClick={handleOpenDeliveryDialog} disabled={!user} className={`${!user && "opacity-60"} btn_block mt-6 btn-cart-mb w-full`}>Выбрать способ доставки</button>
                            {!user && (<div className="mt-2 text-center font-inter">Необходимо <Link to="/user/" className="font-semibold underline underline-offset-2">авторизоваться</Link> для оформления заказа</div>)}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CartPage;