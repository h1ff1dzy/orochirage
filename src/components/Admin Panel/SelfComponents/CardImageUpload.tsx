import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CameraIcon } from "@heroicons/react/24/solid";
import {toast} from "react-toastify";

interface ImageUploaderProps {
    token: string;
    imageLink?: string;
    itemId: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ token, imageLink, itemId }) => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>(imageLink || '');
    const [showUploadIcon, setShowUploadIcon] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if(imageLink != null && imageLink != '')
        {
            console.log("image not null")
            setImageUrl(imageLink)
        }
    }, [imageLink])

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];

        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('Размер изображения должен быть не более 5 МБ');
            return;
        }

        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            setError('Допустимые форматы изображения: PNG, JPEG, JPG');
            return;
        }
        setError('');

        setSelectedImage(file);
        setShowUploadIcon(true);

        // Upload image immediately after selection
        await handleImageUpload(file);
    };


    const handleImageUpload = async (image: File) => {
        try {
            const formData = new FormData();
            formData.append('image', image);

            await axios.post(
                `https://api.orochirage.ru/api/admin/collection/card/${itemId}/image/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: token,
                    },
                }
            ).then(response => {
                if(response.status != 200)
                    return toast.error(`Ошибка загрузки изображения ${response.data.error}`, { position: "top-left" })
                toast.success('Изображение карточки успешно загружено', { position: "top-left" });
                setImageUrl(response.data.image)
                setSelectedImage(null)
            })
        } catch (error) {
            console.error('Error uploading image:', error);
            return toast.error(`Ошибка загрузки изображения, смотри консоль`, { position: "top-left" })

        }
    };

    const handleImageClick = () => {
        if (!selectedImage) {
            document.getElementById('imageInput')?.click();
        }
    };

    const handleUploadIconClick = () => {
        document.getElementById('imageInput')?.click();
    };

    const handleMouseEnter = () => {
        setShowUploadIcon(true);
    };

    const handleMouseLeave = () => {
        setShowUploadIcon(false);
    };

    return (
        <div className="flex flex-col items-center">
            <input type="file" accept="image/png, image/jpeg, image/jpg" id="imageInput" onChange={handleImageChange} style={{ display: 'none' }} />
            <div className="relative cursor-pointer" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <img
                    src={imageUrl ? imageUrl : "https://placehold.jp/ffffff/000000/600x600.png"}
                    alt="Фотография для загрузки"
                    className="max-w-[16.5rem] max-h-[16.5rem] min-w-[16.5rem] min-h-[16.5rem] border-collapse rounded-lg shadow-lg object-contain"
                    onClick={handleImageClick}
                />
                <div className={`transition-opacity opacity-0 absolute inset-0 flex rounded-lg items-center justify-center bg-black text-white transition-opacity duration-300 ${showUploadIcon ? 'opacity-50' : 'opacity-0'}`} onClick={handleUploadIconClick}>
                    <CameraIcon className="h-10 w-10"/>
                </div>
            </div>
            {error && (
                <div className="text-red-500 mt-2 text-sm animate-[fade-in_1s_ease-in-out]">{error}</div>
            )}
        </div>
    );
};

export default ImageUploader;
