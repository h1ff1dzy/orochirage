import { Button, Typography } from "@material-tailwind/react";
import React from "react";

type PaginationProps = {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    paginate: (pageNumber: number) => void;
};

const Pagination = ({ itemsPerPage, totalItems, currentPage, paginate }: PaginationProps) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const goToPrevPage = () => {
        if (currentPage > 1) {
            paginate(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            paginate(currentPage + 1);
        }
    };

    return (
        <>
            <Typography variant="small" color="blue-gray" className="font-normal">
                Страница {currentPage} из {totalPages}
            </Typography>
            <div className="flex gap-2">
                <Button disabled={currentPage === 1} onClick={goToPrevPage} variant="outlined" size="sm">
                    Назад
                </Button>
                <Button disabled={currentPage === totalPages} onClick={goToNextPage} variant="outlined" size="sm">
                    Далее
                </Button>
            </div>
        </>
    );
};

export default Pagination;
