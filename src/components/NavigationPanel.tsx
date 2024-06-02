import React, {useEffect, useState, Suspense, useCallback} from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { debounce } from 'lodash';
import { LazyLoadImage } from "react-lazy-load-image-component";
import {Badge, Menu, MenuHandler, MenuItem, MenuList, Spinner, ThemeProvider} from "@material-tailwind/react";
import {
    faUser,
    faHeart,
    faCartShopping,
    faBars,
    faClose,
    faMagnifyingGlass,
    faChevronDown,
    faChevronRight,
    faRightFromBracket, faXmark, faChevronLeft
} from '@fortawesome/free-solid-svg-icons'
import {
    Typography,
    List,
    ListItem,
    ListItemPrefix,
    ListItemSuffix,
    Chip,
    Accordion,
    AccordionHeader,
    AccordionBody,
    Input,
    Drawer,
    Card,
} from "@material-tailwind/react";

import {
    ShoppingCartIcon,
    HomeIcon,
    ListBulletIcon,
    HeartIcon,
    ComputerDesktopIcon,
    ShoppingBagIcon, ChevronUpIcon
} from "@heroicons/react/24/solid";
import {Link, useLocation} from "react-router-dom";
import {useCart} from "../context/CartProvider";
import {useFavorites} from "../context/FavoritesProvider";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../store/store";
import {checkTokenValidity, Logout} from "../slicers/userSlice";
import axios from "axios";
import {fetchUserPermissions, selectPermissions} from "./../slicers/adminSlice";
import {equals} from "ramda";
import LazyLoad from "react-lazyload";

const theme = {
    drawer: {
        styles: {
            base: {
                overlay: {
                    display: "fixed"
                },
            },
        },
    },
};


export function NavigationPanel() {
    const dispatch: AppDispatch = useDispatch();
    const { cartItems } = useCart();
    const cartItemsCount = cartItems.length;
    const user = useSelector((state: RootState) => state.user.user);
    const { favoriteItems } = useFavorites();
    const favoriteItemsCount = favoriteItems.length;

    const location = useLocation();
    const isActive = (path: string) => {
        const currentPath = window.location.pathname + window.location.search; // Вместо location используем window.location
        const pathSegments = path.split('/').filter(segment => segment !== '');
        const currentPathSegments = currentPath.split('/').filter(segment => segment !== '');

        if (pathSegments.length !== currentPathSegments.length) {
            return false;
        }

        for (let i = 0; i < pathSegments.length; i++) {
            const pathSegment = pathSegments[i];
            const currentPathSegment = currentPathSegments[i];

            if (pathSegment.startsWith(':')) {
                continue;
            }

            if (pathSegment !== currentPathSegment) {
                return false;
            }
        }

        return true;
    };


    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
    const [userLoading, setUserLoading] = React.useState(false);
    const [categoryLoading, setCategoryLoading] = React.useState(true);
    const [collectionLoading, setCollectionLoading] = React.useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 3;


    interface AccordionState {
        [key: string]: boolean;
    }

    const [accordionState, setAccordionState] = useState<AccordionState>({});

    const handleOpen = (type: string) => {
        setAccordionState(prevState => ({
            ...prevState,
            [type]: !prevState[type as keyof typeof prevState]
        }));
    }


    const token = useSelector((state: RootState) => state.user.token);
    const [openUserMenu, setOpenUserMenu] = React.useState(false);
    const permissions = useSelector((state: RootState) => selectPermissions(state));
    const openDrawer = () => {
        setIsDrawerOpen(true);
    }
    const closeDrawer = () => {
        clearSearch();
        setIsDrawerOpen(false);
    }

    const ExitFromProfile = async () => {
        await dispatch(Logout());
    }

    interface SearchResult{
        products: Product[];
    }

    interface Product {
        _id: string;
        Title: string;
        Price: number;
        Images: string[];
    }

    interface Collection {
        _id: string;
        name: string;
        link: string;
    }

    interface Item {
        _id: string;
        name: string;
        link: string;
    }

    interface Category {
        _id: string;
        name: string;
        link: string;
        items: Item[];
    }

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchResults, setSearchResults] = useState<SearchResult | null>(null);

    const [loadingImages, setLoadingImages] = useState(new Array(searchResults?.products.length).fill(true)); // Состояние загрузки изображений

    const clearSearch = () => {
        setSearchTerm('');
        setSearchResults(null);
    }

    const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        debouncedHandleSearch(event); // Здесь вызываем debouncedHandleSearch вместо handleSearch
    };

    const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value;

        // Если значение term пустое, сбрасываем результаты поиска и поисковый запрос
        if (term === '') {
            clearSearch();
            return; // Завершаем функцию, чтобы избежать выполнения остального кода
        }

        setSearchTerm(term);

        try {
            const response = await axios.get(`https://api.orochirage.ru/api/search/${term}`);
            if (response.status === 404)
                return;
            const searchData: SearchResult = response.data;

            // Обновляем результаты поиска только если они изменились
            if (!equals(searchData, searchResults)) {
                setSearchResults(searchData);
            }
        } catch (error) {
            console.error('Error searching:', error);
        }
    };

    const debouncedHandleSearch = debounce(handleSearch, 300);

    const PopupContainer: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
        return (
            <div className="absolute top-[150px] left-[25px] z-[999] max-h-fit w-fit overflow-y-auto bg-white border border-gray-300 rounded p-1 animate-[fade-out_1s_ease-in-out]">
                {children}
            </div>
        );
    };



    const [collection, setCollection] = useState<Collection[] | null>(null);
    const [categories, setCategories] = useState<Category[] | null>(null);

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                const response = await axios.get<Collection[]>(`https://api.orochirage.ru/api/collections/`, { timeout: 10000 });
                setCollection(response.data);
            } catch (error) {
                console.error('Error fetching collection:', error);
            } finally {
                setCollectionLoading(false);
            }
        }
        fetchCollection();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get<Category[]>(`https://api.orochirage.ru/api/categories/`, { timeout: 10000 });
                setCategories(response.data);
                categories?.map((cat) => {
                    handleOpen(cat.link)
                })
            } catch (error) {
                console.error('Error fetching collection:', error);
            } finally {
                setCategoryLoading(false);
            }
        }
        fetchCategories();
    }, []);

    const handleImageLoad = useCallback((index: number) => {
        setLoadingImages(prevLoadingImages => {
            const newLoadingImages = [...prevLoadingImages];
            newLoadingImages[index] = false;
            return newLoadingImages;
        });
    }, []);

    const totalPages = searchResults ? Math.ceil(searchResults.products.length / productsPerPage) : 0;

    const handleClickNext = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handleClickPrev = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = searchResults ? Math.min(startIndex + productsPerPage, searchResults.products.length) : 0;

    useEffect(() => {
        if(token) {
            dispatch(checkTokenValidity());
            dispatch(fetchUserPermissions());
            setUserLoading(false);
        } else {
            setUserLoading(false);
        }
    }, [token]); // Изменили зависимость на token


    return (
        <>
            <div className={`md:container-lg relative h-24 sticky bg-[#FBFBFB] top-0 z-[1999] select-none ${isActive('/user/admin/:rel') || isActive('/user/admin/') || isActive('/user/admin/users/:id')|| isActive('/user/admin/users/:id/orders')|| isActive('/user/admin/categories/:id/') ? 'hidden' : ''}`}>
                <div className="flex h-24 items-end justify-between pb-3">
                    <div>
                        <div className="flex w-32 justify-start ml-7 gap-4 items-center">
                            {isDrawerOpen ?
                                (<FontAwesomeIcon fontSize="30" icon={faClose} className="menu_btn will-change-auto w-8 h-8" onClick={closeDrawer}/>)
                                :
                                (<FontAwesomeIcon fontSize="30" icon={faBars} className="menu_btn will-change-auto w-8 h-8" onClick={openDrawer}/>)
                            }
                            <Link to="/" className="cursor-pointer">
                                <img src="/static/img/logo.svg" className="mb-[1.25px]" height="36" width="66"/>
                            </Link>
                        </div>
                    </div>
                    <div className="flex w-64 justify-end mr-7 gap-6">
                        <Badge content={favoriteItemsCount} color={"purple"} withBorder className={favoriteItemsCount <= 0 ? "hidden" : "visible"} >
                            <Link to="/favorites"><FontAwesomeIcon fontSize="30" className={`cursor-pointer transition-colors ease-in-out duration-300 ${isActive("/favorites") ? "text-[#0000009c]" : "text-[#000]"}`} icon={faHeart}/></Link>
                        </Badge>
                        <Badge content={cartItemsCount} withBorder className={cartItemsCount <= 0 ? "hidden" : "visible"} >
                            <Link to="/cart"><FontAwesomeIcon fontSize="30" className={`cursor-pointer transition-colors ease-in-out duration-300 ${isActive("/cart") ? "text-[#0000009c]" : "text-[#000]"}`} icon={faCartShopping}/></Link>
                        </Badge>
                        {token && isActive('/user') ?
                            (
                                <>
                                    <Menu>
                                        <MenuHandler>
                                            <Link to="/user"><FontAwesomeIcon fontSize="30" className={`cursor-pointer transition-colors ease-in-out duration-300 ${isActive("/user") ? "text-[#0000009c]" : "text-[#000]"}`} icon={faUser}/></Link>
                                        </MenuHandler>
                                        <MenuList >
                                            <Menu
                                                placement="right-start"
                                                open={openUserMenu}
                                                handler={setOpenUserMenu}
                                                allowHover
                                                offset={15}
                                            >
                                                <MenuHandler className="flex items-center justify-between">
                                                    <MenuItem >
                                                        <div className="flex flex-row gap-1.5"><FontAwesomeIcon icon={faUser}/> Профиль</div>
                                                        <ChevronUpIcon
                                                            strokeWidth={2.5}
                                                            className={`h-3.5 w-3.5 transition-transform ${
                                                                openUserMenu ? "-rotate-90" : ""
                                                            }`}
                                                        />
                                                    </MenuItem>
                                                </MenuHandler>
                                                <MenuList >
                                                    <a href="/user?act=orders"><MenuItem className="flex flex-row gap-1.5" >Заказы</MenuItem></a>
                                                    <a href="/user?act=achievements"><MenuItem className="flex flex-row gap-1.5" >Достижения</MenuItem></a>
                                                </MenuList>
                                            </Menu>
                                            <MenuItem onClick={ExitFromProfile} className="flex flex-row gap-1.5" ><FontAwesomeIcon icon={faRightFromBracket}/> Выход</MenuItem>
                                        </MenuList>
                                    </Menu>
                                </>
                            ) : (
                                <>
                                    <Link to="/user"><FontAwesomeIcon fontSize="30" className={`cursor-pointer transition-colors ease-in-out duration-300 ${isActive("/user") ? "text-[#0000009c]" : "text-[#000]"}`} icon={faUser}/></Link>
                                </>)}

                    </div>
                </div>
            </div>
            <div className={isActive('/user/admin/:rel') || isActive('/user/admin/') || isActive('/user/admin/users/:id')|| isActive('/user/admin/users/:id/orders')|| isActive('/user/admin/categories/:id/') ? 'hidden' : ''}>
                <ThemeProvider value={theme}>
                    <Drawer open={isDrawerOpen} onClose={closeDrawer} className="font-inter">
                        <Card
                              color="transparent"
                              shadow={false}
                              className="h-[calc(100vh-2rem)] w-full p-4"
                        >
                            <div className="mb-2 flex items-center gap-4 p-4">
                                <img
                                    src="/static/img/logo.svg"
                                    className="h-[36px] w-[66px]"
                                    alt="brand"
                                />
                                <Typography variant="h6" className="uppercase text-left" color="blue-gray" >
                                    Orochi
                                </Typography>
                            </div>
                            <div className="p-2">
                                <Input
                                    icon={searchTerm ? <FontAwesomeIcon className="cursor-pointer" onClick={clearSearch} icon={faXmark}/> : <FontAwesomeIcon icon={faMagnifyingGlass}/>}
                                    label="Поиск"
                                    crossOrigin={undefined}
                                    onChange={handleSearchInput}
                                    value={searchTerm}
                                />
                                {searchResults && searchResults.products.length > 0 && (
                                    <PopupContainer>
                                        <div className="flex flex-col">
                                            <List >
                                                {searchResults.products.slice(startIndex, endIndex).map((product, index) => (
                                                    <div className="flex flex-row gap-1 items-center" key={product._id}>
                                                        <div>
                                                            <LazyLoadImage
                                                                src={`${product.Images[0]}?size=150x150`}
                                                                width={64}
                                                                height={64}
                                                                alt="Image Alt"
                                                                className="h-16 w-16 object-cover object-center rounded-lg"
                                                                placeholderSrc={`${product.Images[0]}?size=10x10`}
                                                            />
                                                        </div>
                                                        <Link onClick={closeDrawer} className="w-full" to={`/product/${product._id}`}>
                                                            <ListItem className="w-full" >
                                                                {product.Title}
                                                            </ListItem>
                                                        </Link>
                                                    </div>
                                                ))}
                                            </List>
                                            <div className="w-full flex justify-between items-center pb-4 pt-2 select-none">
                                                <FontAwesomeIcon icon={faChevronLeft} className="ml-4 opacity-50 cursor-pointer hover:opacity-100 transition-opacity" onClick={handleClickPrev} fontSize="26"/>
                                                <div className="page-data opacity-70 uppercase muted font-semibold">Страница {currentPage} из {totalPages}</div>
                                                <FontAwesomeIcon icon={faChevronRight} className="mr-4 opacity-50 cursor-pointer hover:opacity-100 transition-opacity" onClick={handleClickNext} fontSize="26"/>
                                            </div>
                                        </div>
                                    </PopupContainer>
                                )}

                            </div>
                            <List className="overflow-auto">
                                <Link to="/"><ListItem selected={isActive('/')} >
                                    <ListItemPrefix >
                                        <HomeIcon className="h-5 w-5" />
                                    </ListItemPrefix>
                                    Главная
                                </ListItem>
                                </Link>
                                <LazyLoad unmountIfInvisible={true} offset={50}>
                                    <Suspense fallback={(
                                        <Accordion open={accordionState["catalog"]} icon={
                                            <Typography

                                                as="div"
                                                variant="paragraph"
                                                className="h-4 w-4 rounded-md bg-gray-300"
                                            >
                                                &nbsp;
                                            </Typography>}>
                                            <ListItem disabled={true} className="p-0" selected={accordionState["catalog"]}>
                                                <AccordionHeader onClick={() => handleOpen("catalog")} className="border-b-0 p-3 animate-pulse">
                                                    <ListItemPrefix >
                                                        <Typography

                                                            as="div"
                                                            variant="paragraph"
                                                            className="h-5 w-5 rounded-md bg-gray-300"
                                                        >
                                                            &nbsp;
                                                        </Typography>
                                                    </ListItemPrefix>
                                                    <Typography color="blue-gray" className="mr-auto font-normal">
                                                        <Typography
                                                            as="div"
                                                            variant="paragraph"
                                                            className="h-2 w-36 rounded-full bg-gray-300"
                                                        >
                                                            &nbsp;
                                                        </Typography>
                                                    </Typography>
                                                </AccordionHeader>
                                            </ListItem>
                                        </Accordion>
                                    )}/>
                                    {!categoryLoading && !collectionLoading ? (
                                        <Accordion open={accordionState["catalog"]} icon={<FontAwesomeIcon icon={faChevronDown} strokeWidth={2.5} className={`mx-auto h-4 w-4 transition-transform ${accordionState["catalog"] ? "rotate-180" : ""}`} />}>
                                            <ListItem className="p-0" selected={accordionState["catalog"]}>
                                                <AccordionHeader onClick={() => handleOpen("catalog")} className="border-b-0 p-3">
                                                    <ListItemPrefix >
                                                        <ListBulletIcon className="h-5 w-5" />
                                                    </ListItemPrefix>
                                                    <Typography color="blue-gray" className="mr-auto font-normal">
                                                        Каталог
                                                    </Typography>
                                                </AccordionHeader>
                                            </ListItem>
                                            <AccordionBody className="py-1">
                                                <List className="p-0">

                                                    {categories && categories.length > 0 && (
                                                        <>
                                                            <LazyLoad unmountIfInvisible={true} offset={20}>
                                                                <Suspense fallback={(
                                                                    <div className="w-full h-full flex flex-row justify-center items-center">
                                                                        <Spinner className="h-6 w-6" />
                                                                    </div>
                                                                )}/>
                                                                {categories.map((category) => (
                                                                    <>
                                                                        <ListItem onClick={() => handleOpen(category.name)} >
                                                                            <ListItemPrefix >
                                                                                <FontAwesomeIcon icon={faChevronRight} strokeWidth={3} className={`h-3 w-5 transition-transform ${accordionState[category.name] && "rotate-90"}`} />
                                                                            </ListItemPrefix>
                                                                            {category.name}
                                                                        </ListItem>

                                                                        <Accordion open={accordionState[category.name]}>
                                                                            <AccordionBody className="py-1">
                                                                                <LazyLoad unmountIfInvisible={true} offset={50}>
                                                                                    <Suspense fallback={(
                                                                                        <div className="w-full h-full flex flex-row justify-center items-center">
                                                                                            <Spinner className="h-6 w-6" />
                                                                                        </div>
                                                                                    )}/>
                                                                                    {category.items.map((item) => (
                                                                                        <Link to={`/category/${category.link}/${item.link}`} key={item._id}>
                                                                                            <ListItem className="ml-[1rem] w-[14.5rem]" selected={isActive(`/category/${category.link}/${item.link}`)} >
                                                                                                {item.name}
                                                                                                <ListItemSuffix >
                                                                                                    <FontAwesomeIcon icon={faChevronRight} strokeWidth={3} className="h-3 w-5 opacity-50" />
                                                                                                </ListItemSuffix>
                                                                                            </ListItem>
                                                                                        </Link>
                                                                                    ))}
                                                                                </LazyLoad>
                                                                            </AccordionBody>
                                                                        </Accordion>
                                                                    </>
                                                                ))}
                                                            </LazyLoad>
                                                        </>
                                                    )}

                                                    {collection && collection.length > 0 && (
                                                        <>
                                                            <ListItem onClick={() => handleOpen("collections")} >
                                                                <ListItemPrefix >
                                                                    <FontAwesomeIcon icon={faChevronRight} strokeWidth={3} className={`h-3 w-5 transition-transform ${accordionState["collections"] && "rotate-90"}`} />
                                                                </ListItemPrefix>
                                                                Коллекции
                                                            </ListItem>
                                                            <Accordion open={accordionState["collections"]}>
                                                                <AccordionBody className="py-1">
                                                                    {collection.map((item) => (
                                                                        <Link to={`/collection/${item.link}`} key={item._id}>
                                                                            <ListItem className="ml-[1rem] w-[14.5rem]" selected={isActive(`/collection/${item.link}`)} >
                                                                                {item.name}
                                                                                <ListItemSuffix >
                                                                                    <FontAwesomeIcon icon={faChevronRight} strokeWidth={3} className="h-3 w-5 opacity-50" />
                                                                                </ListItemSuffix>
                                                                            </ListItem>
                                                                        </Link>
                                                                    ))}
                                                                </AccordionBody>
                                                            </Accordion>
                                                        </>
                                                    )}
                                                </List>
                                            </AccordionBody>
                                        </Accordion>
                                    ) : (
                                        <Accordion open={accordionState["catalog"]} icon={
                                            <Typography
                                                as="div"
                                                variant="paragraph"
                                                className="h-4 w-4 rounded-md bg-gray-300"
                                            >
                                                &nbsp;
                                            </Typography>}>
                                            <ListItem disabled={true} className="p-0" selected={accordionState["catalog"]}>
                                                <AccordionHeader onClick={() => handleOpen("catalog")} className="border-b-0 p-3 animate-pulse">
                                                    <ListItemPrefix >
                                                        <Typography
                                                            as="div"
                                                            variant="paragraph"
                                                            className="h-5 w-5 rounded-md bg-gray-300"
                                                        >
                                                            &nbsp;
                                                        </Typography>
                                                    </ListItemPrefix>
                                                    <Typography color="blue-gray" className="mr-auto font-normal" placeholder={undefined}>
                                                        <Typography
                                                            as="div"
                                                            variant="paragraph"
                                                            className="h-2 w-36 rounded-full bg-gray-300"
                                                        >
                                                            &nbsp;
                                                        </Typography>
                                                    </Typography>
                                                </AccordionHeader>
                                            </ListItem>
                                        </Accordion>
                                    )}
                                </LazyLoad>
                                {user && user.Orders && (
                                    <>
                                        <hr className="my-2 border-blue-gray-50" />
                                        <Link to="/user?act=orders">
                                            <ListItem selected={isActive('/user?act=orders')} >
                                                <ListItemPrefix >
                                                    <ShoppingBagIcon className="h-5 w-5" />
                                                </ListItemPrefix>
                                                Мои заказы
                                                {user.Orders.length >= 0 &&
                                                    <ListItemSuffix >
                                                        <Chip
                                                            value={user.Orders.length}
                                                            size="sm"
                                                            variant="ghost"
                                                            color="blue-gray"
                                                            className="rounded-full"
                                                        />
                                                    </ListItemSuffix>
                                                }
                                            </ListItem></Link>
                                        <Link to="/favorites">
                                            <ListItem selected={isActive('/favorites')} >
                                                <ListItemPrefix >
                                                    <HeartIcon className="h-5 w-5" />
                                                </ListItemPrefix>
                                                Избранное
                                                {favoriteItemsCount >= 0 &&
                                                    <ListItemSuffix >
                                                        <Chip
                                                            value={favoriteItemsCount}
                                                            size="sm"
                                                            variant="ghost"
                                                            color="blue-gray"
                                                            className="rounded-full"
                                                        />
                                                    </ListItemSuffix>
                                                }
                                            </ListItem></Link>
                                        <Link to="/cart"><ListItem selected={isActive('/cart')} >
                                            <ListItemPrefix >
                                                <ShoppingCartIcon className="h-5 w-5" />
                                            </ListItemPrefix>
                                            Корзина
                                            {cartItemsCount >= 0 &&
                                                <ListItemSuffix >
                                                    <Chip
                                                        value={cartItemsCount}
                                                        size="sm"
                                                        variant="ghost"
                                                        color="blue-gray"
                                                        className="rounded-full"
                                                    />
                                                </ListItemSuffix>
                                            }
                                        </ListItem>
                                        </Link>
                                        {permissions.adminPanel && (
                                            <Link to="/user/admin">
                                                <ListItem selected={isActive('/user/admin/*')} >
                                                    <ListItemPrefix >
                                                        <ComputerDesktopIcon className="h-5 w-5" />
                                                    </ListItemPrefix>
                                                    Панель управления
                                                </ListItem>
                                            </Link>)}
                                    </>
                                )}
                            </List>
                        </Card>
                    </Drawer>
                </ThemeProvider>
            </div>
        </>
    );
}