import {
    Accordion,
    AccordionBody,
    Avatar, Button,
    Card,
    CardBody,
    CardHeader,
    Dialog, DialogBody, DialogFooter, DialogHeader, Input, Step, Stepper,
    Option,
    Typography, Tabs, TabsHeader, TabsBody, TabPanel, Tab, Checkbox, CardFooter, Alert, Spinner
} from '@material-tailwind/react';
import React, {ChangeEvent, useEffect} from 'react';
import {AdminNavigation} from "./AdminNavigation";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronDown, faList, faPlus, faUserPlus, faRubleSign, faPen} from "@fortawesome/free-solid-svg-icons";
import Select from '@material-tailwind/react/components/Select';
import axios from "axios";
import {checkTokenValidity} from "../../slicers/userSlice";
import {AppDispatch, RootState} from "../../store/store";
import {useDispatch, useSelector} from "react-redux";
import {selectPermissions, fetchUserPermissions, selectError, selectRoleName} from "../../slicers/adminSlice";
import {toast} from "react-toastify";
import LoginPage from "../User Panel Page/LoginPage";
import UserPanelPage from "../User Panel Page/User Panel Page";
import {Helmet} from "react-helmet";

const FileUpload = () => {
    const [selectedFiles, setSelectedFiles] = React.useState<FileList | null>(null);;

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        setSelectedFiles(files);
    };

    return (
        <div className="file-upload flex flex-wrap">
            <input
                className="w-[100%] max-w-[100%]"
                type="file"
                multiple
                onChange={handleFileChange}
            />
        </div>
    );
};

interface ColorSettings {
    itemColors: string[];
    itemColorsStyle: string[];
}

export const AdminPanelPage = () => {
    const [itemOpen, setItemOpen] = React.useState(true);
    const [activeStep, setActiveStep] = React.useState(0);
    const [isLastStep, setIsLastStep] = React.useState(false);
    const [isFirstStep, setIsFirstStep] = React.useState(false);


    const [addUserMenuOpened, setAddUserMenuOpened] = React.useState(false);
    const handleOpenAddUserMenuOpened = () => setAddUserMenuOpened(!addUserMenuOpened);

    const [addCollectionOpened, setAddCollectionOpened] = React.useState(false);
    const handleAddCollectionOpened = () => setAddCollectionOpened(!addCollectionOpened);


    const [selectedColors, setSelectedColors] = React.useState<number[]>([]);
    const [colorSettings, setColorSettings] = React.useState<ColorSettings | null>(null);

    useEffect(() => {
        async function fetchColorSettings() {
            try {
                const response = await axios.get('https://api.orochirage.ru/api/settings');
                setColorSettings(response.data[0]); // Assuming the API returns an array with a single object
            } catch (error) {
                console.error('Error fetching color settings:', error);
            }
        }

        fetchColorSettings();
    }, []);

    const CUSTOM_ANIMATION = {
        mount: { scale: 1 },
        unmount: { scale: 0.9 },
    };

    const [addNewItemOpen, setAddNewItemOpen] = React.useState(false);

    const handleOpenAddNewItemOpen = () => setAddNewItemOpen(!addNewItemOpen);


    function AlertIcon() {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-6 w-6"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
            </svg>
        );
    }

    const [isLoading, setIsLoading] = React.useState(true);
    const dispatch: AppDispatch = useDispatch();
    const token = useSelector((state: RootState) => state.user.token);
    const permissions = useSelector((state: RootState) => selectPermissions(state));
    const roleName = useSelector((state: RootState) => selectRoleName(state));
    const permissionsError = useSelector((state: RootState) => selectError(state));

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

    if(!token)
    {
        window.location.href = '/user';
    }

    if(isLoading)
        return (
            <>
                <div className="flex items-center justify-center h-[calc(100vh-30rem)] w-full"><Spinner className="h-12 w-12" /></div>
            </>
        )

    return (
        <>
            <Helmet>
                <title>OROCHI - Панель управления</title>
            </Helmet>

            <AdminNavigation/>
            <div className="flex w-full items-center justify-center self-center">
                <div className="admin-panel__contents gap-4 flex flex-col mt-6 mb-6 w-[90vw] items-center justify-center">
                    <Accordion open={itemOpen} animate={CUSTOM_ANIMATION}>
                        <div className="admin-panel__contents-item w-full border-collapse rounded-lg bg-white">
                            <div className="item__title flex flex-row p-4 border-b border-[#E2E2E2]">
                                <div className="item__title-text grow">
                                    Новые заказы
                                </div>
                                <div className="item__title-text grow text-right">
                                    <FontAwesomeIcon icon={faChevronDown} onClick={() => setItemOpen(!itemOpen)}
                                                     className={`transition-transform ${itemOpen ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </div>
                            <AccordionBody>
                                <div className="item__content p-4">
                                    <div className="description muted pb-2">
                                        Тут отображаются необработанные заказы
                                    </div>
                                    <div className="flex flex-col lg:flex-row justify-start gap-3 w-full">
                                        <div className="order_item w-full">
                                            <div className="order_item__info">
                                                <div className="info__item">
                                                    <div className="info__item_list p-3 bg-gray-200 rounded-2xl border-2 border-collapse hover:border-[#b3b3b3] transition">
                                                        <div className="item_box">
                                                            <div className="flex flex-row justify-between items-start">
                                                                <div className="box_title px-2 font-bold muted">
                                                                    ФИО
                                                                    <div className="box_description font-normal">
                                                                        Никита Козлов Алексеевич
                                                                    </div>
                                                                </div>
                                                                <div className="box_title px-2 font-bold muted">
                                                                    Номер заказа
                                                                    <div className="box_description font-normal underline underline-offset-4 cursor-pointer">
                                                                        Y2624-413253
                                                                    </div>
                                                                </div>
                                                                <div className="box_title px-2 font-bold muted">
                                                                    Статус заказа
                                                                    <div className="box_description font-normal">
                                                                        В обработке
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="box_title px-2 font-bold muted pt-2">
                                                                Товар
                                                                <a href="#"
                                                                   className="underline underline-offset-4 font-normal flex justify-between">
                                                                    <div className="item_name">
                                                                        nevermore
                                                                    </div>
                                                                    <div className="item_size">
                                                                        XL
                                                                    </div>
                                                                    <div className="item_color">
                                                                        red
                                                                    </div>
                                                                    <div className="item_count">
                                                                        1шт.
                                                                    </div>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </AccordionBody>
                        </div>
                    </Accordion>
                    <Accordion open={itemOpen} animate={CUSTOM_ANIMATION}>
                        <div
                            className="admin-panel__contents-item w-full border-collapse rounded-lg bg-white max-h-[350px] overflow-visible">
                            <div className="item__title flex flex-row p-4 border-b border-[#E2E2E2]">
                                <div className="item__title-text grow">
                                    Статистика
                                </div>
                                <div className="item__title-text grow text-right">
                                    <FontAwesomeIcon icon={faChevronDown} onClick={() => setItemOpen(!itemOpen)}
                                                     className={`transition-transform ${itemOpen ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </div>
                            <AccordionBody>
                                <div
                                    className="admin-panel__contents-item w-full rounded-lg bg-white overflow-visible">
                                    <div className="flex flex-col lg:flex-row gap-6 items-center lg:justify-around justify-center w-full text-center py-4">
                                        <div className="income_box bg-gray-200 p-3 rounded-2xl border-2 border-collapse hover:border-[#b3b3b3] transition cursor-default">
                                            <div className="income_box__title font-bold text-xl">
                                                Всего заказов
                                            </div>
                                            <div className="income_box__data text-lg">
                                                3 заказов за месяц
                                            </div>
                                        </div>
                                        <div className="income_box bg-gray-200 p-3 rounded-2xl border-2 border-collapse hover:border-[#b3b3b3] transition cursor-default">
                                            <div className="income_box__title font-bold text-xl">
                                                Доходность
                                            </div>
                                            <div className="income_box__data text-lg">
                                                14 228 руб.
                                            </div>
                                        </div>
                                        <div className="income_box bg-gray-200 p-3 rounded-2xl border-2 border-collapse hover:border-[#b3b3b3] transition cursor-default">
                                            <div className="income_box__title font-bold text-xl">
                                                Пользователей
                                            </div>
                                            <div className="income_box__data text-lg">
                                                15 человек
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </AccordionBody>
                        </div>
                    </Accordion>
                </div>

            </div>
        </>
    )
}

export default AdminPanelPage;