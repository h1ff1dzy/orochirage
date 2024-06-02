import React, { ChangeEvent, forwardRef } from "react";
import {
    Tabs,
    TabsHeader,
    TabsBody,
    Tab,
    TabPanel,
    Input,
    Select,
    Option,
    Switch,
    Spinner,
    Dialog,
    DialogHeader,
    DialogBody,
    Button,
    DialogFooter,
    Typography,
    Chip,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
} from "@material-tailwind/react";
import {
    Cog6ToothIcon,
} from "@heroicons/react/24/solid";
import {
    faCheckCircle,
    faPen,
    faLinkSlash, faTrash
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSearchParams } from "react-router-dom";
import { AppDispatch, RootState } from '../../store/store';
import LoginPage from "./LoginPage";
import { checkTokenValidity, saveProfileChanges } from '../../slicers/userSlice';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from "axios";
import { toast } from "react-toastify";
import { AddressSuggestions, DaDataAddress, DaDataSuggestion } from "react-dadata";
import { Helmet } from "react-helmet";
import UserOrdersPage from "../User Orders/UserOrdersPage";

interface Achievements {
    name: string;
    description: string;
    rarity: string;
    icon: string;
    dateUnlocked: string;
}

export const UserPanelPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const dispatch: AppDispatch = useDispatch();

    const token = useSelector((state: RootState) => state.user.token);
    const tokenValid = useSelector((state: RootState) => state.user.tokenValid);

    const isLoggedIn = !!token && tokenValid;

    const [isLoading, setIsLoading] = React.useState(true);
    const user = useSelector((state: RootState) => state.user.user);
    const orders = useSelector((state: RootState) => state.user.orders);

    const [passwordChangeLoading, setPasswordChangeLoading] = React.useState(false);
    const [newPassword, setNewPassword] = React.useState('');
    const [oldPassword, setOldPassword] = React.useState('');

    const [userAchievements, setUserAchievements] = React.useState<Achievements[] | null>(null);

    const handleOldPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
        setOldPassword(event.target.value);
    };

    const handleNewPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
        setNewPassword(event.target.value);
    };

    const userAddresses = [
        {
            Address: "Загрузка данных..",
            Index: 123456,
            name: "Название адреса"
        }
    ];
    const userFirst = ""
    const userSecond = ""
    const userSex_p = ""
    const userPhone_p = ""
    const userEmail_p = ""
    const userNotifications_p = {
        Sale: true,
        Discount: true,
        NewItems: true,
    }

    const [addresses, setAddresses] = React.useState(userAddresses);
    const [userData, setUserData] = React.useState(false);
    const [editingEnabled, setEditingEnabled] = React.useState(Array(userAddresses && userAddresses.length).fill(false));

    const [userFirstName, setFirstName] = React.useState(userFirst);
    const [userSecondName, setSecondName] = React.useState(userSecond);
    const [userMiddleName, setMiddleName] = React.useState(userSecond);
    const [userSex, setUserSex] = React.useState(userSex_p);
    const [userPhone, setUserPhone] = React.useState(userPhone_p);
    const [userEmail, setUserEmail] = React.useState(userEmail_p);
    const [userNotifications, setUserNotifications] = React.useState(userNotifications_p);

    const handleChangeNotification = (notificationType: keyof typeof userNotifications_p) => {
        setUserNotifications(prevNotifications => ({
            ...prevNotifications,
            [notificationType]: !prevNotifications[notificationType]
        }));
    };

    const handleFirstName = (event: ChangeEvent<HTMLInputElement>) => {
        setFirstName(event.target.value);
    };
    const handleSecondName = (event: ChangeEvent<HTMLInputElement>) => {
        setSecondName(event.target.value);
    };

    const handleMiddleName = (event: ChangeEvent<HTMLInputElement>) => {
        setMiddleName(event.target.value);
    };

    const handleEmail = (event: ChangeEvent<HTMLInputElement>) => {
        setUserEmail(event.target.value);
    };

    const enableEditing = (index: number) => {
        const updatedEditing = [...editingEnabled];
        updatedEditing[index] = true;
        setEditingEnabled(updatedEditing);
    };

    const removeAddress = (indexToRemove: number) => {
        const updatedAddresses = [...addresses];
        updatedAddresses.splice(indexToRemove, 1);
        setAddresses(updatedAddresses);
    };

    const disableEditing = (index: number) => {
        const updatedEditing = [...editingEnabled];
        updatedEditing[index] = false;
        setEditingEnabled(updatedEditing);
    };

    const [act, setAct] = React.useState('profile');

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const actParam = searchParams.get('act');
        if (actParam) {
            setAct(actParam);
        }
    }, []);

    const [value, setValue] = React.useState("sex-unknown");
    const [passwordChangeOpen, setPasswordChangeOpen] = React.useState(false);
    const [addNewAddress, setAddNewAddress] = React.useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = React.useState<DaDataSuggestion<DaDataAddress> | undefined>(undefined);
    const [newAddressValue, setNewAddressValue] = React.useState<string>('');
    const [newIndexValue, setNewIndexValue] = React.useState(0);
    const [achievementsLoaded, setAchievementsLoaded] = React.useState(false);

    const handleNewAddressValue = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        setNewAddressValue(inputValue);
    };

    const handleNewIndex = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        const parsedValue = parseInt(value, 10);

        if (!isNaN(parsedValue)) {
            setNewIndexValue(parsedValue);
        } else {
            setNewIndexValue(0);
        }
    };

    const handlePasswordChangeOpen = () => setPasswordChangeOpen(!passwordChangeOpen);
    const handleAddNewAddress = () => setAddNewAddress(!addNewAddress);

    const handleAddAddress = async () => {
        let addressValue = '';

        if (newAddressValue && typeof newAddressValue === 'string') {
            addressValue = newAddressValue;
        }

        const newAddress = {
            Address: addressValue,
            Index: newIndexValue,
            name: 'Новый адрес',
        };

        setAddresses([...addresses, newAddress]);
        handleAddNewAddress();
    }

    const CustomAddressInput = forwardRef<HTMLInputElement>((props, ref) => (
        <div className="relative w-full min-w-[200px] h-10">
            <input
                {...props}
                ref={ref || undefined}
                className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0
            disabled:bg-blue-gray-50 disabled:border-0 disabled:cursor-not-allowed transition-all placeholder-shown:border
            placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent
            focus:border-t-transparent placeholder:opacity-0 focus:placeholder:opacity-100 text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200
            focus:border-gray-900" />
            <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">Адрес</label>
        </div>
    ));

    const handleLoadAchievements = async () => {
        if (achievementsLoaded)
            return
        try {
            await axios.post('https://api.orochirage.ru/api/user/achievements', null, {
                headers: {
                    Authorization: token
                }
            }).then((r) => (
                setAchievementsLoaded(true)
            ));
        } catch (e) {
            //
        }
    }

    const handlePasswordChange = async () => {
        try {
            setPasswordChangeLoading(true);
            const response = await axios.post('https://api.orochirage.ru/api/user/change-password', {
                oldPassword: oldPassword,
                newPassword: newPassword
            }, {
                headers: {
                    Authorization: token
                }
            });

            if (response.data.message === "Password changed successfully") {
                setPasswordChangeLoading(false);
                handlePasswordChangeOpen();
                toast.success("Пароль был успешно изменен!");
                dispatch(checkTokenValidity());
            } else {
                // error todo
            }
        } catch (error: any) {
            dispatch(checkTokenValidity());
            console.error('Ошибка при изменении пароля:', error.message);
        } finally {
            dispatch(checkTokenValidity());
            setPasswordChangeLoading(false);
        }
    };

    const handleChangeIndex = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { value } = event.target;
        const updatedAddress = { ...addresses[index], Index: parseInt(value, 10) };
        const updatedAddresses = [...addresses];
        updatedAddresses[index] = updatedAddress;
        setAddresses(updatedAddresses);
    };

    useEffect(() => {
        dispatch(checkTokenValidity());
        setIsLoading(false);
    }, [dispatch]);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }
        handleLoadAchievements()
        setAddresses(user.Address);
        setFirstName(user["First name"]);
        setSecondName(user["Second name"]);
        setMiddleName(user["Middle name"]);
        setUserSex(user.Sex);
        setUserPhone(user.Phone);
        setUserEmail(user.Email);
        setUserNotifications(user.Notifications);
        setUserAchievements(user.Achievements)
        setIsLoading(false);
    }, [user]);

    if (!user) {
        return <LoginPage isLoading={isLoading} />;
    }

    if (!orders) {
        return <LoginPage isLoading={isLoading} />;
    }

    if (isLoading === true) {
        return <><div className="flex items-center justify-center h-[calc(100vh-30rem)] w-full"><Spinner className="h-12 w-12" /></div></>;
    }

    const onChange = (event: ChangeEvent<HTMLInputElement>, index: number) => {
        const { value } = event.target;
        const updatedAddresses = [...addresses];
        updatedAddresses[index] = { ...updatedAddresses[index], name: value };
        setAddresses(updatedAddresses);
    };

    const changeAddress = (index: number, suggestion?: DaDataSuggestion<DaDataAddress>) => {
        const updatedAddresses = [...addresses];
        const newAddress = { ...updatedAddresses[index] };
        if (suggestion) {
            newAddress.Address = suggestion.value || '';
        } else {
            newAddress.Address = newAddressValue;
        }
        updatedAddresses[index] = newAddress;
        setAddresses(updatedAddresses);
    };

    function formatDate(dateString: string): string {
        const months = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября'];

        const date = new Date(dateString);
        const day = date.getDate();
        const monthIndex = date.getMonth();
        const year = date.getFullYear();

        return `${day} ${months[monthIndex]}, ${year} года`;
    }

    const AchievementTab = (
        <div className="achievements-tab flex gap-6 flex-col h-fit overflow-visible mb-4 pt-2 items-center">
            {userAchievements?.map((achievement, index) => (
                <div className="achievements-tab__item select-none group w-fit" key={index}>
                    <Card className={`group-hover:scale-150-10 w-52 h-fit`} >
                        <CardHeader shadow={false} floated={false} >
                            <img
                                src={achievement.icon}
                                alt="card-image"
                                className="w-52 h-48 object-cover"
                            />
                        </CardHeader>
                        <CardBody >
                            <div className="mb-2 flex items-center justify-between">
                                <Typography color="blue-gray" className="font-semibold font-inter">
                                    {achievement.name}
                                </Typography>
                            </div>
                            <Typography
                                variant="small"
                                color="gray"
                                className="font-normal opacity-75"
                            >
                                {achievement.description}
                            </Typography>
                        </CardBody>
                        <CardFooter className="pt-0 text-xs">
                            {(() => {
                                switch (achievement.rarity) {
                                    case "common":
                                        return (<Chip className={`w-fit mb-3 ${achievement.rarity}-text`} size="sm" value="Обычное" />)
                                    case "uncommon":
                                        return (<Chip className={`w-fit mb-3 ${achievement.rarity}-text`} size="sm" value="Необычное" />)
                                    case "rare":
                                        return (<Chip className={`w-fit mb-3 ${achievement.rarity}-text`} size="sm" value="Редкое" />)
                                    case "epic":
                                        return (<Chip className={`w-fit mb-3 ${achievement.rarity}-text`} size="sm" value="Эпическое" />)
                                    case "legendary":
                                        return (<Chip className={`w-fit mb-3 ${achievement.rarity}-text`} size="sm" value="Легендарное" />)
                                    case "eternal":
                                        return (<Chip className={`w-fit mb-3 ${achievement.rarity}-text`} size="sm" value="Божественное" />)
                                    default:
                                        return "";
                                }
                            })()}
                            <div>
                                Разблокировано {formatDate(achievement.dateUnlocked)}
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            ))}
        </div>
    )

    const OrdersTab = (
        <UserOrdersPage />
    )

    async function handleSaveProfileChanges() {
        try {
            const changes = {
                "First name": userFirstName,
                "Second name": userSecondName,
                "Middle name": userMiddleName,
                "Sex": userSex,
                "Email": userEmail,
                "Address": addresses,
                "Notifications": userNotifications
            };

            await dispatch(saveProfileChanges(changes));
        } catch (error) {
            console.error('Ошибка при сохранении изменений профиля:', error);
            toast.error("Не удалось изменить данные профиля");
        }
    }

    const SettingsTab = (
        <div className="profile-tab flex gap-3 flex-col h-fit overflow-visible">
            <div className="text-md font-semibold mt-2">Основная информация</div>
            <Input label="Имя" onChange={handleFirstName} value={userFirstName} crossOrigin={undefined} />
            <Input label="Фамилия" onChange={handleSecondName} value={userSecondName} crossOrigin={undefined} />
            <Input label="Отчество (если есть)" onChange={handleMiddleName} value={userMiddleName} crossOrigin={undefined} />
            <Select
                label="Ваш пол"
                value={userSex}
                onChange={(val) => setUserSex(val as string)}
            >
                <Option value="male">Мужской</Option>
                <Option value="female">Женский</Option>
                <Option value="unknown">Неизвестно</Option>
            </Select>
            <Input crossOrigin label="Номер телефона" value={userPhone} disabled={true} icon={<FontAwesomeIcon className="text-[#4EAD3F]" icon={faCheckCircle} />} />
            <div className="muted">Подать заявку на изменение номера можно в службе поддержки.</div>
            <Input label="Электронная почта" onChange={handleEmail} value={userEmail} crossOrigin={undefined} />
            <a href="#" className="font-semibold uppercase text-sm underline underline-offset-4 cursor-pointer" onClick={handlePasswordChangeOpen}>Изменить пароль</a>
            <div className="text-md font-semibold mt-2 flex flex-row">
                <span className="grow">Адреса доставки</span>
                <a onClick={handleAddNewAddress}><Chip value="Добавить" size="sm" variant="ghost" color="blue-gray" className="rounded-full cursor-pointer" /></a>
            </div>
            <div className="delivery-address flex flex-col gap-5 justify-between">
                {addresses && addresses?.length > 0 ?
                    addresses.map((address, index) => (
                        <div key={index} className="address-block flex flex-col gap-2">
                            <div className="address-block_title text-sm font-semibold flex flex-row justify-between">
                                {editingEnabled[index] ? (
                                    <>
                                        <div className="relative flex w-full">
                                            <Input crossOrigin
                                                   type="text"
                                                   label="Имя"
                                                   value={addresses[index].name}
                                                   variant="standard"
                                                   onChange={(event) => onChange(event, index)}
                                                   className="pr-20 border-transparent focus:border-transparent focus:ring-0 border-b border-x-0 border-t-0 border-solid !border-[#d9dfe3]"
                                                   containerProps={{
                                                       className: "min-w-0",
                                                   }}
                                            />
                                            <Button
                                                size="sm"
                                                color={address.name ? "gray" : "blue-gray"}
                                                disabled={!address.name}
                                                onClick={() => disableEditing(index)}
                                                className="!absolute right-1 top-1 rounded"
                                            >
                                                Сохранить
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="title">{address.name}</div>
                                        <div className="flex flex-row gap-2">
                                            <FontAwesomeIcon onClick={() => removeAddress(index)} icon={faTrash} className="transition-opacity opacity-20 hover:opacity-100 cursor-pointer" />
                                            <FontAwesomeIcon onClick={() => enableEditing(index)} icon={faPen} className="cursor-pointer" />
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="input-address relative">
                                <AddressSuggestions
                                    containerClassName="w-full"
                                    customInput={CustomAddressInput}
                                    count={4}
                                    highlightClassName={`!bg-transparent font-inter text-gray-600 font-semibold`}
                                    suggestionClassName={`text-gray-500 px-2 mt-1 mb-1 hover:text-gray-800 w-full text-left transition-colors font-inter font-normal`}
                                    suggestionsClassName={`absolute gap-2 z-[999] bg-white border-collapse flex flex-col items-start min-w-[calc(100%-2px)]`}
                                    token="54fd7482d846b9bcb321b3240b305639762f7418"
                                    value={{
                                        value: address.Address,
                                        unrestricted_value: address.Address,
                                        data: {} as DaDataAddress
                                    }} // Здесь тип DaDataSuggestion
                                    onChange={(suggestion) => changeAddress(index, suggestion)}
                                    inputProps={{
                                        onBlur: (e) => {
                                            if (!selectedSuggestion) {
                                                changeAddress(index, { value: e.target.value, unrestricted_value: e.target.value, data: {} as DaDataAddress });
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <div className="input-index">
                                <Input
                                    label="Индекс"
                                    maxLength={6}
                                    placeholder="123456"
                                    onChange={(event) => handleChangeIndex(event, index)}
                                    crossOrigin={undefined}
                                    value={address.Index.toString()}
                                />
                            </div>
                        </div>
                    )) : "Адресов нет"}

                <div className="text-md font-semibold mt-2">Уведомления</div>
                <Switch crossOrigin onChange={() => handleChangeNotification('Sale')} checked={userNotifications?.Sale} label="Уведомления о скидках" ripple={false} />
                <Switch crossOrigin onChange={() => handleChangeNotification('Discount')} checked={userNotifications?.Discount} label="Уведомления о распродажах" ripple={false} />
                <Switch crossOrigin onChange={() => handleChangeNotification('NewItems')} checked={userNotifications?.NewItems} label="Уведомления о новинках" ripple={false} />
            </div>
            <a href="#" className="w-full bg-[#000] text-[#fff] text-center p-3 rounded-lg mt-4" onClick={handleSaveProfileChanges}>Сохранить изменения</a>
        </div>
    )

    const data = [
        {
            label: "Профиль",
            value: "profile",
            desc: SettingsTab,
        },
        {
            label: "Заказы",
            value: "orders",
            desc: OrdersTab,
        },
        {
            label: "Достижения",
            value: "achievements",
            icon: Cog6ToothIcon,
            desc: AchievementTab,
        },
    ];

    if (!isLoggedIn)
        return <LoginPage isLoading={isLoading} />;
    return (
        <div className="user-panel">
            {isLoggedIn ? (
                <>
                    <Helmet>
                        <title>OROCHI - Личный кабинет</title>
                    </Helmet>
                    <Dialog
                        open={addNewAddress}
                        handler={handleAddNewAddress}
                        animate={{
                            mount: { scale: 1, y: 0 },
                            unmount: { scale: 0.9, y: -100 },
                        }}
                    >
                        <DialogHeader >Добавить новый адрес</DialogHeader>
                        <DialogBody >
                            {passwordChangeLoading ? (<><div className="flex items-center justify-center h-[calc(100vh-30rem)] w-full"><Spinner className="h-12 w-12" /></div></>) : (<>
                                <div className="flex flex-col lg:flex-row">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:gap-1 w-full relative">
                                        <AddressSuggestions
                                            containerClassName="w-full"
                                            customInput={CustomAddressInput}
                                            count={4}
                                            highlightClassName={`!bg-transparent font-inter text-gray-600 font-semibold`}
                                            suggestionClassName={`text-gray-500 px-2 mt-1 mb-1 hover:text-gray-800 w-full text-left transition-colors font-inter font-normal`}
                                            suggestionsClassName={`absolute gap-2 z-[999] bg-white border-collapse flex flex-col items-start min-w-[calc(100%-2px)]`}
                                            token="54fd7482d846b9bcb321b3240b305639762f7418"
                                            value={{
                                                value: newAddressValue,
                                                unrestricted_value: newAddressValue,
                                                data: {} as DaDataAddress
                                            }} // Здесь тип DaDataSuggestion
                                            onChange={(suggestion) => {
                                                if (suggestion) {
                                                    setNewAddressValue(suggestion.value);
                                                }
                                            }}
                                            inputProps={{
                                                onBlur: (e) => {
                                                    setNewAddressValue(e.target.value);
                                                }
                                            }}
                                        />
                                        <div className="flex w-full lg:max-w-[14rem]">
                                            <Input
                                                value={newIndexValue}
                                                maxLength={6}
                                                onChange={handleNewIndex}
                                                placeholder="123456"
                                                label="Индекс"
                                                className=""
                                                crossOrigin />
                                        </div>
                                    </div>
                                </div></>)}
                        </DialogBody>
                        <DialogFooter >
                            <Button
                                variant="text"
                                color="red"
                                onClick={handleAddNewAddress}
                                className="mr-1"
                            >
                                <span>Отмена</span>
                            </Button>
                            <Button variant="gradient" color="green" onClick={handleAddAddress}>
                                <span>Добавить</span>
                            </Button>
                        </DialogFooter>
                    </Dialog>
                </>
            ) : ""}
            {isLoggedIn ? (
                <>
                    <Dialog
                        open={passwordChangeOpen}
                        handler={handlePasswordChangeOpen}
                        animate={{
                            mount: { scale: 1, y: 0 },
                            unmount: { scale: 0.9, y: -100 },
                        }}
                    >
                        <DialogHeader >Изменение пароля</DialogHeader>
                        <DialogBody >
                            {passwordChangeLoading ? (<><div className="flex items-center justify-center h-[calc(100vh-30rem)] w-full"><Spinner className="h-12 w-12" /></div></>) : (<>
                                <div className="flex flex-col gap-4">
                                    <Input
                                        onChange={handleOldPasswordChange}
                                        value={oldPassword}
                                        label="Текущий пароль"
                                        crossOrigin />
                                    <div className="flex-col">
                                        <Input
                                            label="Новый пароль"
                                            onChange={handleNewPasswordChange}
                                            value={newPassword}
                                            crossOrigin />
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="mt-2 flex items-center gap-1 font-normal hidden lg:flex"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="-mt-px h-4 w-4"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Новый пароль должен состоять минимум из 8 символов
                                        </Typography>
                                    </div>
                                </div></>)}
                        </DialogBody>
                        <DialogFooter >
                            <Button
                                disabled={passwordChangeLoading}
                                variant="text"
                                color="red"
                                onClick={handlePasswordChangeOpen}
                                className="mr-1"
                            >
                                <span>Отмена</span>
                            </Button>
                            <Button disabled={passwordChangeLoading} variant="gradient" color="green" onClick={handlePasswordChange}>
                                <span>Подтвердить</span>
                            </Button>
                        </DialogFooter>
                    </Dialog>
                </>
            ) : ""}
            <div className="pl-8 pr-8 pt-5">
                <Tabs value={act} className="max-w-[40rem]">
                    <TabsHeader
                        className="bg-transparent"
                        indicatorProps={{
                            className: "bg-gray-900/10 shadow-none !text-gray-900",
                        }}>
                        {data.map(({ label, value }) => (
                            <Tab key={value} value={value}>
                                {label}
                            </Tab>
                        ))}
                    </TabsHeader>
                    <TabsBody >
                        {data.map(({ value, desc }) => (
                            <TabPanel className="overflow-visible" key={value} value={value}>
                                {desc}
                            </TabPanel>
                        ))}
                    </TabsBody>
                </Tabs>
            </div>
        </div>
    )
}

export default UserPanelPage;
