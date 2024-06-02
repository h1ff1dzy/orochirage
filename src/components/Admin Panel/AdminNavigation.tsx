import React, {useEffect} from "react";
import {
    Navbar,
    MobileNav,
    Typography,
    Button,
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    Avatar,
    Card,
    IconButton, Alert,
} from "@material-tailwind/react";
import {
    CubeTransparentIcon,
    UserCircleIcon,
    CodeBracketSquareIcon,
    Square3Stack3DIcon,
    ChevronDownIcon,
    Cog6ToothIcon,
    InboxArrowDownIcon,
    LifebuoyIcon,
    PowerIcon,
    RocketLaunchIcon,
    Bars2Icon,
    ListBulletIcon,
    ShoppingBagIcon, ArchiveBoxIcon, QueueListIcon, ArrowUturnLeftIcon, TicketIcon
} from "@heroicons/react/24/solid";
import {Link, useLocation} from "react-router-dom";
import {fetchUserPermissions, selectRoleName} from "../../slicers/adminSlice";
import {AppDispatch, RootState} from "../../store/store";
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";

const profileMenuItems = [
    {
        label: "Мой профиль",
        icon: UserCircleIcon,
        link: "/user"
    },
    {
        label: "Достижения",
        icon: InboxArrowDownIcon,
        link: "/user?act=achievements"
    },
    {
        label: "Заказы",
        icon: LifebuoyIcon,
        link: "/user?act=orders"
    },
    {
        label: "Вернутся на сайт",
        icon: ArrowUturnLeftIcon,
        link: "/"
    },
    {
        label: "Выйти",
        icon: PowerIcon,
    },
];

function ProfileMenu() {
    const dispatch: AppDispatch = useDispatch();
    const role = useSelector((state: RootState) => selectRoleName(state));
    const user = useSelector((state: RootState) => state.user.user);

    const [userName, setUserName] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(true);

    useEffect(() =>{
        if (!user) {
            setIsLoading(false);
            return;
        }
        setUserName(user["First name"])
        setIsLoading(false)
    }, [user])

    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    useEffect(() => {
        // Вы можете вызывать асинхронное действие для загрузки прав пользователя
        dispatch(fetchUserPermissions());
    }, [dispatch]);


    const closeMenu = () => setIsMenuOpen(false);

    return (
        <>
        <Menu open={isMenuOpen} handler={setIsMenuOpen} placement="bottom-end">
            <MenuHandler>
                <Button
                    variant="text"
                    color="blue-gray"
                    className="flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 lg:ml-auto"
                >
                    <Typography className="ml-2 mr-2 text-sm font-bold">
                        {isLoading ? (<>Загрузка..</>) : userName}
                        <span className="font-normal opacity-50 muted ml-2 text-xs text-right">{role}</span>
                    </Typography>
                    <ChevronDownIcon
                        strokeWidth={2.5}
                        className={`h-3 w-3 transition-transform ${
                            isMenuOpen ? "rotate-180" : ""
                        }`}
                    />
                </Button>
            </MenuHandler>
            <MenuList className="p-1">
                {profileMenuItems.map(({ label, icon, link }, key) => {
                    const isLastItem = key === profileMenuItems.length - 1;
                    return (
                        <Link to={link as string}>
                        <MenuItem
                            key={label}
                            onClick={closeMenu}
                            className={`flex items-center gap-2 rounded ${
                                isLastItem
                                    ? "hover:bg-red-500/10 focus:bg-red-500/10 active:bg-red-500/10"
                                    : ""
                            }`}
                        >
                            {React.createElement(icon, {
                                className: `h-4 w-4 ${isLastItem ? "text-red-500" : ""}`,
                                strokeWidth: 2,
                            })}
                            <Typography
                                as="span"
                                variant="small"
                                className="font-normal"
                                color={isLastItem ? "red" : "inherit"}
                            >
                                {label}
                            </Typography>
                        </MenuItem>
                        </Link>
                    );
                })}
            </MenuList>
        </Menu>
        </>
    );
}

const navListItems = [
    {
        label: "Пользователи",
        icon: UserCircleIcon,
        link: "/user/admin/users",
    },
    {
        label: "Заказы",
        icon: ShoppingBagIcon,
        link: "/user/admin/orders",
    },
    {
        label: "Товары",
        icon: ArchiveBoxIcon,
        link: "/user/admin/items",
    },
    {
        label: "Коллекции",
        icon: ListBulletIcon,
        link: "/user/admin/collections",
    },
    {
        label: "Категории",
        icon: QueueListIcon,
        link: "/user/admin/categories",
    },
    {
        label: "Промокоды",
        icon: TicketIcon,
        link: "/user/admin/promos",
    },
];

function NavListMenu() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <React.Fragment>
            <Menu allowHover open={isMenuOpen} handler={setIsMenuOpen}>
                <MenuHandler>
                    <Typography as="a" href="#" variant="small" className="font-normal">
                    </Typography>
                </MenuHandler>
            </Menu>
        </React.Fragment>
    );
}

function NavList() {
    const activeClass = "bg-blue-gray-50 bg-opacity-80 text-blue-gray-900";
    const location = useLocation();
    const isActive = (path: string) => {
        const currentPath = location.pathname;
        const pathSegments = path.split('/').filter(segment => segment !== ''); // Разбиваем путь на отдельные сегменты
        const currentPathSegments = currentPath.split('/').filter(segment => segment !== ''); // Разбиваем текущий путь на отдельные сегменты

        if (pathSegments.length !== currentPathSegments.length) {
            return false; // Разные длины путей означают, что они не совпадают
        }

        for (let i = 0; i < pathSegments.length; i++) {
            const pathSegment = pathSegments[i];
            const currentPathSegment = currentPathSegments[i];

            if (pathSegment.startsWith(':')) {
                // Если сегмент начинается с ':', это динамический сегмент, мы пропускаем его
                continue;
            }

            if (pathSegment !== currentPathSegment) {
                return false; // Если сегменты не совпадают, пути не совпадают
            }
        }

        return true; // Если все сегменты совпадают, пути совпадают
    };
    return (
        <ul className="mt-2 mb-4 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center">
            <NavListMenu />
            {navListItems.map(({ label, icon, link }, key) => (
                <Typography
                    key={label}
                    as="a"
                    href="#"
                    variant="small"
                    color="gray"
                    className="font-medium text-blue-gray-500"
                >
                    <Link to={link}>
                    <MenuItem className={`flex items-center gap-2 lg:rounded-full ${isActive(link) && activeClass}`}>
                        {React.createElement(icon, { className: "h-[18px] w-[18px]" })}{" "}
                        <span className="text-gray-900"> {label}</span>
                    </MenuItem>
                    </Link>
                </Typography>
            ))}
        </ul>
    );
}

export const AdminNavigation = () => {
    const [serverStatus, setServerStatus] = React.useState('WAITING');
    useEffect(() => {
        const checkServerStatus = async () => {
            try {
                await axios.post('https://api.orochirage.ru/heartbeat', {
                    timeout: 1000
                }).then((response) => {
                    console.log(response)
                    if (response.status === 200) {
                        setServerStatus('OK');
                    } else {
                        setServerStatus(`server.heartbeat failed: Сервер вернул код ${response.status}, хотя ожидался 200.`);
                    }
                });
            } catch (error) {
                setServerStatus('server.down: Невозможно установить соеденение с сервером.');
            }
        };
        const interval = setInterval(checkServerStatus, 30000);

        checkServerStatus();

        return () => clearInterval(interval);
    }, []);

    const [isNavOpen, setIsNavOpen] = React.useState(false);

    const toggleIsNavOpen = () => setIsNavOpen((cur) => !cur);

    const [serverInfoAlertOpened, setServerAlertOpened] = React.useState(true);

    return (
        <>
            {serverStatus !== "OK" && serverStatus !== "WAITING" &&
           <Alert open={serverInfoAlertOpened} onClose={() => setServerAlertOpened(false)}
                  className={`rounded-none sticky top-0 z-[999] transition-colors bg-red-500`}>
                    Возникла проблема с сервером, или он не запущен. Код ошибки: {serverStatus}
           </Alert>}
            <Navbar className="rounded-none mx-auto max-w-screen-xl p-2 lg:rounded-full lg:pl-6 lg:mt-6">
                <div className="relative mx-auto flex items-center justify-between text-blue-gray-900">
                    <Typography
                        as="a"
                        href="#"
                        className="mr-4 ml-2 cursor-pointer py-1.5 font-medium"
                    >
                        <Link to="/user/admin/">Панель управления</Link>
                    </Typography>
                    <div className="hidden lg:block">
                        <NavList />
                    </div>
                    <IconButton
                        size="sm"
                        color="blue-gray"
                        variant="text"
                        onClick={toggleIsNavOpen}
                        className="ml-auto mr-2 lg:hidden"
                    >
                        <Bars2Icon className="h-6 w-6" />
                    </IconButton>

                    <ProfileMenu />
                </div>
                <MobileNav open={isNavOpen} className="overflow-scroll">
                    <NavList />
                </MobileNav>
            </Navbar>
        </>
    )
}