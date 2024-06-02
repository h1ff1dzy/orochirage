import {
    Breadcrumbs,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader, Dialog, DialogBody, DialogFooter, DialogHeader,
    Input,
    Spinner,
    Typography
} from "@material-tailwind/react";
import React, {ChangeEvent, useEffect, useState} from "react";
import {Link, useLocation} from "react-router-dom";
import {AppDispatch, RootState} from "../../../store/store";
import {useDispatch, useSelector} from "react-redux";
import {fetchUserPermissions, selectError, selectPermissions} from "../../../slicers/adminSlice";
import {AdminNavigation} from "../AdminNavigation";
import {MagnifyingGlassIcon, PlusIcon} from "@heroicons/react/24/solid";
import Pagination from "../../Pagination";
import {checkTokenValidity} from "../../../slicers/userSlice";
import axios from "axios";
import {toast} from "react-toastify";
import {Helmet} from "react-helmet";

const AdminCategories = () => {

    interface Subcategory{
        name: string;
        link: string;
        products: string[];
        _id: string;
    }

    interface Category{
        _id: string;
        name: string;
        link: string;
        items: Subcategory[];
        createdBy: string;
    }

    const [isLoading, setIsLoading] = React.useState(true);
    const dispatch: AppDispatch = useDispatch();
    const token = useSelector((state: RootState) => state.user.token);
    const permissions = useSelector((state: RootState) => selectPermissions(state));
    const permissionsError = useSelector((state: RootState) => selectError(state));

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('search');
    const [searchTerm, setSearchTerm] = React.useState<string>(searchQuery || '');

    const [categories, setCategories] = useState<Category[] | null>(null)
    const [editedCategories, setEditedCategories] = React.useState<Category | undefined>(undefined);


    const filteredCategories = categories && categories.filter((category: Category) => {
        // Создаем массив строк для поиска
        let searchableStrings = [
            category._id.toLowerCase(),
            category.name.toLowerCase(),
            category.link.toLowerCase(),
            formatDate(category.createdBy).toLowerCase()
        ];

        // Добавляем имена подкатегорий
        category.items.forEach(subcategory => {
            searchableStrings.push(subcategory.name.toLowerCase());
        });

        // Преобразуем в нижний регистр строку для поиска
        const searchTermLower = searchTerm.toLowerCase();

        // Проверяем вхождение строки для поиска в преобразованные строки массива
        return searchableStrings.some(str => str.includes(searchTermLower));
    });


    const [currentPage, setCurrentPage] = React.useState(1);
    const categoriesPerPage = 3;
    const indexOfLastOrder = currentPage * categoriesPerPage;
    const indexOfFirstOrder = indexOfLastOrder - categoriesPerPage;
    const currentItems = filteredCategories && filteredCategories.slice(indexOfFirstOrder, indexOfLastOrder);

    useEffect(() => {
        // Проверяем валидность токена при загрузке компонента
        dispatch(checkTokenValidity());
    }, [dispatch]);

    useEffect(() => {
        // Вы можете вызывать асинхронное действие для загрузки прав пользователя
        dispatch(fetchUserPermissions());
        setIsLoading(false)
    }, [dispatch]);

    function handleRemoveItem(_id: string) {
        removeCategory(_id).then(() => {
            toast.warning("Категория была удалена.")
            setRemovalDialogConfirmText("")
            setRemovalAvailable(false)
            setRemovalDialog(!removalDialog)
        })
    }

    const fetchCategories = async () => {
        try {
            const response = await axios.get<Category[]>(`https://api.orochirage.ru/api/categories/`, { timeout: 10000 });
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching collection:', error);
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [token])

    const TABLE_HEAD = [
        "Название категории",
        "Ссылка категории",
        "Подкатегории",
        "Дата создания",
        "",
    ];

    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => { // Явно указываем тип ChangeEvent<HTMLInputElement>
        setSearchTerm(event.target.value);
    };

    const [removalAvailable, setRemovalAvailable] = React.useState(false)

    const [removalDialogConfirmText, setRemovalDialogConfirmText] = React.useState("");
    const handleRemovalConfirm = (event: React.ChangeEvent<HTMLInputElement>) => {
        const confirmText = event.target.value;
        setRemovalDialogConfirmText(confirmText);

        if (confirmText.toUpperCase() === `УДАЛИТЬ ${editedCategories?.name?.toUpperCase()}`) {
            console.log(`${confirmText} == УДАЛИТЬ ${editedCategories?.name?.toUpperCase()}`);
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
        setEditedCategories(currentItems?.[index])
        setRemovalDialog(!removalDialog)
    }

    const removeCategory = async (categoryId: string) => {
        try {
            const response = await axios.post('https://api.orochirage.ru/api/admin/category/remove', { categoryId }, {
                headers: {
                    Authorization: token
                }
            });
            fetchCategories()
        } catch (error) {
            console.error("Error fetching Products:", error);
        }
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

    function formatDate(dateString: string): string {
        const months = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];

        const date = new Date(dateString);
        const day = date.getDate();
        const monthIndex = date.getMonth();
        const year = date.getFullYear();

        return `${day} ${months[monthIndex]}, ${year} года`;
    }

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    return (
        <>
            <Helmet>
                <title>OROCHI - Список категорий</title>
            </Helmet>
            <AdminNavigation/>
            <Dialog size="xs" open={removalDialog} handler={handleOpenRemovalDialog}>
                <DialogHeader >Вы собираетесь удалить {editedCategories?.name}</DialogHeader>
                <DialogBody >
                    <div className="flex flex-col gap-4">
                        Для удаление продукта вам нужно подтвердить это действие.
                        Напишите в поле ниже <span className="font-bold inline uppercase text-sm font-mono">УДАЛИТЬ {editedCategories?.name}</span>
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
                    <Button disabled={!removalAvailable} variant="gradient" color="green" onClick={() => handleRemoveItem(editedCategories?._id as string)}>
                        <span>Подтвердить</span>
                    </Button>
                </DialogFooter>
            </Dialog>
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
                                <Link to="/user/admin/categories/new">
                                    <Button color="green" variant="gradient" className="flex items-center gap-3" size="sm">
                                            <PlusIcon strokeWidth={2} className="h-4 w-4" /> Создать категорию
                                    </Button>
                                </Link>
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
                        {!filteredCategories ? (                         <div className="flex items-center gap-2 pl-5">
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
                            filteredCategories.length <= 0 ? (
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
                                        (category, index) => {
                                            const isLast = index === currentItems.length - 1;
                                            const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";
                                            return (
                                                <tr key={category._id}>
                                                    <td className={classes}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                            variant="small"
                                                                            color="blue-gray"
                                                                            className="font-normal"
                                                                >
                                                                    {category.name}
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
                                                                    {category.link}
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={classes}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex flex-col w-full">
                                                                {category.items.map((item) => (
                                                                    <div className="text-sm font-semibold">
                                                                        {item.name}
                                                                        <span className="muted font-semibold opacity-65 flex flex-col">
                                                                            ссылка: {item.link}
                                                                        </span>
                                                                        <span className="muted font-semibold opacity-65">
                                                                            количество товаров: {item.products.length}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={classes}>
                                                        <div className="flex flex-col">
                                                            <Typography variant="small" color="blue-gray">
                                                                {formatDate(category.createdBy)}
                                                            </Typography>
                                                        </div>
                                                    </td>
                                                    <td className={classes}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex flex-row items-center gap-2">
                                                                <Link to={`/user/admin/categories/${category._id}`}>
                                                                <Button
                                                                        color="gray"
                                                                        variant="text"
                                                                        >
                                                                    Редактировать
                                                                </Button>
                                                                </Link>
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
                        <Pagination currentPage={currentPage} itemsPerPage={categoriesPerPage} totalItems={filteredCategories?.length || 0} paginate={paginate}/>
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}

export default AdminCategories;