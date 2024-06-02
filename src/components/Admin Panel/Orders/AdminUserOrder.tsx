import {
    Breadcrumbs,
    Button,
    Card,
    Drawer,
    IconButton,
    Menu, MenuHandler, MenuItem, MenuList,
    Option,
    Select,
    Typography
} from "@material-tailwind/react";
import {Link, useParams} from "react-router-dom";
import React, {useEffect} from "react";
import axios from "axios";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../store/store";
import {fetchUserPermissions, selectError, selectPermissions} from "../../../slicers/adminSlice";
import {checkTokenValidity} from "../../../slicers/userSlice";
import {toast} from "react-toastify";
import UserPanelPage from "../../User Panel Page/User Panel Page";
import {AdminNavigation} from "../AdminNavigation";
import numeral from 'numeral'
import 'numeral/locales/ru';
import {Helmet} from "react-helmet";
import {MagnifyingGlassIcon, ShoppingBagIcon} from "@heroicons/react/24/solid";

numeral.locale('ru');

const formatCustomDate = (dateString: string) => {
    const date = new Date(dateString);

    // Проверяем, что дата валидна
    if (isNaN(date.getTime())) {
        return "Invalid Date";
    }

    // Форматируем дату
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


const AdminUserOrder = () => {
    const params = useParams()
    const TABLE_HEAD = [
        "Номер заказа",
        "Информация о заказе",
        "Использованный промокод",
        "Адрес",
        "Способ доставки",
        "Статус заказа",
        "Статус оплаты",
        "Данные при оплате",
        "Ключ оплаты (payment_id)",
        "Итого",
        "Итого после вычета налогов",
        "Заказ создан",
        ""];

    interface Order {
        payment_details: {
            type: string;
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
        payment_id: string;
        status: string;
        adminStatus: string;
        paid: boolean;
        userId: string;
        delivery_type: string;
        promo: {
            id: string;
            phrase: string;
            discount: number;
        };
        userInfo: {
            "First name": string;
            "Second name": string;
        }
        income_amount: number;
        products: {
            ProductDetails: {
                color: string;
                size: string;
                quantity: number;
            }
            productId: {
                _id: string;
            };
            Title: string;
            Images: [];
        }[]
        orderId: string;
        createdBy: string;
    }

    const dispatch: AppDispatch = useDispatch();
    const [orders, setOrders] = React.useState<Order[] | null>(null);
    const token = useSelector((state: RootState) => state.user.token);
    const permissions = useSelector((state: RootState) => selectPermissions(state));
    const permissionsError = useSelector((state: RootState) => selectError(state));
    const [isLoading, setIsLoading] = React.useState(true);
    const [editedOrder, setEditedOrder] = React.useState<Order | undefined>(undefined);
    const [orderEdit, setOrderEdit] = React.useState(false);
    const openOrderEdit = () => setOrderEdit(true);
    const closeOrderEdit = () => setOrderEdit(false);

    useEffect(() => {
        // Проверяем валидность токена при загрузке компонента
        dispatch(checkTokenValidity());
        setIsLoading(false);
    }, [dispatch]);

    useEffect(() => {
        // Вы можете вызывать асинхронное действие для загрузки прав пользователя
        dispatch(fetchUserPermissions());
    }, [dispatch]);

    useEffect(() => {
        if (permissionsError) {
            toast.error(permissionsError);
        }
    }, [permissionsError]);


    useEffect(() => {
        fetchOrders();
    }, [token, permissions])

    const handleEditOrder = (index: number) => {
        openOrderEdit()
        setEditedOrder(orders?.[index]);
    }

    const fetchOrders = async () => {
        try{
            const response = await axios.post(`https://api.orochirage.ru/api/admin/user/${params.id}/orders`, null, {
                headers: {
                    Authorization: token
                }
            });
            console.log(response.data)
            setOrders(response.data);
        }catch (e) {

        }
    }

    if(permissionsError)
        return (
            <>
                <div className="p-8">
                    <div className="font-semibold text-xl">Невозможно получить права пользователя.</div>
                    <div>Это ошибка, пожалуйста, обратитесь к системному администратору.</div>
                </div>
            </>
        )

    if(!permissions.adminPanel)
        return (
            <>
                <div className="p-8">
                    <div className="font-semibold text-xl">У вас недостаточно прав.</div>
                    <div>Если вы считаете что это ошибка, обратитесь к администратору.</div>
                </div>
            </>
        )

    if(!permissions.viewUserOrders)
        return (
            <>
                <div className="p-8">
                    <div className="font-semibold text-xl">Недостаточно прав на просмотр заказов пользователей.</div>
                    <div>Если вы считаете что это ошибка, обратитесь к администратору.</div>
                </div>
            </>
        )

    if(!orders)
        return (
            <>
            <AdminNavigation/>
            <div className="p-8 font-inter text-xl">
                Пользователь не найден, или еще не сделал заказ.
            </div>
            </>
        )

    const completedOrders = orders.filter(order => order.adminStatus === "delivered").length;
    const canceledOrders = orders.filter(order => order.adminStatus === "canceled").length;
    const pendingApprovalOrders = orders.filter(order => order.adminStatus === "pending").length;
    const onDeliveryOrders = orders.filter(order => order.adminStatus === "on-delivery").length;
    const paymentFail = orders.filter(order => order.status === "canceled").length;
    const paymentSucceeded = orders.filter(order => order.status === "succeeded").length;
    const paymentPending = orders.filter(order => order.status === "pending").length;

    const updateOrder = async (changes: Order) => {
        try {
            // Отправляем запрос на сервер для обновления пользователя
            const response = await axios.post('https://api.orochirage.ru/api/admin/order/update', changes, {
                headers: {
                    Authorization: token
                },
                timeout: 10000
            }).then(async (response) => {
                if (response.status === 200) {
                    toast.success("Данные заказа успешно обновлены.")
                    await fetchOrders();
                } else if (response.status === 403) {
                    toast.error("У вас недостаточно прав.")
                    console.error("permission")
                } else {
                    toast.error(`Невозможно произвести изменение: ${response.data.message}`)
                    console.error('Failed to update user:', response.data.message);
                }
            }).catch((response) => {
                toast.error("У вас недостаточно прав.")
            });
        } catch (error) {

            console.error('Error updating order:', error);
        }
    };

    const handleEditOrderPane = () => {
        console.log("pressed")
        if (orderEdit) {
            if (editedOrder) {
                updateOrder(editedOrder);
            } else {
                console.error('Cannot update order: editedOrder is undefined');
            }
        }
        // Закрываем/открываем панель редактирования пользователя
        setOrderEdit(false);
    };



    const handleEditOrderField = (field: string, value: any) => {
        console.log(`field: ${field} | value: ${value}`)
        setEditedOrder(prevState => ({
            ...prevState!,
            [field]: value,
        }));
    };

    return (
        <>
            <Helmet>
                <title>OROCHI - Заказы пользователя</title>
            </Helmet>
            <Drawer
                    placement="right"
                    open={orderEdit}
                    onClose={closeOrderEdit}
                    className="p-4"
            >
                <div className="flex flex-col flex-1 h-full">
                    <div className="mb-6 flex items-center justify-between">
                        <Typography variant="h5" color="blue-gray">
                            Заказ #{editedOrder?.orderId}
                        </Typography>
                        <IconButton variant="text" color="blue-gray" onClick={closeOrderEdit}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="h-5 w-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </IconButton>
                    </div>
                    <div className="flex gap-2 flex-col">
                        <Typography color="gray" className="mb-8 pr-4 font-normal">
                            Вы собираетесь изменить статус заказа, вы уверены?
                        </Typography>
                        <Select onChange={(value) => handleEditOrderField("adminStatus", value)} value={editedOrder?.adminStatus} variant="outlined" label="Выберите новый статус заказа">
                            <Option key="in-processing" value="in-processing">В обработке</Option>
                            <Option key="in-sewing" value="in-sewing">На пошиве</Option>
                            <Option key="in-printing" value="in-printing">На печати</Option>
                            <Option key="packed-ready-for-shipment" value="packed-ready-for-shipment">Упакован и готов к отправке</Option>
                            <Option key="handed-over-for-delivery" value="handed-over-for-delivery">Передано в доставку</Option>
                            <Option key="delivered" value="delivered">Доставлено</Option>
                            <Option key="canceled" value="canceled">Отменено</Option>
                        </Select>
                    </div>
                    <div className="grow flex items-end">
                        <div className="gap-2 flex grow">
                            <Button color="red" variant="text">
                                Отмена
                            </Button>
                            <Button onClick={() => handleEditOrderPane()} color="green" className="grow" variant="gradient">Обновить</Button>
                        </div>
                    </div>
                </div>
            </Drawer>
            <div className="admin--user-orders">
                <Breadcrumbs className="px-12 pt-8 pb-6 !bg-transparent hidden lg:flex" >
                    <Link to="/user/admin/" className="opacity-60">
                        Панель управления
                    </Link>
                    <Link to="/user/admin/users" className="opacity-60">
                        Пользователи
                    </Link>
                    <Link to={`/user/admin/users?search=${params.id}`} className="opacity-60">
                        Пользователь {params.id}
                    </Link>
                    <Link to={`/user/admin/users/${params.id}/orders`}>
                        Заказы
                    </Link>
                </Breadcrumbs>
                <div className="user-orders__title pt-8 lg:pt-0 px-8 pb-8 text-2xl font-inter">
                    Заказы пользователя <span className="font-semibold underline underline-offset-2">#{params.id}</span>
                    <div className="flex flex-row flex-wrap gap-5 mt-4 lg:mt-2.5 text-sm font-semibold font-inter">
                        <div className="bg-gray-200 px-4 py-2 rounded-full">
                            Всего {orders.length} заказа(-ов)
                        </div>
                        <div className="bg-gray-200 px-4 py-2 rounded-full">
                            {completedOrders} завершенных заказов
                        </div>
                        <div className="bg-gray-200 px-4 py-2 rounded-full">
                            {canceledOrders} отмененных
                        </div>
                        <div className="bg-gray-200 px-4 py-2 rounded-full">
                            {pendingApprovalOrders} заказ ожидает подтверждения
                        </div>
                        <div className="bg-gray-200 px-4 py-2 rounded-full">
                            {onDeliveryOrders} заказов доставляется
                        </div>
                        <div className="bg-gray-200 px-4 py-2 rounded-full">
                            {paymentSucceeded} оплаченных заказов
                        </div>
                        <div className="bg-gray-200 px-4 py-2 rounded-full">
                            {paymentFail} не оплаченных заказов
                        </div>
                        <div className="bg-gray-200 px-4 py-2 rounded-full">
                            {paymentPending} ожидает оплаты
                        </div>
                    </div>
                </div>
                <div className="orders-list px-8">
                    <Card className="h-full w-full overflow-scroll mb-12">
                        <table className="w-full min-w-max table-auto text-left">
                            <thead>
                            <tr>
                                {TABLE_HEAD.map((head) => (
                                    <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                        <Typography
                                            variant="small"
                                            color="blue-gray"
                                            className="font-normal leading-none opacity-70"
                                        >
                                            {head}
                                        </Typography>
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {orders && orders.map((order, index) => {
                                const isLast = index === orders.length - 1;
                                const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                                return (
                                    <tr key={order.orderId}>
                                        <td className={classes}>
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {order.orderId}
                                            </Typography>
                                        </td>
                                        <td className={`${classes} bg-blue-gray-50/50`}>
                                            <Typography variant="small" color="blue-gray" className="font-normal flex flex-col">
                                                {order.products.map((product, id) => (
                                                    <div className="productInfo flex flex-col">
                                                        <Menu>
                                                            <MenuHandler>
                                                                <Typography className="underline underline-offset-4 cursor-pointer hover:text-black w-fit" >{product.Title}</Typography>
                                                            </MenuHandler>
                                                            <MenuList >
                                                                <div className="menu-item__title px-2 py-1 text-xl">
                                                                    {product.Title}
                                                                </div>
                                                                <Link to={`/user/admin/items?search=${product.Title}`}>
                                                                    <MenuItem className="flex items-center gap-2" >
                                                                        <MagnifyingGlassIcon className="h-4 w-4"/> Открыть товар в админ панели
                                                                    </MenuItem>
                                                                </Link>
                                                                <Link to={`/product/${product.productId}`}>
                                                                    <MenuItem className="flex items-center gap-2" >
                                                                        <ShoppingBagIcon className="h-4 w-4"/> Открыть карточку товара
                                                                    </MenuItem>
                                                                </Link>
                                                            </MenuList>
                                                        </Menu>
                                                        <div className="order-details muted font-semibold">
                                                            Размер: {product.ProductDetails.size},
                                                            Цвет: {product.ProductDetails.color},
                                                            Количество: {product.ProductDetails.quantity}
                                                        </div>
                                                    </div>

                                                ))}
                                            </Typography>
                                        </td>
                                        <td className={classes}>
                                            <Typography variant="small" color="blue-gray"
                                                        className="font-normal">
                                                {order.promo.id ? (
                                                    <>
                                                        <div className="promo_phrase font-bold">
                                                            {order.promo.phrase}
                                                        </div>
                                                        <div className="promo_discount muted font-semibold opacity-70">
                                                            Скидка {order.promo.discount}%
                                                        </div>
                                                    </>
                                                ) : "Не использовался"}
                                            </Typography>
                                        </td>
                                        <td className={classes}>
                                            <div className="flex flex-col">
                                                <Typography variant="small" color="blue-gray" className="font-normal">
                                                    {order.delivery_address.address}
                                                </Typography>
                                                <Typography
                                                            variant="small"
                                                            color="blue-gray"
                                                            className="font-normal opacity-70"
                                                >
                                                    Индекс {order.delivery_address.index}
                                                </Typography>
                                            </div>
                                        </td>
                                        <td className={classes}>
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {order.delivery_type}
                                            </Typography>
                                        </td>
                                        <td className={classes}>
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                <div className={`orders-tab__item-details__badge ${order.adminStatus}`}>
                                                    {(() => {
                                                        switch (order.adminStatus) {
                                                            case "handed-over-for-delivery":
                                                                return "Передано в доставку";
                                                            case "in-processing":
                                                                return "В обработке";
                                                            case "delivered":
                                                                return "Доставлено";
                                                            case "canceled":
                                                                return "Отменено";
                                                            case "in-sewing":
                                                                return "На пошиве";
                                                            case "in-printing":
                                                                return "На печати";
                                                            case "packed-ready-for-shipment":
                                                                return "Упакован и готов к отправке";
                                                            default:
                                                                return "";
                                                        }
                                                    })()}
                                                </div>
                                            </Typography>
                                        </td>
                                        <td className={classes}>
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                <div className={`orders-tab__item-details__badge ${order.status}`}>
                                                    {(() => {
                                                        switch (order.status) {
                                                            case "pending":
                                                                return "Ожидает оплаты";
                                                            case "succeeded":
                                                                return "Оплачен";
                                                            case "canceled":
                                                                return "Оплата отклонена, или истек срок";
                                                            default:
                                                                return "Неизвестно";
                                                        }
                                                    })()}
                                                </div>
                                            </Typography>
                                        </td>
                                        <td className={classes}>
                                            {order.payment_details ? (
                                                <Typography variant="small" color="blue-gray" className="font-normal">
                                                    {order.payment_details.card_info.card_type} **** **** **** {order.payment_details.card_info.last4}
                                                </Typography>
                                            ) : (
                                                <Typography variant="small" color="blue-gray" className="font-normal">
                                                    Оплата не была произведена, или СБП. <p className="muted">Смотри статус</p>
                                                </Typography>
                                            )}
                                        </td>
                                        <td className={classes}>
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {order.payment_id}
                                            </Typography>
                                        </td>
                                        <td className={classes}>
                                            <div className="flex flex-col">
                                                <Typography variant="small" color="blue-gray" className="font-normal">
                                                    {numeral(order.amount).format('0,0.00 $')}
                                                </Typography>
                                            </div>
                                        </td>
                                        <td className={classes}>
                                            <div className="flex flex-col">
                                                <Typography variant="small" color="blue-gray" className="font-normal">
                                                    {numeral(order.income_amount).format('0,0.00 $')}
                                                </Typography>
                                            </div>
                                        </td>
                                        <td className={classes}>
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {formatCustomDate(order.createdBy)}
                                            </Typography>
                                        </td>
                                        <td className={`${classes} bg-blue-gray-50/50`}>
                                            <Typography onClick={() => handleEditOrder(index)} as="a" href="#" variant="small" color="blue-gray" className="font-medium">
                                                Редактировать
                                            </Typography>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </Card>
                </div>
            </div>

        </>
    )
}

export default AdminUserOrder;