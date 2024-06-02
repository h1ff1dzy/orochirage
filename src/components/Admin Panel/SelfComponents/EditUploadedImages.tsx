import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { PhotoIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import axios from "axios";
import {LazyLoadImage} from "react-lazy-load-image-component";

interface EditUploadedImagesProps {
    images: string[];
    itemId: string;
    token: string;
    refreshItemData: (images: string[]) => void;
}

const EditUploadedImages: React.FC<EditUploadedImagesProps> = ({ images , itemId, token, refreshItemData}) => {
    const [isLoading, setIsLoading] = useState<boolean>(true); // Состояние загрузки
    const [inputIndex, setInputIndex] = useState<number | null>(null);
    const [pendingChanges, setPendingChanges] = useState<boolean>(false);

    const productImages = useMemo(() => {
        const placeholdersNeeded = 4 - images.length;
        const placeholders = new Array(placeholdersNeeded).fill('https://placehold.jp/ffffff/000000/150x150.png');
        return [...images, ...placeholders];
    }, [images]);

    useEffect(() => {
        setIsLoading(false); // После загрузки изображений устанавливаем isLoading в false
    }, [images]);

    const handleImageUpload = useCallback((productId: string, index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsLoading(true); // Устанавливаем isLoading в true при начале загрузки изображения
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Неверный формат изображения. Пожалуйста, выберите файл в формате JPEG, JPG или PNG!', {
                    position: "top-left"
                });
                setIsLoading(false); // В случае ошибки завершаем загрузку и устанавливаем isLoading в false
                return;
            }
            if (file.size > 5000000) {
                toast.error('Размер файла превышает максимально допустимый размер (5MB). Пожалуйста, выберите файл меньшего размера!', {
                    position: "top-left"
                });
                setIsLoading(false); // В случае ошибки завершаем загрузку и устанавливаем isLoading в false
                return;
            }

            const formData = new FormData();
            formData.append('image', file);
            formData.append('index', index.toString());

            axios.post(`https://api.orochirage.ru/api/admin/products/update-images/${productId}`, formData, {
                headers: {
                    Authorization: token,
                }
            })
                .then(response => {
                    const updatedImages = [...productImages];
                    updatedImages[index] = response.data.image;
                    setPendingChanges(true);
                    setIsLoading(false); // После успешной загрузки изображения завершаем процесс загрузки и устанавливаем isLoading в false
                })
                .catch(error => {
                    console.error('Error uploading image:', error);
                    toast.error('Ошибка загрузки изображения', { position: "top-left" });
                    setIsLoading(false); // В случае ошибки завершаем загрузку и устанавливаем isLoading в false
                });
        }
    }, [productImages, token]);


    if (isLoading) {
        return <div>Загрузка...</div>; // Если компонент находится в состоянии загрузки, отображаем надпись "Загрузка"
    }

    if (itemId === "") {
        return <div>Пустой запрос, возникла ошибка в получении параметра itemId</div>;
    }

    if(token === ""){
        return <div>Отсутствует токен авторизации!</div>
    }

    return (
        <>
            {productImages.length > 0 && (
                <div className="flex flex-row mt-4 space-x-2 w-fit overflow-x-auto touch-pan-x snap-x overscroll-none">
                    {productImages.map((image, index) => (
                            <div className="relative overflow-hidden">
                                <div className="group">
                                    <div className="border-collapse !border-2 rounded-lg overflow-hidden">
                                        <LazyLoadImage
                                            src={`${image}?size=150x150`}
                                            placeholderSrc={`${image}?size=25x25`}
                                            alt={`Image ${index + 1}`}
                                            className="w-16 h-16"
                                            placeholder={(
                                                <div className="w-16 h-16">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                        className="h-12 w-12 text-gray-500"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        />
                                    </div>
                                    <div className="absolute cursor-pointer inset-0 flex items-center justify-center bg-gray-800 bg-opacity-0 opacity-0 group-hover:opacity-100 group-hover:bg-opacity-50 rounded-lg transition-opacity duration-300">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png"
                                            style={{ position: 'absolute', opacity: 0, zIndex: 1 }}
                                            onChange={handleImageUpload(itemId, index)}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                            onBlur={() => setInputIndex(null)}
                                            ref={(input) => input && inputIndex === index && input.click()}
                                        />
                                        <PhotoIcon
                                            className="h-10 w-10 text-white cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setInputIndex(index);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                    ))}
                </div>
            )}
        </>
    );
};

export default EditUploadedImages;
