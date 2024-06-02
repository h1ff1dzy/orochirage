import {Link, useParams} from "react-router-dom";
import React, {useEffect} from "react";
import axios from "axios";
import {Helmet} from "react-helmet";
import {useCart} from "../../../context/CartProvider";

const PaymentStatus = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const params = useParams()

    const [type, setType] = React.useState(3);
    const { cartItems, clearCart } = useCart();


    const checkPayment = async () => {
        try {
            const response = await axios.post(`https://api.orochirage.ru/api/payment/get/${params.id}`, { timeout: 10000 });
            if(response.status === 200)
            {
                setType(1)
                clearCart();
            }
            if(response.status === 403)
            {
                setType(4)
            }
        } catch (error) {
            console.error('Error fetching collection:', error);
        }
    }

    useEffect(() => {
        if(type === 1 || type === 4)
            return;
        // Call checkPayment initially
        checkPayment();

        // Set up interval to call checkPayment every 10 seconds
        const interval = setInterval(() => {
            checkPayment();
        }, 10000);

        // Clean up the interval on component unmount
        return () => clearInterval(interval);
    }, [params]);

    if(type === 1){
        return (
            <>
                <Helmet>
                    <title>OROCHI - Заказ оплачен!</title>
                </Helmet>
                <div className="p-8 text-3xl w-full text-center">
                    Спасибо за заказ!
                    <div className="text-lg mt-2">
                        Вы можете отслеживать статус своего заказа в <Link className="text-semibold underline underline-offset-4" to="/user?act=orders">личном кабинете</Link>
                        <div className="muted">
                            Номер платежа <span className="font-semibold">#{params.id}</span>, сохраните его!
                        </div>
                    </div>
                </div>
            </>
        )
    }

    if(type === 4){
        return (
            <>
                <Helmet>
                    <title>OROCHI - Заказ отменен!</title>
                </Helmet>
                <div className="p-8 text-3xl w-full text-center">
                    Платеж отменен
                    <div className="text-lg mt-2">
                        Вам платеж был отменен, вам необходимо сформировать новый заказ.
                        <div className="muted">
                            Номер платежа <span className="font-semibold">#{params.id}</span>, сохраните его!
                        </div>
                    </div>
                </div>
            </>
        )
    }

    if(type === 2){
        return (
            <>
                <Helmet>
                    <title>OROCHI - Проверяем платеж</title>
                </Helmet>
                <div className="p-8 text-3xl w-full text-center">
                    Оплата не завершена
                    <div className="text-lg mt-2">
                        Вам нужно завершить платеж прежде чем истечет таймер, иначе платеж придется формировать по новой
                        <div className="muted">
                            Номер платежа <span className="font-semibold">#{params.id}</span>, сохраните его!
                        </div>
                    </div>
                </div>
            </>
        )
    }

    if(type === 3){
        return (
            <>
                <Helmet>
                    <title>OROCHI - Проверяем платеж!</title>
                </Helmet>
                <div className="p-8 text-3xl w-full text-center">
                    Проверка платежа
                    <div className="text-lg mt-2">
                        Мы все еще проверяем ваш платеж, пожалуйста, подождите..
                        <div className="muted">
                            Номер платежа <span className="font-semibold">#{params.id}</span>, сохраните его!
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            привет
            {urlParams.get('type')}
        </>
    )
}

export default PaymentStatus;