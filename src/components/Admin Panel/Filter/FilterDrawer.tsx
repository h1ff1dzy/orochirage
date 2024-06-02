import React from "react";
import {Bars3BottomRightIcon as FilterIcon } from "@heroicons/react/24/solid";
import {Accordion, AccordionBody, AccordionHeader, Card, Drawer, ThemeProvider} from "@material-tailwind/react";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {CSSTransition} from "react-transition-group";


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


const FilterDrawer = () => {
    const [filterMenuOpened, setFilterMenuOpened] = React.useState(false);
    const [filterTab, setFilterTab] = React.useState(1);

    const changeFilterTab = (value: number) => setFilterTab(filterTab === value ? 0 : value);

    const openFilterMenu = () => setFilterMenuOpened(true)
    const closeFilterMenu = () => setFilterMenuOpened(false)

    return (
        <>
            {/*<ThemeProvider value={theme}>*/}
            {/*    <Drawer open={filterMenuOpened} onClose={closeFilterMenu} className={`p-4 bg-transparent`}>*/}
            {/*        <CSSTransition in={filterMenuOpened} timeout={275} classNames="animate-[fade-in_1s_ease-in-out]" unmountOnExit>*/}
            {/*        <Card className="h-[96dvh] w-72">*/}
            {/*            <div className="p-4 flex flex-col h-full">*/}
            {/*                <Accordion open={filterTab === 1} icon={<FontAwesomeIcon icon={faChevronRight} strokeWidth={2.5} className={`mx-auto h-4 w-4 transition-transform ${filterTab === 1 ? "rotate-90" : ""}`}/>}>*/}
            {/*                    <AccordionHeader className="text-base font-inter uppercase border-b-0"  onClick={() => changeFilterTab(1)}>Цвет</AccordionHeader>*/}
            {/*                    <AccordionBody>*/}
            {/*                        We&apos;re not always in the position that we want to be at. We&apos;re constantly*/}
            {/*                        growing. We&apos;re constantly making mistakes. We&apos;re constantly trying to express*/}
            {/*                        ourselves and actualize our dreams.*/}
            {/*                    </AccordionBody>*/}
            {/*                </Accordion>*/}
            {/*                <Accordion open={filterTab === 2} icon={<FontAwesomeIcon icon={faChevronRight} strokeWidth={2.5} className={`mx-auto h-4 w-4 transition-transform ${filterTab === 2 ? "rotate-90" : ""}`}/>}>*/}
            {/*                    <AccordionHeader className="text-base font-inter uppercase border-b-0"  onClick={() => changeFilterTab(2)}>Категория</AccordionHeader>*/}
            {/*                    <AccordionBody>*/}
            {/*                        We&apos;re not always in the position that we want to be at. We&apos;re constantly*/}
            {/*                        growing. We&apos;re constantly making mistakes. We&apos;re constantly trying to express*/}
            {/*                        ourselves and actualize our dreams.*/}
            {/*                    </AccordionBody>*/}
            {/*                </Accordion>*/}
            {/*                <Accordion open={filterTab === 3} icon={<FontAwesomeIcon icon={faChevronRight} strokeWidth={2.5} className={`mx-auto h-4 w-4 transition-transform ${filterTab === 3 ? "rotate-90" : ""}`}/>}>*/}
            {/*                    <AccordionHeader className="text-base font-inter uppercase border-b-0"  onClick={() => changeFilterTab(3)}>Размер</AccordionHeader>*/}
            {/*                    <AccordionBody>*/}
            {/*                        We&apos;re not always in the position that we want to be at. We&apos;re constantly*/}
            {/*                        growing. We&apos;re constantly making mistakes. We&apos;re constantly trying to express*/}
            {/*                        ourselves and actualize our dreams.*/}
            {/*                    </AccordionBody>*/}
            {/*                </Accordion>*/}
            {/*                <Accordion open={filterTab === 4} icon={<FontAwesomeIcon icon={faChevronRight} strokeWidth={2.5} className={`mx-auto h-4 w-4 transition-transform ${filterTab === 4 ? "rotate-90" : ""}`}/>}>*/}
            {/*                    <AccordionHeader className="text-base font-inter uppercase border-b-0"  onClick={() => changeFilterTab(4)}>Коллекция</AccordionHeader>*/}
            {/*                    <AccordionBody>*/}
            {/*                        We&apos;re not always in the position that we want to be at. We&apos;re constantly*/}
            {/*                        growing. We&apos;re constantly making mistakes. We&apos;re constantly trying to express*/}
            {/*                        ourselves and actualize our dreams.*/}
            {/*                    </AccordionBody>*/}
            {/*                </Accordion>*/}
            {/*                <Accordion open={filterTab === 5} icon={<FontAwesomeIcon icon={faChevronRight} strokeWidth={2.5} className={`mx-auto h-4 w-4 transition-transform ${filterTab === 5 ? "rotate-90" : ""}`}/>}>*/}
            {/*                    <AccordionHeader className="text-base font-inter uppercase border-b-0"  onClick={() => changeFilterTab(5)}>Цена</AccordionHeader>*/}
            {/*                    <AccordionBody>*/}
            {/*                        We&apos;re not always in the position that we want to be at. We&apos;re constantly*/}
            {/*                        growing. We&apos;re constantly making mistakes. We&apos;re constantly trying to express*/}
            {/*                        ourselves and actualize our dreams.*/}
            {/*                    </AccordionBody>*/}
            {/*                </Accordion>*/}
            {/*                <div className="grow w-full"></div>*/}
            {/*                <div className="filter-tab__button w-full pb-4">*/}
            {/*                    <button className="bg-black w-full text-white p-4 rounded-full uppercase text-base font-semibold">Применить фильтр</button>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*        </Card>*/}
            {/*        </CSSTransition>*/}
            {/*    </Drawer>*/}
            {/*</ThemeProvider>*/}
            <div className="block-title py-4 px-8 text-base lg:text-lg uppercase items-center font-semibold font-inter flex flex-row">
                <div>КАТАЛОГ</div>
                {/*<div className="grow"></div>*/}
                {/*<div className="flex flex-row items-center gap-1 font-bold cursor-pointer" onClick={openFilterMenu}>*/}
                {/*    <FilterIcon className="w-5 h-5"/>*/}
                {/*    Фильтр*/}
                {/*</div>*/}
            </div>
        </>
    )
}

export default FilterDrawer;