import {Breadcrumbs, Button, Card, Input, Typography} from "@material-tailwind/react";
import {Link, useParams} from "react-router-dom";
import numeral from "numeral";
import React, {useEffect, useState} from "react";
import {AppDispatch, RootState} from "../../../store/store";
import {useDispatch, useSelector} from "react-redux";
import {fetchUserPermissions, selectError, selectPermissions} from "../../../slicers/adminSlice";
import {checkTokenValidity} from "../../../slicers/userSlice";
import axios from "axios";
import {AdminNavigation} from "../AdminNavigation";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash} from "@fortawesome/free-solid-svg-icons";
import {toast} from "react-toastify";
import {Helmet} from "react-helmet";

const AdminEditCategory = () => {
    interface Subcategory{
        name: string;
        link: string;
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
    const [category, setCategory] = useState<Category | null>(null)

    const params = useParams()

    useEffect(() => {
        // Проверяем валидность токена при загрузке компонента
        dispatch(checkTokenValidity());
    }, [dispatch]);

    useEffect(() => {
        // Вы можете вызывать асинхронное действие для загрузки прав пользователя
        dispatch(fetchUserPermissions());
        setIsLoading(false)
    }, [dispatch]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get<Category>(`https://api.orochirage.ru/api/categories/id/${params.url}`, { timeout: 10000 });
            setCategory(response.data);
        } catch (error) {
            console.error('Error fetching collection:', error);
        }
    }

    const handleCategoryEdit = (field: string, value: any) => {
        setCategory(prevState => ({
            ...prevState!,
            [field]: value,
        }));
    };

    const handleSubcategoryEdit = (index: number, field: string, value: string) => {
        if(category){
            const updatedItems = [...category.items];
            updatedItems[index] = { ...updatedItems[index], [field]: value };
            setCategory(prevState => {
                if (prevState) {
                    return { ...prevState, items: updatedItems };
                }
                return prevState;
            });
        }
    };

    const handleSubcategoryDelete = (index: number) => {
        if (category) {
            const updatedItems = [...category.items];
            updatedItems.splice(index, 1); // Удаление подкатегории по индексу
            setCategory(prevState => {
                if (prevState) {
                    return { ...prevState, items: updatedItems };
                }
                return prevState;
            });
        }
    };

    const handleAddSubcategory = () => {
        if(category){
            const newSubcategory: Subcategory = {
                name: 'Название подкатегории',
                link: 'Ссылка',
            };
            setCategory(prevState => {
                if (prevState) {
                    return { ...prevState, items: [...prevState.items, newSubcategory] };
                }
                return prevState;
            });
        }
    };

    const updateCategory = async (changes: Category) => {
        try {
            // Отправляем запрос на сервер для обновления пользователя
            const response = await axios.post('https://api.orochirage.ru/api/admin/categories/update', changes, {
                headers: {
                    Authorization: token
                },
                timeout: 10000
            }).then(async (response) => {
                if (response.status === 200) {
                    toast.success("Данные продукта успешно обновлены.")
                    await fetchCategories();
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

    const handleUpdateCategory = () => {
        if(category)
        {
            updateCategory(category)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [token])

    if(!category)
    {
        return (
            <>
                <>
                    <AdminNavigation/>
                    <div className="p-8 font-inter text-xl">
                        Категория не найдена.
                    </div>
                </>
            </>
        )
    }

    return (
        <>
            <Helmet>
                <title>OROCHI - Изменение категории</title>
            </Helmet>
            <div className="admin--edit-category">
                <Breadcrumbs className="px-12 pt-8 pb-6 !bg-transparent hidden lg:flex" >
                    <Link to="/user/admin/" className="opacity-60">
                        Панель управления
                    </Link>
                    <Link to="/user/admin/categories" className="opacity-60">
                        Категории
                    </Link>
                    <Link to={`/user/admin/categories?search=${category?._id}`} className="opacity-60">
                        {category?.name}
                    </Link>
                    <Link to={`/user/admin/categories/${category?._id}`}>
                        Редактирование
                    </Link>
                </Breadcrumbs>
                <div className="edit-items flex flex-col h-[100vh] px-12 pt-8 pb-6 w-full md:max-w-[100vw] lg:max-w-[30vw]">
                    <div className="flex flex-col gap-4">
                        <div className="edit__title uppercase text-xl">
                            Основные
                        </div>
                        <div className="items w-full flex flex-col gap-4">
                            <Input className="block" onChange={(e) => handleCategoryEdit("name", e.target.value)} value={category?.name} crossOrigin label="Название категории"/>
                            <Input className="block" onChange={(e) => handleCategoryEdit("link", e.target.value)} value={category?.link} crossOrigin label="Ссылка на категорию"/>
                            <span className="muted">https://site-url.ru/category/<span className="font-bold">{category?.link}</span></span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 mt-6 grow">
                        <div className="edit__title uppercase text-xl flex flex-row items-center">
                            <div className="grow">
                                Подкатегории
                            </div>
                            <div>
                                <Button onClick={handleAddSubcategory} >Добавить</Button>
                            </div>
                        </div>
                        {category && category.items.map((item, index) => (
                            <div className="items w-full flex flex-col gap-4">
                                <div className="title flex flex-row">
                                    <div className="grow">
                                        {item.name}
                                    </div>
                                    <div>
                                        <FontAwesomeIcon onClick={() => handleSubcategoryDelete(index)} className="transition-opacity opacity-45 hover:opacity-65" icon={faTrash}/>
                                    </div>
                                </div>
                                <Input className="block" value={item.name} onChange={(e) => handleSubcategoryEdit(index, 'name', e.target.value)} crossOrigin label="Название подкатегории"/>
                                <Input className="block" value={item.link} onChange={(e) => handleSubcategoryEdit(index, 'link', e.target.value)} crossOrigin label="Ссылка на категорию"/>
                                <span className="muted">https://site-url.ru/category/<span className="font-bold">{item?.link}</span></span>
                            </div>
                        ))}
                    </div>
                    <div className="flex w-full pt-6 pb-6">
                        <Button onClick={handleUpdateCategory} className="w-full" size="md" color="green" variant="gradient" >Сохранить изменения</Button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminEditCategory;