import {
    Button,
    Card,
    CardBody,
    Chip,
    Spinner,
    Alert,
    Accordion,
    AccordionHeader,
    AccordionBody
} from "@material-tailwind/react";
import React, {useEffect, useState} from "react";
import { Link } from "react-router-dom";
import {AppDispatch, RootState} from "../../store/store";
import {useDispatch, useSelector} from "react-redux";
import {checkTokenValidity} from "../../slicers/userSlice";
import LoginPage from "../User Panel Page/LoginPage";
import numeral from "numeral";
import {TruckIcon, XMarkIcon, ClockIcon} from "@heroicons/react/24/solid"
import {getFormattedDate} from "flowbite-react/lib/types/components/Datepicker/helpers";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronDown} from "@fortawesome/free-solid-svg-icons";

const orderStatusTranslations: { [key: string]: string } = {
    'in-processing': 'В обработке',
    'in-sewing': 'На пошиве',
    'in-printing': 'На печати',
    'packed-ready-for-shipment': 'Упакован и готов к отправке',
    'handed-over-for-delivery': 'Передано в доставку',
    'delivered': 'Доставлено',
    'canceled': 'Отменено'
};

const OrderStatus = ({ adminStatus }: { adminStatus: string }) => {
    const translatedStatus = orderStatusTranslations[adminStatus] || adminStatus;
    const isCanceled = adminStatus === 'canceled';

    return (
        <div
            className={`order_date__status lg:before:content-[',\00a0'] ${isCanceled ? 'text-red-500 font-bold' : ''}`}
        >
            {translatedStatus}
        </div>
    );
};

const UserOrdersPage = () => {
    const dispatch: AppDispatch = useDispatch();
    const [orderDetailsOpen, setOrderDetailsOpen] = useState<number | null>(null);
    const token = useSelector((state: RootState) => state.user.token);
    const tokenValid = useSelector((state: RootState) => state.user.tokenValid);
    const orders = useSelector((state: RootState) => state.user.orders);

    const [isLoading, setIsLoading] = React.useState(true);

    useEffect(() => {
        dispatch(checkTokenValidity());
        setIsLoading(false);
    }, [dispatch]);

    if (isLoading === true) {
        return <><div className="flex items-center justify-center h-[calc(100vh-30rem)] w-full"><Spinner className="h-12 w-12" /></div></>;
    }

    const handleOpen = (index: number) => {
        setOrderDetailsOpen(orderDetailsOpen === index ? null : index);
    };

    if(!tokenValid)
        return <LoginPage isLoading={isLoading} />

    if(!orders || orders.length === 0)
        return (
            <div className="flex flex-col gap-4">
                У Вас нет заказов.
            </div>
        )

    const deliveryConvert = (method: string) => {
        switch (method){
            case 'CDEK':
                return "СДЭК";
            case 'PochtaRF':
                return "Почта РФ"
            default:
                return 'Курьер';
        }
    }

    const formatCustomDate = (dateString: string) => {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return "Invalid Date";
        }

        const months = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        const formattedDate = `${day} ${month}, в ${hours}:${minutes}`;

        return formattedDate;
    };

    const orderStatus = (status: string, delivery_type: string) => {
        switch (status) {
            case 'delivered':
                return { label: 'Заказ доставлен', color: 'green', component: (
                        <>
                            <Alert className="text-sm" icon={<TruckIcon className="h-5 w-5"/>} color="green">
                                Заказ доставлен с помощью <span className="font-semibold">{deliveryConvert(delivery_type)}</span>
                            </Alert>
                        </>
                    ) };
            case 'canceled':
                return { label: 'Отменен', color: 'red', component: (
                        <>
                            <Alert className="text-sm" icon={<XMarkIcon className="h-5 w-5"/>} color="red">
                                Заказ был отменен, обратитесь в поддержку.
                            </Alert>
                        </>
                    ) };
            case 'pending':
                return { label: 'Не оплачен', color: 'orange', component: (
                        <>
                            <Alert className="text-sm" icon={<Spinner className="w-5 h-5" color="gray"/>} color="blue-gray">
                                Заказ ожидает подтверждения
                            </Alert>
                        </>
                    ) };
            default:
                return { label: 'Неизвестный статус', color: 'gray', component: (
                        <>
                            Ожидайте подтверждения.
                        </>
                    ) };
        }
    }

    const paymentStatus = (status: string) => {
        switch (status) {
            case 'succeeded':
                return { label: 'Заказ оплачен', color: 'green' };
            case 'canceled':
                return { label: 'Отменен', color: 'red' };
            case 'pending':
                return { label: 'Не оплачен', color: 'orange' };
            default:
                return { label: 'Неизвестный статус', color: 'gray' };
        }
    };

    return (
        <>
            <div className="flex flex-col gap-4">
                {orders.map((order, index) => (
                    <Accordion
                        key={order.orderId}
                        open={orderDetailsOpen === index}
                        icon={
                            <FontAwesomeIcon
                                icon={faChevronDown}
                                strokeWidth={2.5}
                                className={`mx-auto h-4 w-4 transition-transform ${
                                    orderDetailsOpen === index ? 'rotate-180' : ''
                                }`}
                            />
                        }
                    >
                        <AccordionHeader onClick={() => handleOpen(index)} className="border-none bg-gray-200 bg-opacity-50 p-3 rounded-xl">
                            <div className="order-info flex flex-row w-full justify-between items-center">
                                <div className="order-info__primary flex flex-col">
                                    <div
                                        className="order-info__order_id flex flex-row justify-between w-full items-center">
                                        Заказ {order.orderId}
                                    </div>
                                    <div className="order-info__order_date muted flex flex-col lg:flex-row">
                                        {formatCustomDate(order.createdBy)}
                                        <OrderStatus adminStatus={order.adminStatus} />
                                    </div>
                                </div>
                                <div className="order-info__secondary muted text-right">
                                    {numeral(order.amount).format('0,0.00 $')}
                                </div>
                            </div>

                        </AccordionHeader>
                        <AccordionBody>
                            <div className="order-info__order_details mx-3">
                                <div className="order_details__items">
                                    <div className="items_header text-lg font-bold mb-1.5">
                                        Детали заказа
                                    </div>
                                    <div className="order_items-list flex flex-col gap-2">
                                        {order.products.map((product, index) => (
                                            <div className="order_item flex flex-row justify-between items-center">
                                                <div className="order_item__item-name flex flex-col">
                                                    {product.productId?.Title ?? 'Товар был удален'}
                                                    <div className="item-name__size muted font-bold">
                                                        Размер {product.ProductDetails.size}
                                                    </div>
                                                </div>
                                                <div className="order_item__item_quanity">
                                                    {product.ProductDetails.quantity} шт.
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="items_footer text-sm muted font-bold mt-4">
                                        <div className="footer-title text-lg font-bold">
                                            Информация о заказе
                                        </div>
                                        <OrderStatus adminStatus={order.adminStatus} />
                                        <div className="item_footer links mt-4">
                                            <Link to={`/user/order/${order.orderId}`} className="underline underline-offset-4">
                                                Посмотреть подробности
                                            </Link>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </AccordionBody>
                    </Accordion>
                ))}
            </div>
        </>
    )
}

export default UserOrdersPage;
