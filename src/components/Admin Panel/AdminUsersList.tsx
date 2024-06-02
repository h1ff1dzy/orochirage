import {AdminNavigation} from "./AdminNavigation";
import React, {ChangeEvent, useEffect} from "react";
import {
    Alert,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Chip,
    Dialog,
    IconButton,
    Input,
    Select,
    Tooltip,
    Typography,
    Option, Breadcrumbs, Spinner, DialogHeader, DialogBody, DialogFooter
} from "@material-tailwind/react";
import {
    MagnifyingGlassIcon,
    PencilIcon,
    TrashIcon,
} from "@heroicons/react/24/solid";
import {AppDispatch, RootState} from "../../store/store";
import {useDispatch, useSelector} from "react-redux";
import {fetchUserPermissions, selectError, selectPermissions} from "../../slicers/adminSlice";
import {checkTokenValidity} from "../../slicers/userSlice";
import {toast} from "react-toastify";
import axios from "axios";
import {Link, useLocation} from "react-router-dom";
import Pagination from "../Pagination";
import {Helmet} from "react-helmet";

const AdminUsersList = () => {
    const [isLoading, setIsLoading] = React.useState(true);
    const dispatch: AppDispatch = useDispatch();
    const token = useSelector((state: RootState) => state.user.token);
    const permissions = useSelector((state: RootState) => selectPermissions(state));
    const permissionsError = useSelector((state: RootState) => selectError(state));

    useEffect(() => {
        // Проверяем валидность токена при загрузке компонента
        dispatch(checkTokenValidity());
    }, [dispatch]);

    useEffect(() => {
        // Вы можете вызывать асинхронное действие для загрузки прав пользователя
        dispatch(fetchUserPermissions());
        setIsLoading(false)
    }, [dispatch]);

    useEffect(() => {
        if (permissionsError) {
            toast.error(permissionsError);
        }
    }, [permissionsError]);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('search');

    const [searchTerm, setSearchTerm] = React.useState<string>(searchQuery || '');
    const TABLE_HEAD = ["ФИО", "Почта", "Телефон", "Пол", "Создал аккаунт", "Доступ", ""];



    const [removalAvailable, setRemovalAvailable] = React.useState(false)

    const [removalDialogConfirmText, setRemovalDialogConfirmText] = React.useState("");
    const handleRemovalConfirm = (event: React.ChangeEvent<HTMLInputElement>) => {
        const confirmText = event.target.value;
        setRemovalDialogConfirmText(confirmText);

        if (confirmText.toUpperCase() === `УДАЛИТЬ ${editedUser?.Phone?.toUpperCase()}`) {
            console.log(`${confirmText} == УДАЛИТЬ ${editedUser?.Phone?.toUpperCase()}`);
            setRemovalAvailable(true);
        } else {
            setRemovalAvailable(false);
        }
    };

    const handleRemovalCancel = () => {
        setRemovalDialogConfirmText("")
        setRemovalAvailable(false)
        setRemovalDialog(!removalDialog)
    }

    const [removalDialog, setRemovalDialog] = React.useState(false);

    const handleOpenRemovalDialog = (index: number) => {
        setEditedUser(currentItems?.[index])
        setRemovalDialog(!removalDialog)
    }

    const removeProduct = async (userId: string) => {
        try {
            await axios.post('https://api.orochirage.ru/api/admin/users/remove', { userId }, {
                headers: {
                    Authorization: token
                }
            });
            fetchUsers()
        } catch (error) {
            console.error("Error fetching Products:", error);
        }
    };

    function handleRemoveItem(_id: string) {
        removeProduct(_id).then(() => {
            toast.warning("Пользователь был удален.")
            setRemovalDialogConfirmText("")
            setRemovalAvailable(false)
            setRemovalDialog(!removalDialog)
        })
    }

    interface Roles {
        _id: string;
        roleName: string;
    }

    interface User {
        _id: string;
        Phone: string;
        Sex: string;
        Password: string;
        "First name": string;
        "Second name": string;
        "Middle name": string;
        Email: string;
        Orders: Order[];
        registeredBy: string;
        role: {
            _id: string;
            roleName: string;
        };
        banned: boolean;
    }

    interface Order {
        _id: string;
        price: number;
        date: string;
    }

    const [users, setUsers] = React.useState<User[] | null>(null);
    const [roles, setRoles] = React.useState<Roles[] | null>(null);

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, [token]);

    const fetchRoles = async () => {
        try {
            const response = await axios.post('https://api.orochirage.ru/api/admin/roles/all', null, {
                headers: {
                    Authorization: token
                }
            });
            setRoles(response.data);
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.post('https://api.orochirage.ru/api/admin/users', null, {
                headers: {
                    Authorization: token
                }
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };


    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => { // Явно указываем тип ChangeEvent<HTMLInputElement>
        setSearchTerm(event.target.value);
    };

    const filteredUsers = users && users.filter((user: User) => {
        const formattedDate = formatDate(user.registeredBy); // Форматируем дату

        // Создаем строку для поиска, включая отформатированную дату и имя пользователя
        const fullName = `${user["First name"] || ""} ${user["Second name"] || ""}`;

        // Создаем массив строк для поиска, включая отформатированную дату и имя пользователя
        const searchableStrings = [
            user._id,
            fullName.trim(), // Имя и фамилия пользователя
            user.Email || "", // Проверяем, определен ли адрес электронной почты пользователя
            user.Phone || "", // Проверяем, определен ли номер телефона пользователя
            user.Sex || "", // Проверяем, определен ли пол пользователя
            formattedDate, // Включаем отформатированную дату в массив строк для поиска
            user.role.roleName
        ];

        // Преобразуем в нижний регистр все строки для поиска и ищем совпадение
        const searchTermLower = searchTerm.toLowerCase();
        return searchableStrings.some(str => str.toLowerCase().includes(searchTermLower)) ||
            (searchTermLower === 'забанен' && user.banned);
    });

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const [currentPage, setCurrentPage] = React.useState(1);
    const usersPerPage = 10;
    const indexOfLastOrder = currentPage * usersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - usersPerPage;
    const currentItems = filteredUsers && filteredUsers.slice(indexOfFirstOrder, indexOfLastOrder);

    function formatDate(dateString: string): string {
        const months = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];

        const date = new Date(dateString);
        const day = date.getDate();
        const monthIndex = date.getMonth();
        const year = date.getFullYear();

        return `${day} ${months[monthIndex]}, ${year} года`;
    }



    const [selectedUser, setSelectedUser] = React.useState(0 as number);

    const [editedUser, setEditedUser] = React.useState<User | undefined>(undefined);



    const openEditPanel = (userId: string) => {
        const user = filteredUsers?.find(user => user._id === userId);
        if (user) {
            setEditedUser(user);
            setEditUserPane(true);
        }
    }


    const updateUser = async (changes: User) => {
        try {
            // Изменяем структуру объекта changes, чтобы поле role содержало только _id
            const updatedChanges = {
                ...changes,
                role: changes.role._id // Присваиваем _id из role в поле role
            };

            if(changes._id === "65e791f478efeceb89c9932f" && changes.role._id !== "65ed92ad52536531bce7616b")
                return toast.error("Невозможно изменить корневого пользователя.")

            // Отправляем запрос на сервер для обновления пользователя
            const response = await axios.post('https://api.orochirage.ru/api/admin/user/update', updatedChanges, {
                headers: {
                    Authorization: token
                },
                timeout: 10000
            });

            // Обработка ответа от сервера
            if (response.status === 200) {
                toast.success("Данные пользователя успешно обновлены.");
                await fetchUsers();
            } else if (response.status === 403) {
                toast.error("У вас недостаточно прав.");
                console.error("permission");
            } else {
                toast.error(`Невозможно произвести изменение: ${response.data.message}`);
                console.error('Failed to update user:', response.data.message);
            }
        } catch (error) {
            toast.error("У вас недостаточно прав.");
            console.error('Error updating user:', error);
        }
    };

    const [editUserPane, setEditUserPane] = React.useState(false);
    const handleEditUserPane = (isEdit: boolean) => {
        if(!isEdit)
        {
            setEditUserPane(!editUserPane);
            return;
        }
        // Если панель редактирования пользователя открыта
        if (editUserPane) {
            if (editedUser) {
                updateUser(editedUser);
            } else {
                console.error('Cannot update user: editedUser is undefined');
            }
        }
        // Закрываем/открываем панель редактирования пользователя
        setEditUserPane(!editUserPane);
    };

    const [removeUserPane, setRemoveUserPane] = React.useState(false);
    const handleRemoveUserPane = () => setRemoveUserPane(!removeUserPane);

    const [banUserPane, setBanUserPane] = React.useState(false);
    const handleBanUserPane = () => setBanUserPane(!banUserPane);



    if(isLoading)
        return (
            <>
                <div className="flex items-center justify-center h-[calc(100vh-30rem)] w-full"><Spinner className="h-12 w-12" /></div>
            </>
        )

    if(!token)
    {
        window.location.href = '/user';
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

    if(!permissions.viewUserCredentials)
        return (
            <>
                <div className="p-8">
                    <div className="font-semibold text-xl">У вас недостаточно прав на просмотр данных пользователей.</div>
                    <div>Если вы считаете что это ошибка, обратитесь к администратору.</div>
                </div>
            </>
        )

    const handleEditUserChange = (field: string, value: any) => {
        console.log(editedUser?.role._id)
        console.log(`field: ${field} | value: ${value}`)
        setEditedUser(prevState => ({
            ...prevState!,
            [field]: value,
        }));
    };


    return (
        <>
            <Helmet>
                <title>OROCHI - Список пользователей</title>
            </Helmet>
            <Dialog size="xs" open={removalDialog} handler={handleOpenRemovalDialog}>
                <DialogHeader >Вы собираетесь удалить {editedUser?.Phone}</DialogHeader>
                <DialogBody >
                    <div className="flex flex-col gap-4">
                        Для удаление пользователя вам нужно подтвердить это действие.
                        Напишите в поле ниже <span className="font-bold inline uppercase text-sm font-mono">УДАЛИТЬ {editedUser?.Phone}</span>
                        <Alert color="amber">
                            <Typography className="font-bold">
                                Внимание
                            </Typography>
                            <Typography className="font-normal">
                                Это действие не рекомендуемо и необратимо. Удаление пользователя удалит всё что связанно с этим пользователем.
                            </Typography>
                        </Alert>
                        <Input className="uppercase font-mono" value={removalDialogConfirmText} onChange={handleRemovalConfirm} crossOrigin label="Введите текст для подтверждения"/>
                    </div>
                </DialogBody>
                <DialogFooter >
                    <Button
                            variant="text"
                            color="red"
                            onClick={handleRemovalCancel}
                            className="mr-1"
                    >
                        <span>Отменить</span>
                    </Button>
                    <Button disabled={!removalAvailable} variant="gradient" color="green" onClick={() => handleRemoveItem(editedUser?._id as string)}>
                        <span>Подтвердить</span>
                    </Button>
                </DialogFooter>
            </Dialog>

            <Dialog open={editUserPane} size="xs" className="bg-transparent shadow-none" handler={handleEditUserPane}>
                <Card className="mx-auto max-h-[100vh] w-full max-w-[24rem] !overflow-scroll" >
                    <CardBody className="flex flex-col gap-[0.725rem] lg:gap-4" >
                        <Typography variant="h4" className="text-sm lg:text-xl" color="blue-gray">
                            Редактирование пользователя {editedUser?.Phone}
                        </Typography>
                        <Typography
                                    className="mb-3 font-normal hidden lg:block"
                                    variant="paragraph"
                                    color="gray"
                        >
                            {permissions.banUsers && permissions.changeUserCredentials && permissions.viewUserOrders && permissions.changeUserRoles ? "У вас полные права на редактирование" : "У вас не полные права на редактирование"}
                        </Typography>
                        <Typography  className="-mb-2 text-xs lg:text-base" variant="h6">
                            Email
                        </Typography>
                        <Input onChange={(e) => handleEditUserChange("Email", e.target.value)} crossOrigin value={editedUser?.Email || ""} label="Email" size="lg" />
                        <Typography  className="-mb-2 text-xs lg:text-base" variant="h6">
                            Номер телефона
                        </Typography>
                        <Input onChange={(e) => handleEditUserChange("Phone", e.target.value)} crossOrigin maxLength={11} value={editedUser?.Phone}  label="Номер телефона" size="lg" />
                        <Typography  className="-mb-2 text-xs lg:text-base" variant="h6">
                            Email
                        </Typography>
                        <Input onChange={(e) => handleEditUserChange("Password", e.target.value)} crossOrigin value={editedUser?.Email || ""} label="Email" size="lg" />
                        <Typography className="-mb-2 text-xs lg:text-base" variant="h6">
                            Доступ
                        </Typography>
                        <Select

                            value={editedUser?.role._id || ""} // Устанавливаем значение из состояния editedUser?.role._id, если он определен
                            label="Выберите роль"
                            onChange={(value) => handleEditUserChange("role._id", value)} // Обработчик изменения для роли
                        >
                            {roles && roles?.map((role, index) => (
                                <Option index={index+1} key={role._id} value={role._id}>{role.roleName}</Option>
                            ))}
                        </Select>



                        <Typography  className="-mb-2 text-xs lg:text-base" variant="h6">
                            Пароль
                        </Typography>
                        <Input onChange={(e) => handleEditUserChange("Password", e.target.value)} crossOrigin label="Пароль" size="lg" />
                        <Typography className="-mb-2 text-xs lg:text-base" variant="h6">
                            Имя
                        </Typography>
                        <Input onChange={(e) => handleEditUserChange("First name", e.target.value)} crossOrigin value={editedUser?.["First name"]} label="Имя" size="lg" />
                        <Typography className="-mb-2 text-xs lg:text-base" variant="h6">
                            Фамилия
                        </Typography>
                        <Input onChange={(e) => handleEditUserChange("Second name", e.target.value)} crossOrigin value={editedUser?.["Second name"]} label="Фамилия" size="lg" />
                        <Typography className="-mb-2 text-xs lg:text-base" variant="h6">
                            Пол
                        </Typography>
                        <Select
                            value={editedUser?.Sex} // Устанавливаем значение editedUser?.Sex

                            variant="outlined"
                            label="Выберите пол"
                            onChange={(value) => handleEditUserChange("Sex", value)} // Обработчик изменения для Sex
                        >
                            <Option key="male" value="male">Мужской</Option>
                            <Option key="female" value="female">Женский</Option>
                            <Option key="unknown" value="unknown">Неизвестно</Option>
                        </Select>
                    </CardBody>
                    <CardFooter className="pt-0 flex flex-col gap-4 lg:gap-12">
                        <Link className="w-full" to={`/user/admin/users/${editedUser?._id}/orders`}>
                            <Button variant="outlined" className="w-full flex items-center justify-center gap-2">
                                Просмотреть заказы{" "}
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
                                        d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                                    />
                                </svg>
                            </Button>
                        </Link>
                        <div className="pt-0 flex flex-row gap-2 mb-24 lg:mb-0">
                            <Button
                                    variant="text"
                                    color="red"
                                    onClick={() => handleEditUserPane(false)}
                                    className="mr-1"
                            >
                                <span>Отмена</span>
                            </Button>
                            <Button className="grow" variant="gradient" color="green" onClick={() => handleEditUserPane(true)}>
                                Изменить пользователя
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </Dialog>

            <Dialog open={banUserPane} size="xs" className="bg-transparent shadow-none" handler={handleBanUserPane}>
                <Card className="mx-auto w-full max-w-[24rem]" >
                    <CardBody className="flex flex-col gap-4" >
                        <Typography variant="h4" color="blue-gray">
                            Создание нового пользователя
                        </Typography>
                        <Typography
                                    className="mb-3 font-normal"
                                    variant="paragraph"
                                    color="gray"
                        >
                            Введите данные пользователя
                        </Typography>
                        <Typography className="-mb-2" variant="h6">
                            Email
                        </Typography>
                        <Input crossOrigin label="Email" size="lg" />
                        <Typography className="-mb-2" variant="h6">
                            Пароль
                        </Typography>
                        <Input crossOrigin label="Пароль" size="lg" />
                        <Typography className="-mb-2" variant="h6">
                            Имя
                        </Typography>
                        <Input crossOrigin label="Имя" size="lg" />
                        <Typography className="-mb-2" variant="h6">
                            Фамилия
                        </Typography>
                        <Input crossOrigin label="Фамилия" size="lg" />
                    </CardBody>
                    <CardFooter className="pt-0 flex flex-row gap-2">
                        <Button
                                variant="text"
                                color="red"
                                onClick={() => handleBanUserPane()}
                                className="mr-1"
                        >
                            <span>Отмена</span>
                        </Button>
                        <Button className="grow" variant="gradient" color="green" onClick={handleBanUserPane}>
                            Создать пользователя
                        </Button>
                    </CardFooter>
                </Card>
            </Dialog>


            <AdminNavigation/>
            <Breadcrumbs className="px-12 pt-8 pb-6 !bg-transparent hidden lg:flex" >
                <Link to="/user/admin/" className="opacity-60">
                    Панель управления
                </Link>
                <Link to="/user/admin/users" onClick={() => setSearchTerm("")} className={`${searchQuery && "opacity-60"}`}>
                    Пользователи
                </Link>
                {searchQuery && (
                    <Link to="/user/admin/users" className="">
                        Пользователь {searchQuery}
                    </Link>
                )}
            </Breadcrumbs>
            <div className="flex flex-col w-full items-center justify-center self-center p-8">
                <Card className="h-full w-full">
                    <CardHeader floated={false} shadow={false} className="rounded-none">
                        <div className="mb-8 flex items-center justify-between gap-4 lg:gap-8">
                            <div>
                                <Typography variant="h5" color="blue-gray">
                                    Список пользователей
                                </Typography>
                                <Typography color="gray" className="mt-1 font-normal ">
                                    Список всех зарегистрированых пользователей на сайте
                                </Typography>
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                            <div className="w-full md:w-72 lg:w-full">
                                <Input crossOrigin
                                       label="Поиск"
                                       onChange={handleSearch} // Обработчик изменения значения поиска
                                       value={searchTerm} // Значение поиска
                                       icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody className="overflow-scroll px-0">
                        {!filteredUsers ? (                         <div className="flex items-center gap-2 pl-5">
                                <div className="flex flex-col text-center">
                                    <Typography
                                                variant="small"
                                                color="blue-gray"
                                                className="font-normal"
                                    >
                                        Результатов поиска не найдено
                                    </Typography>
                                </div>
                            </div>) :
                            filteredUsers.length <= 0 ? (
                                <div className="flex items-center gap-2 pl-5">
                                    <div className="flex flex-col text-center">
                                        <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-normal"
                                        >
                                            Результатов поиска не найдено
                                        </Typography>
                                    </div>
                                </div>
                            ) : (
                                <table className="mt-4 w-full min-w-max table-auto text-left">
                                    <thead>
                                    <tr>
                                        {TABLE_HEAD.map((head) => (
                                            <th
                                                key={head}
                                                className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                                            >
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
                                    {currentItems && currentItems.map((user, index) => {
                                        const isLast = index === filteredUsers.length - 1;
                                        const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";
                                        return (
                                            <tr key={user._id}>
                                                <td className={classes}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex flex-col">
                                                            <Typography variant="small" color="blue-gray"
                                                                        className="font-normal">
                                                                {(user["First name"] || "Неизвестно") + " "}{user["Second name"] || ""}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={classes}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex flex-col">
                                                            <Typography variant="small" color="blue-gray"
                                                                        className="font-normal">
                                                                {user.Email || "Не указан"}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={classes}>
                                                    <div className="flex flex-col">
                                                        <Typography variant="small" color="blue-gray"
                                                                    className="font-normal">
                                                            {user.Phone}
                                                        </Typography>
                                                        <Typography variant="small" color="blue-gray"
                                                                    className="font-normal opacity-70">
                                                            Российский код номера
                                                        </Typography>
                                                    </div>
                                                </td>
                                                <td className={classes}>
                                                    <div className="flex flex-col">
                                                        <Typography variant="small" color="blue-gray"
                                                                    className="font-normal">
                                                            {(() => {
                                                                switch (user.Sex) {
                                                                    case 'male':
                                                                        return <span>Мужской</span>;
                                                                    case 'female':
                                                                        return <span>Женский</span>;
                                                                    default:
                                                                        return <span>Другой</span>;
                                                                }
                                                            })()}
                                                        </Typography>
                                                    </div>
                                                </td>
                                                <td className={classes}>
                                                    <Typography variant="small" color="blue-gray"
                                                                className="font-normal">
                                                        {formatDate(user.registeredBy)}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <Typography variant="small" color="blue-gray"
                                                                className="font-normal">
                                                        <div className="w-max">
                                                            <Chip size="sm" variant="gradient"
                                                                  value={user.role.roleName} color="blue-gray"/>
                                                        </div>
                                                    </Typography>
                                                </td>
                                                <td className={`${classes} text-right`}>
                                                    <Tooltip content="Редактировать">
                                                        <IconButton disabled={!permissions.changeUserCredentials}
                                                                    onClick={() => openEditPanel(user._id)}
                                                                    variant="text">
                                                            <PencilIcon className="h-4 w-4"/>
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip content="Удалить">
                                                        <IconButton onClick={() => handleOpenRemovalDialog(index)}
                                                                    disabled={!permissions.removeUsers} variant="text">
                                                            <TrashIcon className="h-4 w-4"/>
                                                        </IconButton>
                                                    </Tooltip>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>

                                </table>)}
                    </CardBody>
                    <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
                        <Pagination currentPage={currentPage} itemsPerPage={usersPerPage}
                                    totalItems={filteredUsers?.length || 0} paginate={paginate}/>
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}

export default AdminUsersList;