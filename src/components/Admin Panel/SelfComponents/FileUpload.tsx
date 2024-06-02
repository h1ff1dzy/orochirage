import React, { ChangeEvent, useCallback, useRef, useState, useEffect } from 'react';
import { Button, Dialog, DialogHeader, DialogBody, DialogFooter, Card } from '@material-tailwind/react';
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom";

interface FileUploadProps {
    onFileChange: (files: File[]) => void;
    isEditing?: boolean;
    editingFiles?: FileList | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, isEditing, editingFiles }) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>(isEditing && editingFiles ? Array.from(editingFiles) : []);
    const [filePreviews, setFilePreviews] = useState<string[]>(isEditing && editingFiles ? Array.from(editingFiles).map(file => URL.createObjectURL(file)) : []);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [errorDialog, setErrorDialog] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            // Очистка URL-адресов объектов при размонтировании компонента
            filePreviews.forEach(URL.revokeObjectURL);
        };
    }, []);

    useEffect(() => {
        if (isEditing && editingFiles) {
            setFilePreviews(Array.from(editingFiles).map(file => URL.createObjectURL(file)));
        }
    }, [isEditing, editingFiles]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        const newFiles = files ? Array.from(files) : [];
        const remainingSlots = 4 - filePreviews.length;

        if (newFiles.length > remainingSlots) {
            setErrorDialog("Максимальное количество файлов - 4.");
            return;
        }

        const updatedFiles = [...selectedFiles, ...newFiles];
        const updatedPreviews = [...filePreviews, ...newFiles.map(file => URL.createObjectURL(file))];

        setSelectedFiles(updatedFiles);
        setFilePreviews(updatedPreviews);
        onFileChange(updatedFiles);
    };

    const imgRef = useRef<HTMLImageElement | null>(null);
    const onUpdate = useCallback(({ x, y, scale }: { x: number; y: number; scale: number }) => {
        const img = imgRef.current;

        if (img) {
            const value = make3dTransformValue({ x, y, scale });

            img.style.setProperty("transform", value);
        }
    }, []);

    const handleImageClick = (preview: string) => {
        setSelectedImage(preview);
        setShowModal(true);
    };

    const isImage = (file: File): boolean => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        return allowedTypes.includes(file.type);
    };

    const handleImageRemove = (index: number) => {
        const newFiles = [...selectedFiles];
        const newPreviews = [...filePreviews];
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        setSelectedFiles(newFiles);
        setFilePreviews(newPreviews);
        onFileChange(newFiles);
    };

    return (
        <>
            <div className="mt-4 uploader w-full">
                <div className="mt-1 flex w-full">
                    <span className="sr-only">Загрузить</span>
                    <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        multiple
                    />
                    <div className="w-full">
                        <Button
                            className="w-full min-h-12 flex justify-center items-center"
                            color="gray"
                            variant="gradient"
                            size="sm"
                            onClick={() => document.getElementById('file-upload')?.click()}
                            disabled={filePreviews.length >= 4}
                        >
                            <CloudArrowUpIcon className="h-5 w-5" />
                            <span className="ml-2">Выберите фотографии</span>
                        </Button>
                    </div>
                </div>
            </div>
            {filePreviews.length > 0 && (
                <div className="flex flex-row mt-4 space-x-2 w-fit overflow-x-auto touch-pan-x snap-x overscroll-none">
                    {filePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                            <img
                                src={preview}
                                alt={`Preview ${index}`}
                                className="w-24 h-24 object-cover cursor-pointer snap-center"
                                onClick={() => handleImageClick(preview)}
                            />
                            <button
                                className="absolute top-0 right-0 mt-1 mr-1 p-1 bg-white/50 rounded-full backdrop-blur-md opacity-100 hover:bg-white transition duration-200 hover:scale-110"
                                onClick={() => handleImageRemove(index)}
                            >
                                <XMarkIcon className="h-5 w-5 text-black" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <Dialog
                animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0.9, y: -100 },
                }}
                size="xl"
                className="bg-transparent shadow-none !w-[92vw] !h-[100vh]"
                open={showModal}
                handler={() => setShowModal(false)}>
                <Card
                    className="mx-auto h-full w-full bg-transparent flex flex-row justify-around">
                    <button
                        className="absolute top-4 right-4 z-[999] p-1 bg-white/50 rounded-full backdrop-blur-md opacity-100 hover:bg-white transition duration-200"
                        onClick={() => setShowModal(false)}>
                        <XMarkIcon className="h-5 w-5 text-black" />
                    </button>
                    {selectedImage && (
                        <QuickPinchZoom draggableUnZoomed={false} centerContained setOffsetsOnce={true} enforceBoundsDuringZoom={false} onUpdate={onUpdate}>
                            <img
                                ref={imgRef}
                                src={selectedImage}
                                alt="Selected Image"
                                className="object-contain w-full h-full"
                                style={{ transform: 'scale(1)', touchAction: 'none' }} // Устанавливаем начальное значение для transform
                            />
                        </QuickPinchZoom>
                    )}
                </Card>
            </Dialog>

            {/* Error Dialog */}
            <Dialog size="lg" open={!!errorDialog} handler={() => setErrorDialog(null)}>
                <DialogHeader >Ошибка</DialogHeader>
                <DialogBody >
                    <p>{errorDialog}</p>
                </DialogBody>
                <DialogFooter >
                    <Button color="red" variant="text" onClick={() => setErrorDialog(null)}>Закрыть</Button>
                </DialogFooter>
            </Dialog>
        </>
    );
};

export default FileUpload;
