import React from "react";
import {Link} from "react-router-dom";
import {Typography} from "@material-tailwind/react";

export const CardItemLazy = () => {

    const lazyImage = encodeURIComponent(`
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21 36.5L27.085 30.3092C27.3314 30.0585 27.624 29.8596 27.9459 29.7239C28.2679 29.5882 28.613 29.5184 28.9615 29.5184C29.31 29.5184 29.6551 29.5882 29.9771 29.7239C30.2991 29.8596 30.5917 30.0585 30.8381 30.3092L36.9231 36.5M35.1538 34.7L36.8157 33.0092C37.0622 32.7585 37.3547 32.5596 37.6767 32.4239C37.9987 32.2882 38.3438 32.2184 38.6923 32.2184C39.0408 32.2184 39.3859 32.2882 39.7079 32.4239C40.0299 32.5596 40.3224 32.7585 40.5689 33.0092L44 36.5M22.7692 41H42.2308C42.7 41 43.15 40.8104 43.4818 40.4728C43.8136 40.1352 44 39.6774 44 39.2V24.8C44 24.3226 43.8136 23.8648 43.4818 23.5272C43.15 23.1896 42.7 23 42.2308 23H22.7692C22.3 23 21.85 23.1896 21.5182 23.5272C21.1864 23.8648 21 24.3226 21 24.8V39.2C21 39.6774 21.1864 40.1352 21.5182 40.4728C21.85 40.8104 22.3 41 22.7692 41ZM35.1538 27.5H35.1633V27.5096H35.1538V27.5ZM35.5962 27.5C35.5962 27.6193 35.5496 27.7338 35.4666 27.8182C35.3837 27.9026 35.2712 27.95 35.1538 27.95C35.0365 27.95 34.924 27.9026 34.8411 27.8182C34.7581 27.7338 34.7115 27.6193 34.7115 27.5C34.7115 27.3807 34.7581 27.2662 34.8411 27.1818C34.924 27.0974 35.0365 27.05 35.1538 27.05C35.2712 27.05 35.3837 27.0974 35.4666 27.1818C35.5496 27.2662 35.5962 27.3807 35.5962 27.5Z" stroke="#858585" stroke-width="2"/>
</svg>


  `);


    return (
        <>
            <div className="hero-pattern w-min cursor-pointer card_collection min-w-64 min-h-64 bg-white rounded-[1.25rem] shadow-md flex flex-col justify-end text-left pl-5 pb-5 w-72 first:w-[34rem] snap-center"
                 style={
                {
                    backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.45)),url("data:image/svg+xml,${lazyImage}?size=500x256")`, // Вставляем SVG-код внутрь URL
                    backgroundSize: "cover",
                    backgroundPosition: "center"}}>
                <div className="card_collection__title flex animate-pulse flex">
                    <Typography

                        as="div"
                        variant="h1"
                        className="mb-4 h-3 w-48 rounded-full bg-gray-300"
                    >
                        &nbsp;
                    </Typography>
                </div>
                <div className="card_collection__description animate-pulse flex flex-col text-wrap text-pretty break-words text-ellipsis overflow-hidden h-auto">
                    <Typography

                        as="div"
                        variant="paragraph"
                        className="mb-2 h-2 w-56 rounded-full bg-gray-300"
                    >
                        &nbsp;
                    </Typography>
                    <Typography

                        as="div"
                        variant="paragraph"
                        className="mb-2 h-2 w-48 rounded-full bg-gray-300"
                    >
                        &nbsp;
                    </Typography>
                </div>
            </div>
        </>
    )
}

interface CardItemProps {
    _id: string;
    name: string;
    description: string;
    link: string;
    card_img: string;
    index: number;
}

export const CardItem: React.FC<CardItemProps> = ({ _id, name, description, link, card_img, index }) => {
    return (
        <>
            <Link
                to={`/collection/${link}`}
                className={`hero-pattern w-min cursor-pointer card_collection min-w-64 min-h-64 bg-[#1da1f2] rounded-[1.25rem] shadow-md flex flex-col justify-end text-left pl-5 pb-5 w-72 ${index === 0 ? 'lg:first:w-[34rem]' : ''} snap-center border-collapse`}
                style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.65)),url(${card_img})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}>
                <div>
                    <div className="card_collection__title flex">
                        {name}
                    </div>
                    <div className="card_collection__description flex text-balance break-words text-ellipsis overflow-hidden h-auto">
                        {description}
                    </div>
                </div>
            </Link>
        </>
    );
};