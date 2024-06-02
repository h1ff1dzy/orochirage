import {AdminNavigation} from "../AdminNavigation";
import React, {ChangeEvent, useEffect, useState} from "react";
import {
    Breadcrumbs, Button,
    Card,
    CardBody, CardFooter,
    CardHeader, Dialog, DialogBody, DialogFooter, DialogHeader,
    Drawer,
    IconButton,
    Input,
    Spinner,
    Textarea,
    Typography
} from "@material-tailwind/react";
import {AppDispatch, RootState} from "../../../store/store";
import {useDispatch, useSelector} from "react-redux";
import {fetchUserPermissions, selectError, selectPermissions} from "../../../slicers/adminSlice";
import {checkTokenValidity} from "../../../slicers/userSlice";
import axios from "axios";
import {Link, useLocation} from "react-router-dom";
import {MagnifyingGlassIcon, PlusIcon} from "@heroicons/react/24/solid";
import Pagination from "../../Pagination";
import {toast} from "react-toastify";
import CardImageUpload from "../SelfComponents/CardImageUpload";
import CarouselImageUpload from "../SelfComponents/CarouselImageUpload";
import {Helmet} from "react-helmet";

const AdminCollectionsList = () => {

    interface Collections {
        _id: string;
        name: string;
        link: string;
        items: string[];
        description: string;
        createdBy: string;
        carousel_img: string;
        card_img: string;
    }

    const dispatch: AppDispatch = useDispatch();
    const token = useSelector((state: RootState) => state.user.token);
    const [isLoading, setIsLoading] = React.useState(true);
    const permissions = useSelector((state: RootState) => selectPermissions(state));
    const permissionsError = useSelector((state: RootState) => selectError(state));
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('search');
    const [searchTerm, setSearchTerm] = React.useState<string>(searchQuery || '');
    const [responseWait, setResponseWait] = React.useState(false);

    const [openCreateCollection, setOpenCreateCollection] = React.useState(false);
    const openCreateCollectionDrawer = () => setOpenCreateCollection(true);
    const closeCreateCollectionDrawer = () => setOpenCreateCollection(false);

    const [newCollection, setNewCollection] = useState<Collections>({
        _id: "",
        name: "",
        link: "",
        items: [],
        description: "",
        createdBy: "",
        card_img: "",
        carousel_img: ""
    });


    const TABLE_HEAD = ["Название", "ID (Ссылка)", "Количество товаров", "Описание", "Дата создания", ""];

    const [collections, setCollection] = useState<Collections[] | null>(null)

    const [editedCollection, setEditedCollection] = React.useState<Collections | undefined>(undefined);

    useEffect(() => {
        // Проверяем валидность токена при загрузке компонента
        dispatch(checkTokenValidity());
    }, [dispatch]);

    useEffect(() => {
        // Вы можете вызывать асинхронное действие для загрузки прав пользователя
        dispatch(fetchUserPermissions());
        setIsLoading(false)
    }, [dispatch]);

    const [openEditCollection, setOpenEditCollection] = React.useState(false);

    const handleOpenEditItem = (index: number) => {
        if(currentItems){
            setEditedCollection(currentItems[index])
            openCollectionEdit()
        }

    }

    const [removalAvailable, setRemovalAvailable] = React.useState(false)

    const [removalDialogConfirmText, setRemovalDialogConfirmText] = React.useState("");
    const handleRemovalConfirm = (event: React.ChangeEvent<HTMLInputElement>) => {
        const confirmText = event.target.value;
        setRemovalDialogConfirmText(confirmText);

        if (confirmText.toUpperCase() === `УДАЛИТЬ ${editedCollection?.name?.toUpperCase()}`) {
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
        setEditedCollection(currentItems?.[index])
        setRemovalDialog(!removalDialog)
    }

    const removeProduct = async (collectionId: string) => {
        try {
            const response = await axios.post('https://api.orochirage.ru/api/admin/collection/remove', { collectionId }, {
                headers: {
                    Authorization: token
                }
            });
            fetchCollection()
        } catch (error) {
            console.error("Error fetching Products:", error);
        }
    };

    function handleRemoveItem(_id: string) {
        removeProduct(_id).then(() => {
            console.log(_id)
            toast.warning("Коллекция была удалена.")
            setRemovalDialogConfirmText("")
            setRemovalAvailable(false)
            setRemovalDialog(!removalDialog)
        })
    }

    const handleNewCollectionEdit = (field: string, value: any) => {
        setNewCollection(prevState => ({
            ...prevState!,
            [field]: value,
        }));
    };

    const createNewCollection = async () => {
        try {
            // Отправляем запрос на сервер для создания новой коллекции
            const response = await axios.post('https://api.orochirage.ru/api/admin/collection/new', newCollection, {
                headers: {
                    Authorization: token,
                },
                timeout: 10000,
            });

            if (response.status === 200) {
                toast.success("Коллекция успешно создана.");
                fetchCollection()
            } else {
                // Показываем toast с сообщением об ошибке
                toast.error("Ошибка при создании коллекции.");
            }
        } catch (error) {
            // Показываем toast с сообщением об ошибке
            toast.error("Ошибка при создании коллекции.");
        }
    };


    const handleUpdateCollection = () => {
        if(editedCollection){
            setResponseWait(true);
            updateCollection(editedCollection).then(() => {
                setResponseWait(false);
                closeCollectionEdit()
            })
        }
    }

    const updateCollection = async (changes: Collections) => {
        try {
            // Отправляем запрос на сервер для обновления пользователя
            const response = await axios.post('https://api.orochirage.ru/api/admin/collection/update', changes, {
                headers: {
                    Authorization: token
                },
                timeout: 10000
            }).then(async (response) => {
                if (response.status === 200) {
                    toast.success("Данные коллекции успешно обновлены.")
                    await fetchCollection();
                } else if (response.status === 403) {
                    toast.error("У вас недостаточно прав.")
                    console.error("permission")
                } else if (response.status === 500) {
                    toast.error("Ошибка сервера")
                    console.error("permission")
                } else {
                    toast.error(`Невозможно произвести изменение: ${response.data.message}`)
                    console.error('Failed to update user:', response.data.message);
                }
            }).catch((response) => {
                toast.error("У вас недостаточно прав.")
            });
        } catch (error) {

            console.error('Error updating user:', error);
        }
    };

    const closeCollectionEdit = () => setOpenEditCollection(false);
    const openCollectionEdit = () => setOpenEditCollection(true);


    const fetchCollection = async () => {
        try {
            const response = await axios.get<Collections[]>(`https://api.orochirage.ru/api/collections/products`, { timeout: 10000 });
            setCollection(response.data);
        } catch (error) {
            console.error('Error fetching collection:', error);
        }
    }

    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => { // Явно указываем тип ChangeEvent<HTMLInputElement>
        setSearchTerm(event.target.value);
    };

    useEffect(() => {
        fetchCollection();
    }, [token, permissions]);

    const filteredCollections = collections && collections.filter((collection: Collections) => {
        // Создаем массив строк для поиска и преобразуем их в нижний регистр
        let searchableStrings = [
            collection._id.toLowerCase(),
            collection.description.toLowerCase(),
            collection.name.toLowerCase(),
            collection.link.toLowerCase(),
            formatDate(collection.createdBy).toLowerCase() // Добавляем дату поиска, преобразованную в нижний регистр
        ];

        // Преобразуем в нижний регистр строку для поиска
        const searchTermLower = searchTerm.toLowerCase();

        // Проверяем вхождение строки для поиска в преобразованные строки массива
        return searchableStrings.some(str => str.includes(searchTermLower));
    });



    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    function formatDate(dateString: string): string {
        const months = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];

        const date = new Date(dateString);
        const day = date.getDate();
        const monthIndex = date.getMonth();
        const year = date.getFullYear();

        return `${day} ${months[monthIndex]}, ${year} года`;
    }

    const [currentPage, setCurrentPage] = React.useState(1);
    const collectionsPerPage = 3;
    const indexOfLastOrder = currentPage * collectionsPerPage;
    const indexOfFirstOrder = indexOfLastOrder - collectionsPerPage;
    const currentItems = filteredCollections && filteredCollections.slice(indexOfFirstOrder, indexOfLastOrder);

    const handleCollectionEdit = (field: string, value: any) => {
        setEditedCollection(prevState => ({
            ...prevState!,
            [field]: value,
        }));
    };

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

    return (
        <>
            <Helmet>
                <title>OROCHI - Список коллекций</title>
            </Helmet>
            <Dialog size="xs" open={removalDialog} handler={handleOpenRemovalDialog}>
                <DialogHeader >Вы собираетесь удалить {editedCollection?.name}</DialogHeader>
                <DialogBody >
                    <div className="flex flex-col gap-4">
                        Для удаление продукта вам нужно подтвердить это действие.
                        Напишите в поле ниже <span className="font-bold inline uppercase text-sm font-mono">УДАЛИТЬ {editedCollection?.name}</span>
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
                    <Button disabled={!removalAvailable} variant="gradient" color="green" onClick={() => handleRemoveItem(editedCollection?._id as string)}>
                        <span>Подтвердить</span>
                    </Button>
                </DialogFooter>
            </Dialog>

            <Drawer placement="right" open={openCreateCollection} onClose={closeCreateCollectionDrawer} className="p-4 overflow-auto">
                <div className="flex flex-col flex-1 h-full">
                    <div className="mb-6 flex items-center justify-between">
                        <Typography variant="h5" color="blue-gray">
                            Создание новой коллекции
                        </Typography>
                        <IconButton variant="text" color="blue-gray" onClick={closeCreateCollectionDrawer}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </IconButton>
                    </div>
                    <div className="flex gap-2 flex-col h-full">
                        <Typography color="gray" className="mb-8 pr-4 font-normal">
                            Заполните данные для создания новой коллекции.
                        </Typography>
                        <div className="items flex flex-col gap-3">
                            <div className="item flex flex-col gap-1">
                                <div className="text-sm font-inter font-semibold">Название коллекции</div>
                                <Input onChange={(e) => handleNewCollectionEdit("name", e.target.value)} value={newCollection.name} className="block" crossOrigin label="Название" />
                            </div>
                            <div className="item flex flex-col gap-1">
                                <div className="text-sm font-inter font-semibold">Ссылка на коллекцию</div>
                                <Input onChange={(e) => handleNewCollectionEdit("link", e.target.value)} value={newCollection.link} className="block" crossOrigin label="Ссылка" />
                                <div className="text-xs muted opacity-60 mt-1 font-inter font-semibold">http://orochirage.ru/collection/<span className="font-bold">{newCollection.link}</span></div>
                            </div>
                            <div className="item flex flex-col gap-1">
                                <div className="text-sm font-inter font-semibold">Описание</div>
                                <Textarea onChange={(e) => handleNewCollectionEdit("description", e.target.value)} value={newCollection.description} className="focus:outline-none focus:ring-0" label="Описание" />
                            </div>
                            <div className="item flex flex-col gap-1">
                                <div className="text-sm font-inter font-semibold">Фотография в карточке</div>
                                <div className="text-sm muted">Фотографию можно изменить после создания</div>
                            </div>
                            <div className="item flex flex-col gap-1">
                                <div className="text-sm font-inter font-semibold">Фотография в каруселе</div>
                                <div className="text-sm muted">Фотографию можно изменить после создания</div>
                            </div>
                        </div>
                        <div className="grow flex items-end mb-8 lg:mb-0">
                            <div className="gap-2 flex grow my-6">
                                <Button onClick={() => closeCreateCollectionDrawer()} color="red" variant="text">
                                    Отмена
                                </Button>
                                <Button onClick={() => createNewCollection()} color="green" className="grow" variant="gradient">
                                    Создать
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Drawer>

            <Drawer placement="right" open={openEditCollection} onClose={closeCollectionEdit} className="p-4 overflow-auto">
                <div className="flex flex-col flex-1 h-full">
                    <div className="mb-6 flex items-center justify-between">
                        <Typography variant="h5" color="blue-gray">
                            Коллекция {editedCollection?.name}
                        </Typography>
                        <IconButton variant="text" color="blue-gray" onClick={closeCollectionEdit}>
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
                            Вы собираетесь отредактировать коллекцию.
                        </Typography>
                        <div className="items flex flex-col gap-3">
                            <div className="item flex flex-col gap-1">
                                <div className="text-sm font-inter font-semibold">Название коллекции</div>
                                <Input onChange={(e) => handleCollectionEdit("name", e.target.value)} value={editedCollection?.name} className="block " crossOrigin label="Название" />
                            </div>
                            <div className="item flex flex-col gap-1">
                                <div className="text-sm font-inter font-semibold">Ссылка на коллекцию</div>
                                <Input onChange={(e) => handleCollectionEdit("link", e.target.value)} value={editedCollection?.link} className="block" crossOrigin label="Ссылка" />
                                <div className="text-xs muted opacity-60 mt-1 font-inter font-semibold">http://orochirage.ru/collection/<span className="font-bold">{editedCollection?.link}</span></div>
                            </div>
                            <div className="item flex flex-col gap-1">
                                <div className="text-sm font-inter font-semibold">Фотография в карточке</div>
                                <CardImageUpload itemId={editedCollection?._id || ""} imageLink={editedCollection?.card_img} token={token || ""}/>
                            </div>
                            <div className="item flex flex-col gap-1">
                                <div className="text-sm font-inter font-semibold">Фотография в каруселе</div>
                                <CarouselImageUpload itemId={editedCollection?._id || ""} imageLink={editedCollection?.carousel_img} token={token || ""}/>
                            </div>
                        </div>
                        <div className="item flex flex-col gap-1">
                            <div className="text-sm font-inter font-semibold">Описание</div>
                            <Textarea onChange={(e) => handleCollectionEdit("description", e.target.value)} value={editedCollection?.description} className="focus:outline-none focus:ring-0" label="Описание" />
                        </div>
                    </div>
                    <div className="grow flex items-end ">
                        <div className="gap-2 flex grow my-8 lg:mb-4">
                            <Button onClick={() => closeCollectionEdit()} color="red" variant="text">
                                Отмена
                            </Button>
                            <Button onClick={() => handleUpdateCollection()} color="green" className="grow" variant="gradient">Изменить</Button>
                        </div>
                    </div>
                </div>
            </Drawer>
            <AdminNavigation/>
            <Breadcrumbs className="px-12 pt-8 pb-6 !bg-transparent hidden lg:flex" >
                <Link to="/user/admin/" className="opacity-60">
                    Панель управления
                </Link>
                <Link to="/user/items/" className="o">
                    Коллекции
                </Link>
            </Breadcrumbs>
            <div className="flex flex-col w-full items-center justify-center self-center p-8">
                <Card className="h-full w-full">
                    <CardHeader floated={false} shadow={false} className="rounded-none">
                        <div className="mb-8 flex items-center justify-between gap-4 lg:gap-8">
                            <div>
                                <Typography variant="h5" color="blue-gray">
                                    Список коллекций
                                </Typography>
                                <Typography color="gray" className="mt-1 font-normal ">
                                    Список всех доступных коллекций на сайте
                                </Typography>
                            </div>
                            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                                    <Button onClick={openCreateCollectionDrawer} color="green" variant="gradient" className="flex items-center gap-3" size="sm">
                                        <PlusIcon strokeWidth={2} className="h-4 w-4" /> Создать коллекцию
                                    </Button>
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
                    <CardBody className="overflow-auto px-0">
                        {!filteredCollections ? (                         <div className="flex items-center gap-2 pl-5">
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
                            filteredCollections.length <= 0 ? (
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
                                    {currentItems && currentItems.map(
                                        (collection, index) => {
                                            const isLast = index === currentItems.length - 1;
                                            const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";
                                            return (
                                                <tr key={collection._id}>
                                                    <td className={classes}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                            variant="small"
                                                                            color="blue-gray"
                                                                            className="font-normal"
                                                                >
                                                                    {collection.name}
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={classes}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                            variant="small"
                                                                            color="blue-gray"
                                                                            className="font-normal"
                                                                >
                                                                    {collection.link}
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={classes}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                            variant="small"
                                                                            color="blue-gray"
                                                                            className="font-normal"
                                                                >
                                                                    {collection.items.length}
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={classes}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex flex-col">
                                                                {collection.description}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={classes}>
                                                        <div className="flex flex-col">
                                                            <Typography variant="small" color="blue-gray">
                                                                {formatDate(collection.createdBy)}
                                                            </Typography>
                                                        </div>
                                                    </td>
                                                    <td className={classes}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex flex-row items-center gap-2">
                                                                <Button onClick={() => handleOpenEditItem(index)}
                                                                        color="gray"
                                                                        variant="text"
                                                                        >
                                                                    Редактировать
                                                                </Button>
                                                                <Button
                                                                    onClick={() => handleOpenRemovalDialog(index)}
                                                                    color="red"
                                                                    variant="text"
                                                                    >
                                                                    Удалить
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        },
                                    )}
                                    </tbody>
                                </table>)}
                    </CardBody>
                    <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
                        <Pagination currentPage={currentPage} itemsPerPage={collectionsPerPage} totalItems={filteredCollections?.length || 0} paginate={paginate}/>
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}

export default AdminCollectionsList;