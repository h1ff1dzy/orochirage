import {AdminNavigation} from "../AdminNavigation";
import {
    Accordion, AccordionBody, AccordionHeader,
    Breadcrumbs, Button,
    Card,
    CardBody, CardFooter,
    CardHeader, Checkbox,
    Dialog, DialogBody, DialogFooter, DialogHeader, Drawer, IconButton,
    Input,
    Popover,
    PopoverContent,
    PopoverHandler,
    Spinner,
    Typography
} from "@material-tailwind/react";
import {Link, useLocation} from "react-router-dom";
import React, {ChangeEvent, useEffect, useState} from "react";
import {AppDispatch, RootState} from "../../../store/store";
import {useDispatch, useSelector} from "react-redux";
import {fetchUserPermissions, selectError, selectPermissions} from "../../../slicers/adminSlice";
import {checkTokenValidity} from "../../../slicers/userSlice";
import {toast} from "react-toastify";
import axios from "axios";
import {
    MagnifyingGlassIcon,
    PlusIcon,
} from "@heroicons/react/24/solid";
import Pagination from "../../Pagination";
import numeral from "numeral";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronRight, faRubleSign} from "@fortawesome/free-solid-svg-icons";
import FileUpload from "../SelfComponents/FileUpload";
import EditUploadedImages from "../SelfComponents/EditUploadedImages";
import {Helmet} from "react-helmet";

const AdminProductsList = () => {
    interface Product {
        _id: string;
        Title: string;
        Price: number;
        Images: string[];
        Colors: string[];
        Sizes: string[];
        Category: {
            name: string;
            link: string;
            additional: {
                name: string;
                link: string;
                _id: string;
            }[];
        };
        Collection: string;
        Tags: {
            _id: string;
            name: string;
            value: string;
        }[];
        OrderedTimes: number;
    }

    const initialProductState: Product = {
        _id: "",
        Title: "",
        Price: 0,
        Images: [],
        Colors: [],
        Sizes: [],
        Category: {
            name: "Нет категории",
            link: "",
            additional: [{
                name: "",
                link: "",
                _id: "",
            }],
        },
        Collection: "Нет коллекции",
        Tags: [
            { _id: "#tb_removed", name: "Артикул", value: "" },
            { _id: "#tb_removed", name: "Состав", value: "" },
            { _id: "#tb_removed", name: "Вид застежки", value: "" },
            { _id: "#tb_removed", name: "Силуэт", value: "" },
            { _id: "#tb_removed", name: "Тип посадки", value: "" },
            { _id: "#tb_removed", name: "Принт", value: "" },
            { _id: "#tb_removed", name: "Плотность", value: "" },
            { _id: "#tb_removed", name: "Модель", value: "" },
            { _id: "#tb_removed", name: "Материал", value: "" },
            { _id: "#tb_removed", name: "Автор", value: "" },
        ],
        OrderedTimes: 0,
    };

    interface Collection {
        _id: string;
        name: string;
        link: string;
        items: string[];
    }

    interface CategoryItem {
        _id: string;
        name: string;
        link: string;
    }

    interface Category {
        _id: string;
        name: string;
        link: string;
        createdBy: string;
        __v: number;
        items: CategoryItem[];
    }

    interface ColorSettings {
        itemColors: string[];
        itemColorsStyle: string[];
    }

    const [colorSettings, setColorSettings] = React.useState<ColorSettings | null>(null);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const dispatch: AppDispatch = useDispatch();
    const token = useSelector((state: RootState) => state.user.token);
    const permissions = useSelector((state: RootState) => selectPermissions(state));
    const permissionsError = useSelector((state: RootState) => selectError(state));
    const [products, setProducts] = React.useState<Product[] | null>(null);
    const [editedProducts, setEditedProducts] = React.useState<Product | undefined>(undefined);
    const [newProduct, setNewProduct] = React.useState<Product>(initialProductState)
    const [collection, setCollection] = useState<Collection[] | null>(null)
    const location = useLocation();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('search');
    const [searchTerm, setSearchTerm] = React.useState<string>(searchQuery || '');
    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
    const [selectedSubCategories, setSelectedSubCategories] = React.useState<string[]>([]); // Выбранные подкатегории
    const [responseWait, setResponseWait] = React.useState(false);

    const [currentEditedItem, setCurrentEditedItem] = React.useState(-1);

    const [removalAvailable, setRemovalAvailable] = React.useState(false)

    const [removalDialogConfirmText, setRemovalDialogConfirmText] = React.useState("");
    const handleRemovalConfirm = (event: React.ChangeEvent<HTMLInputElement>) => {
        const confirmText = event.target.value;
        setRemovalDialogConfirmText(confirmText);

        if (confirmText.toUpperCase() === `УДАЛИТЬ ${editedProducts?.Title?.toUpperCase()}`) {
            console.log(`${confirmText} == УДАЛИТЬ ${editedProducts?.Title?.toUpperCase()}`);
            setRemovalAvailable(true);
        } else {
            setRemovalAvailable(false);
        }
    };

    const handleFileChange = (newFiles: File[]) => {
        setSelectedFiles(newFiles);
    };

    const handleRemovalCancel = () => {
        setRemovalDialogConfirmText("")
        setRemovalAvailable(false)
        setRemovalDialog(!removalDialog)
    }

    const [removalDialog, setRemovalDialog] = React.useState(false);

    const handleOpenRemovalDialog = (index: number) => {
        setCurrentEditedItem(index)
        setEditedProducts(currentItems?.[index])
        setRemovalDialog(!removalDialog)
    }


    const [openCollapse, setOpenCollapse] = React.useState(1);

    const handleOpen = (value: number) => setOpenCollapse(openCollapse === value ? 0 : value);

    const [currentPage, setCurrentPage] = React.useState(1);

    const handleChangeProduct = (field: string, value: any) => {
        setEditedProducts(prevState => ({
            ...prevState!,
            [field]: value,
            Images: field === 'Images' ? value : prevState?.Images // заменяем атрибут Images, если field === 'Images'
        }));
    };


    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get<Category[]>('https://api.orochirage.ru/api/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchCollection = async () => {
        try {
            const response = await axios.get<Collection[]>(`https://api.orochirage.ru/api/collections/products`, { timeout: 10000 });
            setCollection(response.data);
        } catch (error) {
            console.error('Error fetching collection:', error);
        }
    }

    useEffect(() => {
        fetchCollection();
    }, [token, products]);

    useEffect(() => {
        // Проверяем валидность токена при загрузке компонента
        dispatch(checkTokenValidity());
    }, [dispatch]);

    useEffect(() => {
        // Вы можете вызывать асинхронное действие для загрузки прав пользователя
        dispatch(fetchUserPermissions());
        setIsLoading(false)
    }, [dispatch]);

    const [editProducts, setEditProducts] = React.useState(false);


    const handleEditOrder = async (index: number) => {
        setCurrentEditedItem(index)
        setEditedProducts(currentItems?.[index])
        openEditProducts()
    }

    const openEditProducts = () => setEditProducts(true);
    const closeEditProducts = () => {
        setCurrentEditedItem(-1)
        setEditProducts(false);
    }

    const [createProduct, setCreateProduct] = React.useState(false);

    const openCreateProduct = () => setCreateProduct(true);
    const closeCreateProduct = () => setCreateProduct(false);

    const handleNewProductEdit = (field: string, value: any) => {
        setNewProduct(prevState => ({
            ...prevState!,
            [field]: value,
        }));
    };

    useEffect(() => {
        if (permissionsError) {
            toast.error(permissionsError);
        }
    }, [permissionsError]);

    useEffect(() => {
        fetchProducts();
    }, [token]);

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
    }, [token]);

    const fetchProducts = async () => {
        try {
            const response = await axios.post('https://api.orochirage.ru/api/admin/products', null, {
                headers: {
                    Authorization: token
                }
            });
            setProducts(response.data);
            if(currentEditedItem != -1)
                setEditedProducts(currentItems?.[currentEditedItem]); // обновляем editedProducts после получения новых данных
        } catch (error) {
            console.error("Error fetching Products:", error);
        }
    };

    const removeProduct = async (productId: string) => {
        try {
            await axios.post('https://api.orochirage.ru/api/admin/products/remove', { productId }, {
                headers: {
                    Authorization: token
                }
            });
            fetchProducts()
        } catch (error) {
            console.error("Error fetching Products:", error);
        }
    };

    const filteredProducts = products && products.filter((product: Product) => {
        // Создаем массив строк для поиска
        let searchableStrings: string[] = [
            product._id,
            product.Title,
            product.Price.toString(),
            product.OrderedTimes.toString(),
            product.Collection,
        ];

        if (product.Category) {
            searchableStrings.push(product.Category.name.toLowerCase()); // Имя категории
            if (product.Category.additional) {
                searchableStrings.push(
                    ...product.Category.additional.map(additional => additional.name.toLowerCase())
                ); // Дополнительные имена категорий
            }
        }

        if (product.Tags) {
            searchableStrings.push(
                ...product.Tags.map(tag => tag.value.toLowerCase())
            );
        }


        // Преобразуем в нижний регистр все строки для поиска и ищем совпадение
        const searchTermLower = searchTerm.toLowerCase();
        return searchableStrings.some(str => str.toLowerCase().includes(searchTermLower));
    });



    const updateProduct = async (changes: Product) => {
        try {
            // Удаляем плейсхолдеры из массива Images
            const filteredImages = changes.Images.filter(image => image !== 'https://placehold.jp/ffffff/000000/150x150.png');
            // Обновляем массив Images в объекте changes
            changes.Images = filteredImages;

            // Отправляем запрос на сервер для обновления продукта
            const response = await axios.post('https://api.orochirage.ru/api/admin/products/update', changes, {
                headers: {
                    Authorization: token
                },
                timeout: 10000
            }).then(async (response) => {
                console.log(`RESPONSE RESPONSE RESPONSE`)
                if (response.status === 200) {
                    toast.success("Данные продукта успешно обновлены.")
                    await fetchProducts();
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


    const refreshEditedProduct = async (images: string[]) => {
        console.log("refEP")
        try {
            if (!editedProducts)
                return toast.error("В данный момент товары не редактируются.");

            setEditedProducts(prevState => ({
                ...prevState!,
                Images: images
            }));
        } catch (e) {
            return toast.error("Неизвестная ошибка, блок TC-REP");
        }
    };




    const createProductRequest = async (changes: Product) => {
        try {
            // Отправляем запрос на сервер для обновления пользователя
            const response = await axios.post('https://api.orochirage.ru/api/admin/products/new', changes, {
                headers: {
                    Authorization: token
                },
                timeout: 10000
            }).then(async (response) => {
                if (response.status === 200) {
                    uploadImages(response.data.product._id, selectedFiles).then(async () => {
                        await fetchProducts().then(() => {
                            setSelectedFiles([])
                            closeCreateProduct()
                            toast.success("Продукт успешно создан!")
                        });
                    })
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

    const toggleSize = (size: string) => {
        setEditedProducts(prevState => {
            if (!prevState) return prevState; // Проверяем наличие prevState

            const updatedSizes = prevState.Sizes ? [...prevState.Sizes] : []; // Создаем копию массива размеров, если он существует

            // Проверяем, включен ли размер в массиве размеров
            const sizeIndex = updatedSizes.indexOf(size);
            if (sizeIndex !== -1) {
                // Если размер уже включен, убираем его из массива
                updatedSizes.splice(sizeIndex, 1);
            } else {
                // Если размер не включен, добавляем его в массив
                updatedSizes.push(size);
            }

            // Возвращаем обновленное состояние editedProducts
            return { ...prevState, Sizes: updatedSizes };
        });
    };
    const toggleNewSize = (size: string) => {
        setNewProduct(prevState => {
            if (!prevState) return prevState; // Проверяем наличие prevState

            const updatedSizes = prevState.Sizes ? [...prevState.Sizes] : []; // Создаем копию массива размеров, если он существует

            // Проверяем, включен ли размер в массиве размеров
            const sizeIndex = updatedSizes.indexOf(size);
            if (sizeIndex !== -1) {
                // Если размер уже включен, убираем его из массива
                updatedSizes.splice(sizeIndex, 1);
            } else {
                // Если размер не включен, добавляем его в массив
                updatedSizes.push(size);
            }

            // Возвращаем обновленное состояние editedProducts
            return { ...prevState, Sizes: updatedSizes };
        });
    };

    const uploadImages = async (productId: string, files: File[]) => {
        try {
            if (!files || files.length === 0) {
                console.error('No files selected');
                return;
            }

            const formData = new FormData();
            formData.append('productId', productId);

            // Добавляем каждый файл в FormData под полем 'images'
            files.forEach((file) => {
                formData.append('images', file); // Используем имя поля 'images'
            });

            const response = await axios.post('https://api.orochirage.ru/api/admin/products/upload-images', formData, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response.data);
        } catch (error) {
            console.error('Error uploading images:', error);
            toast.error('Ошибка отправки фото на сервер, смотри консоль разработчика (F12)');
        }
    };






    const handleCreateProduct = () => {
        if(newProduct){
            setResponseWait(true);
            if(newProduct.Price <= 0){
                closeEditProducts()
                setResponseWait(false)
                return toast.error("Цена не может быть равна или меньше чем 0.")
            }
            if(newProduct.Title === ""){
                closeEditProducts()
                setResponseWait(false)
                return toast.error("Заголовок не может быть пустой.")
            }

            createProductRequest(newProduct).then((value) => {
                setResponseWait(false);
                closeEditProducts()
            })
        }else{
            return toast.error("Невозможно создать продукт!")
        }
    }

    const handleProductEdit = () => {
        if (editedProducts) {
            console.log("Информация о продукте");
            console.log(editedProducts);
            setResponseWait(true);

            // Проверка наличия изображения-заполнителя в массиве Images

            if (editedProducts.Price <= 0) {
                closeEditProducts();
                setResponseWait(false);
                return toast.error("Цена не может быть равна или меньше чем 0.");
            }
            if (editedProducts.Title === "") {
                closeEditProducts();
                setResponseWait(false);
                return toast.error("Заголовок не может быть пустым.");
            }

            updateProduct(editedProducts).then(() => {
                setResponseWait(false);
                closeEditProducts();
            });
        } else {
            return toast.error("Невозможно обновить продукт!");
        }
    };


    const productsPerPage = 5;
    const indexOfLastOrder = currentPage * productsPerPage;
    const indexOfFirstOrder = indexOfLastOrder - productsPerPage;
    const currentItems = filteredProducts && filteredProducts.slice(indexOfFirstOrder, indexOfLastOrder);

    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => { // Явно указываем тип ChangeEvent<HTMLInputElement>
        setSearchTerm(event.target.value);
    };

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const toggleNewColor = (index: number) => {
        setNewProduct(prevState => {
            if (!prevState) return prevState; // Проверяем наличие prevState

            const updatedColors = prevState.Colors ? [...prevState.Colors] : []; // Создаем копию массива цветов, если он существует

            // Проверяем наличие colorSettings
            if (!colorSettings) return prevState;

            const colorToAdd = colorSettings.itemColors[index];

            // Проверяем, включен ли цвет в массиве цветов
            const colorIndex = updatedColors.indexOf(colorToAdd);
            if (colorIndex !== -1) {
                // Если цвет уже включен, убираем его из массива
                updatedColors.splice(colorIndex, 1);
            } else {
                // Если цвет не включен, добавляем его в массив
                updatedColors.push(colorToAdd);
            }

            // Возвращаем обновленное состояние editedProducts
            return { ...prevState, Colors: updatedColors };
        });
    };

    const toggleColor = (index: number) => {
        setEditedProducts(prevState => {
            if (!prevState) return prevState; // Проверяем наличие prevState

            const updatedColors = prevState.Colors ? [...prevState.Colors] : []; // Создаем копию массива цветов, если он существует

            // Проверяем наличие colorSettings
            if (!colorSettings) return prevState;

            const colorToAdd = colorSettings.itemColors[index];

            // Проверяем, включен ли цвет в массиве цветов
            const colorIndex = updatedColors.indexOf(colorToAdd);
            if (colorIndex !== -1) {
                // Если цвет уже включен, убираем его из массива
                updatedColors.splice(colorIndex, 1);
            } else {
                // Если цвет не включен, добавляем его в массив
                updatedColors.push(colorToAdd);
            }

            // Возвращаем обновленное состояние editedProducts
            return { ...prevState, Colors: updatedColors };
        });
    };



    const TABLE_HEAD = ["Артикул", "Название", "Цена", "Фотографии", "Цвета", "Размеры", "Категории", "Коллекция", "Теги", "Заказано раз", ""];

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

    const handleCategoryChange = (categoryLink: string) => {
        if (selectedCategory === categoryLink) {
            // Если выбранная категория совпадает с текущей, сбрасываем выбор
            setSelectedCategory(null);
            setSelectedSubCategories([]);
        } else {
            // Иначе обновляем выбранную категорию и сбрасываем выбранные подкатегории
            setSelectedCategory(categoryLink);
            setSelectedSubCategories([]);
        }
    };

    const handleSubCategoryChange = (subCategoryLink: string) => {
        if (selectedSubCategories.includes(subCategoryLink)) {
            // Если подкатегория уже выбрана, удаляем её из списка выбранных
            setSelectedSubCategories(selectedSubCategories.filter((link) => link !== subCategoryLink));
        } else {
            // Иначе добавляем подкатегорию в список выбранных
            setSelectedSubCategories([...selectedSubCategories, subCategoryLink]);
        }
    };


    function handleRemoveItem(_id: string) {
        removeProduct(_id).then(() => {
            toast.warning("Продукт был удален.")
            setRemovalDialogConfirmText("")
            setRemovalAvailable(false)
            setRemovalDialog(!removalDialog)
        })
    }

    return (
        <>
            <Helmet>
                <title>OROCHI - Список товаров</title>
            </Helmet>
            <Dialog size="xs" open={removalDialog} handler={handleOpenRemovalDialog}>
                <DialogHeader >Вы собираетесь удалить {editedProducts?.Title}</DialogHeader>
                <DialogBody >
                    <div className="flex flex-col gap-4">
                        Для удаление продукта вам нужно подтвердить это действие.
                        Напишите в поле ниже <span className="font-bold inline uppercase text-sm font-mono">УДАЛИТЬ {editedProducts?.Title}</span>
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
                        <span>Отмена</span>
                    </Button>
                    <Button disabled={!removalAvailable} variant="gradient" color="green" onClick={() => handleRemoveItem(editedProducts?._id as string)}>
                        <span>Подтвердить</span>
                    </Button>
                </DialogFooter>
            </Dialog>

            <Drawer

                placement="right"
                open={createProduct}
                onClose={closeCreateProduct}
                className="p-4 overflow-auto"
            >
                <div className="flex flex-col flex-1 h-full">
                    <div className="mb-6 flex items-center justify-between">
                        <Typography variant="h5" color="blue-gray">
                            Новый продукт
                        </Typography>
                        <IconButton variant="text" color="blue-gray" onClick={closeCreateProduct}>
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
                            Вы собираетесь создать товар, вы уверены?
                        </Typography>
                        <div className="inputs flex flex-col gap-4">
                            <Input
                                onChange={(e) => handleNewProductEdit("Title", e.target.value)}
                                crossOrigin
                                label="Название товара"
                                value={newProduct.Title}
                            />
                            <Input
                                crossOrigin
                                onChange={(e) => handleNewProductEdit("Price", e.target.value)}
                                label="Стоимость"
                                value={newProduct.Price}
                                icon={<FontAwesomeIcon icon={faRubleSign} />}
                            />
                        </div>
                        <Accordion open={openCollapse === 1}>
                            <AccordionHeader className="font-xs" onClick={() => handleOpen(1)}>
                                <div className="text-sm flex flex-row w-full justify-between items-center">
                                    <div>Теги</div>
                                    <FontAwesomeIcon className={`transition-transform ${openCollapse === 1 && 'rotate-90'}`} icon={faChevronRight}/>
                                </div>
                            </AccordionHeader>
                            <AccordionBody >
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col items-center gap-4">
                                        <Input
                                            crossOrigin
                                            label={`Артикул`}
                                            value={newProduct.Tags.find(tag => tag.name === 'Артикул')?.value || ''}
                                            onChange={(e) => handleNewProductEdit('Tags', newProduct.Tags.map(tag => tag.name === 'Артикул' ? { ...tag, value: e.target.value } : tag))}
                                        />
                                        <Input
                                            crossOrigin
                                            label={`Состав`}
                                            value={newProduct.Tags.find(tag => tag.name === 'Состав')?.value || ''}
                                            onChange={(e) => handleNewProductEdit('Tags', newProduct.Tags.map(tag => tag.name === 'Состав' ? { ...tag, value: e.target.value } : tag))}
                                        />
                                        <Input
                                            crossOrigin
                                            label={`Вид застежки`}
                                            value={newProduct.Tags.find(tag => tag.name === 'Вид застежки')?.value || ''}
                                            onChange={(e) => handleNewProductEdit('Tags', newProduct.Tags.map(tag => tag.name === 'Вид застежки' ? { ...tag, value: e.target.value } : tag))}
                                        />
                                        <Input
                                            crossOrigin
                                            label={`Силуэт`}
                                            value={newProduct.Tags.find(tag => tag.name === 'Силуэт')?.value || ''}
                                            onChange={(e) => handleNewProductEdit('Tags', newProduct.Tags.map(tag => tag.name === 'Силуэт' ? { ...tag, value: e.target.value } : tag))}
                                        />
                                        <Input
                                            crossOrigin
                                            label={`Тип посадки`}
                                            value={newProduct.Tags.find(tag => tag.name === 'Тип посадки')?.value || ''}
                                            onChange={(e) => handleNewProductEdit('Tags', newProduct.Tags.map(tag => tag.name === 'Тип посадки' ? { ...tag, value: e.target.value } : tag))}
                                        />
                                        <Input
                                            crossOrigin
                                            label={`Принт`}
                                            value={newProduct.Tags.find(tag => tag.name === 'Принт')?.value || ''}
                                            onChange={(e) => handleNewProductEdit('Tags', newProduct.Tags.map(tag => tag.name === 'Принт' ? { ...tag, value: e.target.value } : tag))}
                                        />
                                        <Input
                                            crossOrigin
                                            label={`Плотность`}
                                            value={newProduct.Tags.find(tag => tag.name === 'Плотность')?.value || ''}
                                            onChange={(e) => handleNewProductEdit('Tags', newProduct.Tags.map(tag => tag.name === 'Плотность' ? { ...tag, value: e.target.value } : tag))}
                                        />
                                        <Input
                                            crossOrigin
                                            label={`Модель`}
                                            value={newProduct.Tags.find(tag => tag.name === 'Модель')?.value || ''}
                                            onChange={(e) => handleNewProductEdit('Tags', newProduct.Tags.map(tag => tag.name === 'Модель' ? { ...tag, value: e.target.value } : tag))}
                                        />
                                        <Input
                                            crossOrigin
                                            label={`Материал`}
                                            value={newProduct.Tags.find(tag => tag.name === 'Материал')?.value || ''}
                                            onChange={(e) => handleNewProductEdit('Tags', newProduct.Tags.map(tag => tag.name === 'Материал' ? { ...tag, value: e.target.value } : tag))}
                                        />
                                        <Input
                                            crossOrigin
                                            label={`Автор`}
                                            value={newProduct.Tags.find(tag => tag.name === 'Автор')?.value || ''}
                                            onChange={(e) => handleNewProductEdit('Tags', newProduct.Tags.map(tag => tag.name === 'Автор' ? { ...tag, value: e.target.value } : tag))}
                                        />
                                    </div>
                                    <div className="muted">
                                        Если тэг не подходит к товару, укажите его значение как <span className="font-bold">##</span>
                                    </div>
                                </div>
                            </AccordionBody>
                        </Accordion>
                        <Accordion open={openCollapse === 2}>
                            <AccordionHeader className="font-sm" onClick={() => handleOpen(2)}>
                                <div className="text-sm flex flex-row w-full justify-between items-center">
                                    <div>Фотография</div>
                                    <FontAwesomeIcon className={`transition-transform ${openCollapse === 2 && 'rotate-90'}`} icon={faChevronRight}/>
                                </div>
                            </AccordionHeader>
                            <AccordionBody >
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-4">
                                        <FileUpload onFileChange={handleFileChange}/>
                                    </div>
                                </div>
                            </AccordionBody>
                        </Accordion>
                        <Accordion open={openCollapse === 3}>
                            <AccordionHeader className="font-sm" onClick={() => handleOpen(3)}>
                                <div className="text-sm flex flex-row w-full justify-between items-center">
                                    <div>Категории</div>
                                    <FontAwesomeIcon className={`transition-transform ${openCollapse === 3 && 'rotate-90'}`} icon={faChevronRight}/>
                                </div>
                            </AccordionHeader>
                            <AccordionBody >
                                <div className="h-max">
                                    <select
                                        name="Категории"
                                        value={newProduct.Category.name}
                                        className="w-full border border-gray-300 rounded-md p-2"
                                        onChange={(e) => {
                                            const selectedCategory = e.target.value;
                                            if (selectedCategory === "Нет категории") {
                                                setNewProduct({
                                                    ...newProduct,
                                                    Category: {
                                                        name: "Нет категории",
                                                        link: "",
                                                        additional: [{
                                                            name: "",
                                                            link: "",
                                                            _id: "",
                                                        }],
                                                    }
                                                });
                                            } else {
                                                const selectedCategoryObj = categories.find((category) => category.name === selectedCategory);
                                                if (selectedCategoryObj) {
                                                    const { name, link } = selectedCategoryObj;
                                                    setNewProduct({
                                                        ...newProduct,
                                                        Category: {
                                                            name,
                                                            link,
                                                            additional: [],
                                                        }
                                                    });
                                                }
                                            }
                                        }}
                                    >
                                        <option key="Нет категории" value="Нет категории">
                                            Нет категории
                                        </option>
                                        {categories.map((category) => (
                                            <option key={category._id} value={`${category.name}`}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>

                                    <div>
                                        {categories
                                            .find((category) => category.name === newProduct.Category.name)
                                            ?.items
                                            .filter((item) => item.name !== "products") // Исключаем категорию с именем "products" из списка
                                            .map((item) => (
                                                <Checkbox
                                                    crossOrigin
                                                    key={item._id}
                                                    id={`ripple-on-${item._id}`}
                                                    label={`${item.name}`}
                                                    checked={
                                                        newProduct.Category.additional &&
                                                        newProduct.Category.additional.some((editedItem) => editedItem._id === item._id)
                                                    }
                                                    onChange={() => {
                                                        const updatedAdditional = newProduct.Category.additional ? [...newProduct.Category.additional] : [];
                                                        const existingIndex = updatedAdditional.findIndex((editedItem) => editedItem._id === item._id);
                                                        if (existingIndex !== -1) {
                                                            // Если категория уже выбрана, уберем ее из additional
                                                            updatedAdditional.splice(existingIndex, 1);
                                                        } else {
                                                            console.log(`id: ${item._id} name: ${item.name} link: ${item.link}`)
                                                            updatedAdditional.push({ name: item.name, link: item.link, _id: item._id });
                                                        }
                                                        setNewProduct({
                                                            ...newProduct,
                                                            Category: {
                                                                ...newProduct.Category,
                                                                additional: updatedAdditional,
                                                            }
                                                        });
                                                    }}
                                                />
                                            ))}
                                    </div>

                                </div>
                            </AccordionBody>
                        </Accordion>
                        <Accordion open={openCollapse === 4}>
                            <AccordionHeader className="font-sm" onClick={() => handleOpen(4)}>
                                <div className="text-sm flex flex-row w-full justify-between items-center">
                                    <div>Размеры</div>
                                    <FontAwesomeIcon className={`transition-transform ${openCollapse === 4 && 'rotate-90'}`} icon={faChevronRight}/>
                                </div>
                            </AccordionHeader>
                            <AccordionBody >
                                <div className="flex flex-wrap wrap h-fit w-full gap-2">
                                    {["XS", "S", "M", "L", "XL", "2XL", "3XL"].map((size, index) => (
                                        <Checkbox
                                            crossOrigin
                                            key={index}
                                            id={`size-checkbox-${index}`}
                                            label={size}
                                            checked={newProduct.Sizes.includes(size)}
                                            onChange={() => toggleNewSize(size)}
                                        />
                                    ))}
                                </div>
                            </AccordionBody>
                        </Accordion>
                        <Accordion open={openCollapse === 5}>
                            <AccordionHeader className="font-sm" onClick={() => handleOpen(5)}>
                                <div className="text-sm flex flex-row w-full justify-between items-center">
                                    <div>Цвета</div>
                                    <FontAwesomeIcon className={`transition-transform ${openCollapse === 5 && 'rotate-90'}`} icon={faChevronRight}/>
                                </div>
                            </AccordionHeader>
                            <AccordionBody >
                                <div className="flex flex-col gap-3">
                                    <div className="mt-6 self-center color_selector flex flex-row gap-3 items-center justify-center">
                                        {colorSettings && colorSettings.itemColors.map((color, index) => (
                                            <a
                                                href="#"
                                                key={index}
                                                className={`border-collapse transition-colors duration-300 ease-out color_selector__item ${newProduct.Colors.includes(color) ? 'active' : ''}`}
                                                style={{ backgroundColor: colorSettings.itemColorsStyle[index] }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleNewColor(index);
                                                }}
                                            ></a>
                                        ))}
                                    </div>
                                </div>
                            </AccordionBody>
                        </Accordion>
                        <Accordion open={openCollapse === 6}>
                            <AccordionHeader className="font-sm" onClick={() => handleOpen(6)}>
                                <div className="text-sm flex flex-row w-full justify-between items-center">
                                    <div>Коллекция</div>
                                    <FontAwesomeIcon className={`transition-transform ${openCollapse === 5 && 'rotate-90'}`} icon={faChevronRight}/>
                                </div>
                            </AccordionHeader>
                            <AccordionBody >
                                <div className="flex flex-wrap wrap h-fit w-full gap-2">
                                    <select
                                        value={newProduct.Collection || ''}
                                        onChange={(e) => {
                                            handleNewProductEdit("Collection", e.target.value)
                                        }}
                                        className="w-full border border-gray-300 rounded-md p-2"
                                    >
                                        {collection?.map(item => (
                                            <option key={item.link} value={item.name}>{item.name}</option>
                                        ))}
                                        <option key="Нет коллекции" value="Нет коллекции">Нет коллекции</option>
                                    </select>
                                </div>
                            </AccordionBody>
                        </Accordion>
                    </div>
                    <div className="grow flex items-end">
                        <div className="gap-2 flex grow">
                            <Button disabled={responseWait} color="red" variant="text" onClick={closeCreateProduct}>
                                Отмена
                            </Button>
                            <Button
                                disabled={responseWait || !selectedFiles}
                                onClick={handleCreateProduct}
                                color="green"
                                className={`
                                grow transition ease-in-out uppercase !flex justify-center 
                                align-middle items-center ${responseWait || !selectedFiles && "opacity-50"}`}
                                variant="gradient">
                                    {responseWait && <Spinner className="mr-3" />} Создать
                            </Button>
                        </div>
                    </div>
                </div>
            </Drawer>

            <Drawer
                placement="right"
                open={editProducts}
                onClose={closeEditProducts}
                className="p-4 overflow-auto"
            >
                <div className="flex flex-col flex-1 h-full">
                    <div className="mb-6 flex items-center justify-between">
                        <Typography variant="h5" color="blue-gray">
                            {editedProducts?.Title}
                        </Typography>
                        <IconButton variant="text" color="blue-gray" onClick={closeEditProducts}>
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
                            Вы собираетесь изменить товар, вы уверены?
                        </Typography>
                        <div className="inputs flex flex-col gap-4">
                            <Input
                                onChange={(e) => handleChangeProduct("Title", e.target.value)}
                                crossOrigin
                                label="Название товара"
                                value={editedProducts?.Title}
                            />
                            <Input
                                crossOrigin
                                onChange={(e) => handleChangeProduct("Price", e.target.value)}
                                label="Стоимость"
                                value={editedProducts?.Price}
                                icon={<FontAwesomeIcon icon={faRubleSign} />}
                            />
                        </div>
                        <Accordion open={openCollapse === 1}>
                            <AccordionHeader className="font-xs" onClick={() => handleOpen(1)}>
                                <div className="text-sm flex flex-row w-full justify-between items-center">
                                    <div>Теги</div>
                                    <FontAwesomeIcon className={`transition-transform ${openCollapse === 1 && 'rotate-90'}`} icon={faChevronRight}/>
                                </div>
                            </AccordionHeader>
                            <AccordionBody >
                                <div className="flex flex-col gap-3">
                                    {editedProducts?.Tags.map((tag, index) => (
                                        <div key={index} className="flex items-center gap-4">
                                            <Input
                                                label={tag.name}
                                                value={tag.value}
                                                crossOrigin
                                                onChange={(e) => {
                                                    const updatedTags = [...editedProducts?.Tags]; // Создаем копию массива тегов
                                                    updatedTags[index] = { ...updatedTags[index], value: e.target.value }; // Обновляем значение нужного тега
                                                    handleChangeProduct('Tags', updatedTags); // Обновляем состояние editedProducts
                                                }}
                                            />
                                        </div>
                                    ))}
                                    <div className="muted">
                                        Если тэг не подходит к товару, укажите его значение как <span className="font-bold">##</span>
                                    </div>
                                </div>
                            </AccordionBody>
                        </Accordion>
                        <Accordion open={openCollapse === 2}>
                            <AccordionHeader className="font-sm" onClick={() => handleOpen(2)}>
                                <div className="text-sm flex flex-row w-full justify-between items-center">
                                    <div>Фотография</div>
                                    <FontAwesomeIcon className={`transition-transform ${openCollapse === 2 && 'rotate-90'}`} icon={faChevronRight}/>
                                </div>
                            </AccordionHeader>
                            <AccordionBody >
                                <div className="flex flex-col gap-3">
                                    <EditUploadedImages key={editedProducts?._id} refreshItemData={refreshEditedProduct} token={token || ""} itemId={editedProducts?._id || ""} images={editedProducts?.Images || []} />
                                </div>
                            </AccordionBody>
                        </Accordion>
                        <Accordion open={openCollapse === 3}>
                            <AccordionHeader className="font-sm" onClick={() => handleOpen(3)}>
                                <div className="text-sm flex flex-row w-full justify-between items-center">
                                    <div>Категории</div>
                                    <FontAwesomeIcon className={`transition-transform ${openCollapse === 3 && 'rotate-90'}`} icon={faChevronRight}/>
                                </div>
                            </AccordionHeader>
                            <AccordionBody >
                                <div className="h-max">
                                    <select
                                        name="Категории"
                                        value={editedProducts?.Category.name}
                                        className="w-full border border-gray-300 rounded-md p-2"
                                        onChange={(e) => {
                                            const selectedCategory = e.target.value;
                                            if (selectedCategory === "Нет категории") {
                                                handleChangeProduct('Category', {
                                                    name: "Нет категории",
                                                    link: "",
                                                    additional: [{
                                                        name: "",
                                                        link: "",
                                                        _id: "",
                                                    }],
                                                });
                                            } else {
                                                const selectedCategoryObj = categories.find((category) => category.name === selectedCategory);
                                                if (selectedCategoryObj) {
                                                    const { name, link } = selectedCategoryObj;
                                                    handleChangeProduct('Category', { name, link });
                                                }

                                            }
                                        }}
                                    >
                                        <option key="Нет категории" value="Нет категории">
                                            Нет категории
                                        </option>
                                        {categories.map((category) => (
                                            <option key={category._id} value={`${category.name}`}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>

                                    <div>
                                        {categories
                                            .find((category) => category.name === editedProducts?.Category.name)
                                            ?.items
                                            .filter((item) => item.name !== "products") // Исключаем категорию с именем "products" из списка
                                            .map((item) => (
                                                <Checkbox
                                                    crossOrigin
                                                    key={item._id}
                                                    id={`ripple-on-${item._id}`}
                                                    label={`${item.name}`}
                                                    checked={
                                                        editedProducts?.Category.additional &&
                                                        editedProducts.Category.additional.some((editedItem) => editedItem._id === item._id)
                                                    }
                                                    onChange={() => {
                                                        const updatedAdditional = editedProducts?.Category.additional ? [...editedProducts.Category.additional] : [];
                                                        const existingIndex = updatedAdditional.findIndex((editedItem) => editedItem._id === item._id);
                                                        if (existingIndex !== -1) {
                                                            // Если категория уже выбрана, уберем ее из additional
                                                            updatedAdditional.splice(existingIndex, 1);
                                                        } else {
                                                            console.log(`id: ${item._id} name: ${item.name} link: ${item.link}`)
                                                            updatedAdditional.push({ name: item.name, link: item.link, _id: item._id });
                                                        }
                                                        handleChangeProduct('Category', { ...editedProducts?.Category, additional: updatedAdditional });
                                                    }}
                                                />
                                            ))}
                                    </div>
                                </div>
                            </AccordionBody>
                        </Accordion>
                        <Accordion open={openCollapse === 4}>
                            <AccordionHeader className="font-sm" onClick={() => handleOpen(4)}>
                                <div className="text-sm flex flex-row w-full justify-between items-center">
                                    <div>Размеры</div>
                                    <FontAwesomeIcon className={`transition-transform ${openCollapse === 4 && 'rotate-90'}`} icon={faChevronRight}/>
                                </div>
                            </AccordionHeader>
                            <AccordionBody >
                                <div className="flex flex-wrap wrap h-fit w-full gap-2">
                                    {["XS", "S", "M", "L", "XL", "2XL", "3XL"].map((size, index) => (
                                        <Checkbox
                                            crossOrigin
                                            key={index}
                                            id={`size-checkbox-${index}`}
                                            label={size}
                                            checked={editedProducts?.Sizes.includes(size)}
                                            onChange={() => toggleSize(size)}
                                        />
                                    ))}
                                </div>
                            </AccordionBody>
                        </Accordion>
                        <Accordion open={openCollapse === 5}>
                            <AccordionHeader className="font-sm" onClick={() => handleOpen(5)}>
                                <div className="text-sm flex flex-row w-full justify-between items-center">
                                    <div>Цвета</div>
                                    <FontAwesomeIcon className={`transition-transform ${openCollapse === 5 && 'rotate-90'}`} icon={faChevronRight}/>
                                </div>
                            </AccordionHeader>
                            <AccordionBody >
                                <div className="flex flex-col gap-3">
                                    <div className="mt-6 self-center color_selector flex flex-row gap-3 items-center justify-center">
                                        {colorSettings && colorSettings.itemColors.map((color, index) => (
                                            <a
                                                href="#"
                                                key={index}
                                                className={`border-collapse transition-colors duration-300 ease-out color_selector__item ${editedProducts?.Colors.includes(color) ? 'active' : ''}`}
                                                style={{ backgroundColor: colorSettings.itemColorsStyle[index] }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleColor(index);
                                                }}
                                            ></a>
                                        ))}
                                    </div>
                                </div>
                            </AccordionBody>
                        </Accordion>
                        <Accordion open={openCollapse === 6}>
                            <AccordionHeader className="font-sm" onClick={() => handleOpen(6)}>
                                <div className="text-sm flex flex-row w-full justify-between items-center">
                                    <div>Коллекция</div>
                                    <FontAwesomeIcon className={`transition-transform ${openCollapse === 5 && 'rotate-90'}`} icon={faChevronRight}/>
                                </div>
                            </AccordionHeader>
                            <AccordionBody >
                                <div className="flex flex-wrap wrap h-fit w-full gap-2">
                                    <select
                                        value={editedProducts?.Collection || ''}
                                        onChange={(e) => {
                                            handleChangeProduct("Collection", e.target.value)
                                        }}
                                        className="w-full border border-gray-300 rounded-md p-2"
                                    >
                                        {collection?.map(item => (
                                            <option key={item.link} value={item.name}>{item.name}</option>
                                        ))}
                                        <option key="Нет коллекции" value="Нет коллекции">Нет коллекции</option>
                                    </select>
                                </div>
                            </AccordionBody>
                        </Accordion>
                    </div>
                    <div className="grow flex items-end">
                        <div className="gap-2 flex grow">
                            <Button disabled={responseWait} color="red" variant="text" onClick={closeEditProducts}>
                                Отмена
                            </Button>
                            <Button disabled={responseWait} onClick={handleProductEdit} color="green" className={`grow transition ease-in-out uppercase !flex justify-center align-middle items-center ${responseWait && "opacity-50"}`} variant="gradient">{responseWait && <Spinner className="mr-3" />} Обновить</Button>
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
                    Товары
                </Link>
            </Breadcrumbs>

            <div className="flex flex-col w-full items-center justify-center self-center p-8">
                <Card className="h-full w-full">
                    <CardHeader floated={false} shadow={false} className="rounded-none">
                        <div className="mb-8 flex items-center justify-between gap-4 lg:gap-8">
                            <div>
                                <Typography variant="h5" color="blue-gray">
                                    Список товаров
                                </Typography>
                                <Typography color="gray" className="mt-1 font-normal ">
                                    Список всех товаров на сайте
                                </Typography>
                            </div>
                            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                                <Button onClick={openCreateProduct} color="green" variant="gradient" className="flex items-center gap-3" size="sm">
                                    <PlusIcon strokeWidth={2} className="h-4 w-4" /> Создать товар
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
                    <CardBody className="overflow-scroll px-0">
                        {!filteredProducts ? (                         <div className="flex items-center gap-2 pl-5">
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
                            filteredProducts.length <= 0 ? (
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
                                        (product, index) => {
                                            const isLast = index === currentItems.length - 1;
                                            const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";
                                            return (
                                                <tr key={product._id}>
                                                    <td className={classes}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex flex-col">
                                                                <Typography variant="small" color="blue-gray" className="font-normal">
                                                                    {product.Tags.find(tag => tag.name === 'Артикул')?.value ?? 'Нет артикула'} {/* Отображаем значение тега 'Артикул' или текст "Нет артикула", если тег отсутствует */}
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
                                                                            className="font-normal underline underline-offset-4"
                                                                >
                                                                    <Link to={`/product/${product._id}`}>{product.Title}</Link>
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
                                                                    {numeral(product.Price).format('0,0.00 $')}
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={classes}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex flex-col">
                                                                <Popover>
                                                                    <PopoverHandler>
                                                                        <Typography
                                                                                    variant="small"
                                                                                    color="blue-gray"
                                                                                    className="font-normal underline underline-offset-2 cursor-pointer"
                                                                        >
                                                                            Посмотреть фотографии
                                                                        </Typography>
                                                                    </PopoverHandler>
                                                                    <PopoverContent >
                                                                        <div className="flex flex-col gap-2">
                                                                            {product.Images.map((img) => (
                                                                                <a href={img} className="underline underline-offset-4">
                                                                                    {img}
                                                                                </a>
                                                                            ))}
                                                                        </div>
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={classes}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex flex-col">
                                                                <div className="color_selector flex flex-row gap-3 items-center">
                                                                    {product.Colors.map((color, index) => ( color === "white" ?
                                                                            <a href="#" key={index} className={`transition-colors duration-300 ease-out color_selector__item border-collapse`}></a> : <a href="#" key={index} className={`transition-colors duration-300 ease-out color_selector__item`} style={{ backgroundColor: color }}></a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={classes}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex flex-col">
                                                                <div className="flex flex-row gap-2">
                                                                    {product.Sizes.map((size) => (
                                                                        <div className="p-2 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer rounded-lg">
                                                                            {size}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={classes}>
                                                        <div className="flex flex-col">
                                                            <Typography variant="small" color="blue-gray" className="font-semibold">
                                                                {product.Category.name}
                                                            </Typography>
                                                            <Typography
                                                                        variant="small"
                                                                        color="blue-gray"
                                                                        className="font-normal opacity-70"
                                                            >
                                                                {product.Category.additional.map((categoryAdditional) => (
                                                                    <div>
                                                                        {categoryAdditional.name}
                                                                    </div>
                                                                ))}
                                                            </Typography>
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
                                                                    <div className="text-xs font-semibold underline underline-offset-2 cursor-pointer font-mono">
                                                                        {product.Collection}
                                                                    </div>


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
                                                                    {product.Tags.length} тега(-ов)
                                                                </Typography>
                                                                <Typography
                                                                            variant="small"
                                                                            color="blue-gray"
                                                                            className="font-small"
                                                                >
                                                                    просмотр в панели редактирования
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={classes}>
                                                        <div className="flex flex-col">
                                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                                {product.OrderedTimes} раз
                                                            </Typography>
                                                            <Typography
                                                                        variant="small"
                                                                        color="blue-gray"
                                                                        className="font-normal opacity-70"
                                                            >
                                                                прибыль {numeral(product.Price * product.OrderedTimes).format('0,0.00 $')}
                                                            </Typography>
                                                        </div>
                                                    </td>
                                                    <td className={classes}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex flex-row items-center gap-2">
                                                                <Button onClick={() => handleEditOrder(index)}
                                                                        color="gray"
                                                                        variant="text"
                                                                        >
                                                                    Редактировать
                                                                </Button>
                                                                <Button
                                                                    color="red"
                                                                    variant="text"
                                                                    onClick={() => handleOpenRemovalDialog(index)}
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
                        <Pagination currentPage={currentPage} itemsPerPage={productsPerPage} totalItems={filteredProducts?.length || 0} paginate={paginate}/>
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}

export default AdminProductsList;