import { Typography } from "@material-tailwind/react"

const ProductCardLazy = () => {
    return (
        <>
            <div className="card-container h-auto w-[177.5px] lg:w-fit select-none">
                <div className="card-container--content flex flex-col grow justify-start justify-items-start items-start">
                    <div className="card-container__img flex-1">
                        <div className="w-44 h-44 lg:w-60 lg:h-60 overflow-hidden rounded-none overscroll-auto">
                            <div className=" grid min-h-44 lg:h-60 w-full place-items-center rounded-lg bg-gray-300">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="h-12 w-12 text-gray-500 animate-pulse"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="card-container__price-block flex-1 grow w-44 mt-2 lg:w-60">
                        <div className="card-container__price-block-group flex">
                            <div className="card-container__price animate-pulse grow">
                            <span>
                            <Typography
                                        variant="h1"
                                        className="h-4 w-14 rounded-full bg-gray-300"
                            >
                                &nbsp;
                            </Typography>
                            </span>
                            </div>
                            <div
                                className={`card-container__favorite_btn animate-pulse flex-1 text-right cursor-pointer transition-color ease-linear duration-150 flex justify-end`}
                            >
                                <div className="h-5 w-5 rounded-full bg-gray-300 text-right">
                                    &nbsp;
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-container__name animate-pulse w-[11.5rem] text-left mb-auto mt-0.5 uppercase text-balance">
                        <Typography
                                    variant="h1"
                                    className="h-3 w-20 rounded-full bg-gray-300"
                        >
                            &nbsp;
                        </Typography>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProductCardLazy;