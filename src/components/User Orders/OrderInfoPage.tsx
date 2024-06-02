import {Link, useParams} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useState, Suspense, useCallback} from "react";
import axios from "axios";
import {AppDispatch, RootState} from "../../store/store";
import {useDispatch, useSelector} from "react-redux";
import {checkTokenValidity} from "../../slicers/userSlice";
import { toast } from "react-toastify";
import LazyLoad from "react-lazyload";
import {Spinner} from "@material-tailwind/react";
import numeral from "numeral";

const OrderInfoPage = () => {
    interface Order{
        payment_details: {
            card_info: {
                card_type: string;
                last4: string;
            }
        }
        delivery_address: {
            address: string;
            index: string;
        }
        amount: number;
        paid: boolean;
        status: string;
        delivery_type: string;
        promo: string;
        products: {
            ProductDetails: {
                color: string;
                size: string;
                quantity: number;
            }
            productId: string;
            Title: string;
            Image: string;
        }[]
        orderId: string;
        createdBy: string;
    }

    const { id } = useParams<{ id: string }>();
    const dispatch: AppDispatch = useDispatch();
    const token = useSelector((state: RootState) => state.user.token);
    const [error, setError] = useState({
        isError: false,
        errorId: 0
    })
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true)


    function formatDate(dateString: string): string {
        const months = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];

        const date = new Date(dateString);
        const day = date.getDate();
        const monthIndex = date.getMonth();
        const year = date.getFullYear();

        return `${day} ${months[monthIndex]}, ${year} года`;
    }

    useEffect(() => {
        // Проверяем валидность токена при загрузке компонента
        dispatch(checkTokenValidity());
    }, [dispatch]);

    const fetchOrderInfo = useCallback(async (orderId: string) => {
        try {
            const response = await axios.post(`https://api.orochirage.ru/api/user/order/${orderId}`, null, {
                headers: {
                    Authorization: token
                }
            });

            switch (response.status) {
                case 401:
                case 403:
                    setError({ isError: true, errorId: 403 });
                    toast.error("Доступ запрещен.");
                    break;
                case 404:
                    setError({ isError: true, errorId: 404 });
                    break;
                case 400:
                    setError({ isError: true, errorId: 400 });
                    break;
                case 200:
                    setOrder(response.data);
                    break;
                default:
                    // Обработка других статусов ответа
                    break;
            }
            setIsLoading(false)
        } catch (error) {
            toast.error("Доступ запрещен");
        }
    }, [token]);

    useEffect(() => {
        if (id) {
            fetchOrderInfo(id);
        }
    }, [id, fetchOrderInfo]);


    const convertDelivery = (delivery_type: string) => {
        switch (delivery_type) {
            case "PochtaRF":
                return "Почтой РФ";
                break;
            case "CDEK":
                return "Сдэком"
                break;
            default:
                return "Курьером"
                break;
        }
    }

    if(!token)
    {
        window.location.href = '/user';
    }

    if(isLoading){
        return (
            <>
                <div className="flex items-center justify-center h-[calc(100vh-30rem)] w-full"><Spinner className="h-12 w-12" /></div>
            </>
        )
    }

    return (
        <>
            <LazyLoad offset={0}>
                <Suspense fallback={(
                    <>
                        Загрузка
                    </>
                )}/>
            <div className="p-8">
                <Link to="/user?act=orders" className="flex flex-row items-center gap-2">
                    <div className="link-icon">
                        <FontAwesomeIcon icon={faArrowLeft}/>
                    </div>
                    <div className="link-text font-semibold ">
                        Вернутся в личный кабинет
                    </div>
                </Link>
                <div className="order-page__block py-4">
                    <div className="block__title text-xl font-semibold uppercase">
                        Заказ {order?.orderId}
                    </div>
                    <div className="block__details-description">
                        {formatDate(order?.createdBy || "")}
                    </div>
                    <div className="order__details mt-6">
                        <div className="details__title flex flex-row justify-between items-center">
                            <div className="title text-lg">Предметы заказа:</div>
                            <div className="items-num text-xs opacity-60 font-semibold">(всего {order?.products.length})</div>
                        </div>
                        <div className="details-items-list flex flex-col gap-4 mt-2">
                            {order?.products.map((product, index) => (
                                <div className="list__item flex flex-row justify-between text-base box-border py-2 items-center border-b-2 border-box border-dashed last:border-0">
                                    <div className="item__name max-w-16 w-16 lg:max-w-32 lg:w-32">{product.Title}</div>
                                    <div className="item__quantity">{product.ProductDetails.quantity}шт.</div>
                                    <div className="item__details flex flex-row gap-2 items-center">
                                        <div className="details__size size_selector flex flex-row gap-2">
                                            <a href="#" className={`transition-colors duration-300 ease-out size_selector__item`}>{product.ProductDetails.size}</a>
                                        </div>
                                        <div className="details__color color_selector flex flex-row gap-3 items-center">
                                            <a href="#" className={`transition-colors duration-300 ease-out color_selector__item bg-${product.ProductDetails.color}`} style={{backgroundColor: product.ProductDetails.color}}></a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="details__total flex justify-between flex-row mt-6 border-b-2 border-box border-dashed py-1 items-center">
                            <div className="total__text text-lg flex-col">
                                <div className="text__title">Доставим по адресу</div>
                                <div className="text__description text-sm opacity-50">{order?.delivery_address.address}, индекс {order?.delivery_address.index}</div>
                            </div>
                            <div className="delivery-method font-semibold text-right">
                                {convertDelivery(order?.delivery_type || "")}
                            </div>
                        </div>
                        <div className="details__total flex justify-between flex-row mt-6 border-b-2 border-box border-dashed py-1 items-center">
                            <div className="total__text text-xl flex-col">
                                <div className="text__title">Итого</div>
                                <div className="text__description text-sm opacity-50">{order?.promo ? order?.promo : "Промокод не использовался"}</div>
                            </div>
                            <div className="total__amount text-xl font-semibold text-right">{numeral(order?.amount).format('0,0.00 $')}</div>
                        </div>
                    </div>
                </div>
            </div>
            </LazyLoad>
        </>
    )
}

export default OrderInfoPage;