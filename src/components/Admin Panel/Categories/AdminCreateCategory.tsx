import {Breadcrumbs, Button, Input, Spinner} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import React, {useEffect, useState} from "react";
import { AppDispatch, RootState } from "../../../store/store";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import {Helmet} from "react-helmet";
import {fetchUserPermissions, selectError, selectPermissions} from "../../../slicers/adminSlice";
import {checkTokenValidity} from "../../../slicers/userSlice";

const AdminCreateCategory = () => {
    interface Subcategory {
        name: string;
        link: string;
    }

    interface Category {
        name: string;
        link: string;
        items: Subcategory[];
    }

    const [isLoading, setIsLoading] = useState(false);
    const dispatch: AppDispatch = useDispatch();
    const token = useSelector((state: RootState) => state.user.token);
    const permissions = useSelector((state: RootState) => selectPermissions(state));
    const permissionsError = useSelector((state: RootState) => selectError(state));
    const [category, setCategory] = useState<Category>({
        name: '',
        link: '',
        items: [],
    });


    const handleCategoryEdit = (field: string, value: any) => {
        setCategory((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleSubcategoryEdit = (index: number, field: string, value: string) => {
        const updatedItems = [...category.items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        setCategory((prevState) => ({
            ...prevState,
            items: updatedItems,
        }));
    };

    const handleSubcategoryDelete = (index: number) => {
        const updatedItems = [...category.items];
        updatedItems.splice(index, 1); // Remove subcategory at index
        setCategory((prevState) => ({
            ...prevState,
            items: updatedItems,
        }));
    };

    const handleAddSubcategory = () => {
        const newSubcategory: Subcategory = {
            name: 'Название подкатегории',
            link: 'Ссылка',
        };
        setCategory((prevState) => ({
            ...prevState,
            items: [...prevState.items, newSubcategory],
        }));
    };

    useEffect(() => {
        // Проверяем валидность токена при загрузке компонента
        dispatch(checkTokenValidity());
    }, [dispatch]);

    useEffect(() => {
        // Вы можете вызывать асинхронное действие для загрузки прав пользователя
        dispatch(fetchUserPermissions());
        setIsLoading(false)
    }, [dispatch]);

    const createCategory = async () => {
        try {
            setIsLoading(true);
            const response = await axios.post('https://api.orochirage.ru/api/admin/category/new', category, {
                headers: {
                    Authorization: token,
                },
                timeout: 10000,
            });
            setIsLoading(false);
            if (response.status === 200) {
                toast.success("Категория успешно создана. Вы будете перенаправлены на страницу редактирования", {
                    onClose: () => {
                        const categoryId = response.data.id;
                        window.location.href = `/user/admin/categories/${categoryId}`;
                    }
                });
            } else if (response.status === 403) {
                toast.error("У вас недостаточно прав.");
            } else if (response.status === 500) {
                toast.error("Ошибка сервера");
            } else {
                toast.error(`Не удалось создать категорию: ${response.data.message}`);
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Error creating category:', error);
            toast.error("Ошибка сервера при создании категории");
        }
    };

    if(isLoading)
        return (
            <>
                <div className="flex items-center justify-center h-[calc(100vh-30rem)] w-full"><Spinner className="h-12 w-12" /></div>
            </>
        )

    if(permissionsError)
        return (
            <>
                <div className="p-8">
                    <div className="font-semibold text-xl">Невозможно получить права пользователя.</div>
                    <div>Это ошибка, пожалуйста, обратитесь к системному администратору.</div>
                </div>
            </>
        )

    if(!permissions.adminPanel && !permissions.addShopItems)
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
                <title>OROCHI - Создать категорию</title>
            </Helmet>
        <div className="admin--create-category">
                <Breadcrumbs className="px-12 pt-8 pb-6 !bg-transparent hidden lg:flex" >
                    <Link to="/user/admin/" className="opacity-60">
                        Панель управления
                    </Link>
                    <Link to="/user/admin/categories" className="opacity-60">
                        Категории
                    </Link>
                    <span>Создание категории</span>
                </Breadcrumbs>
                <div className="edit-items flex flex-col h-[100vh] lg:h-[80vh] px-12 pt-8 pb-6 w-full md:max-w-[100vw] lg:max-w-[30vw]">
                    <div className="flex flex-col gap-4">
                        <div className="edit__title uppercase text-xl">
                            Основные
                        </div>
                        <div className="items w-full flex flex-col gap-4">
                            <Input className="block" onChange={(e) => handleCategoryEdit("name", e.target.value)} value={category.name} crossOrigin label="Название категории"/>
                            <Input className="block" onChange={(e) => handleCategoryEdit("link", e.target.value)} value={category.link} crossOrigin label="Ссылка на категорию"/>
                            <span className="muted">https://site-url.ru/category/<span className="font-bold">{category.link}</span></span>
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
                        {category.items.map((item, index) => (
                            <div className="items w-full flex flex-col gap-4" key={index}>
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
                        <Button onClick={createCategory} className="w-full" size="md" color="green" variant="gradient" >
                            {isLoading ? 'Создание...' : 'Создать категорию'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )};

export default AdminCreateCategory;