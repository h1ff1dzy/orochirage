import React, { useEffect, useState } from 'react';
import Counter from "./Counter";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useCart } from "../../context/CartProvider";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import numeral from "numeral";

interface Product {
    Title: string;
    _id: string;
    Price: number;
    Images: string[];
    Colors: string[];
    Sizes: string[];
}

interface CartItemProps {
    Title: string;
    _id: string;
    Color: string;
    Size: string;
    onRemove: (id: string, color: string, size: string) => void;
    Price: number;
    Quantity: number;
    onQuantityChange: (id: string, color: string, size: string, newQuantity: number) => void;
    className: string;
}

const CartItem = ({ Title, _id, Color, Size, onRemove, Price, Quantity, onQuantityChange, className }: CartItemProps) => {
    const [product, setProduct] = useState<Product | null>(null);
    const { cartItems } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get<Product>(`https://api.orochirage.ru/api/products/${_id}`);
                setProduct(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchProduct();
    }, [_id]);

    const handleQuantityChange = (newQuantity: number) => {
        onQuantityChange(_id, Color, Size, newQuantity);
    };

    const [isRemoved, setIsRemoved] = useState(false);

    const handleRemove = () => {
        setIsRemoved(true);
        setTimeout(() => {
            onRemove(_id, Color, Size);
        }, 300); // Дождитесь завершения анимации перед удалением элемента
    };

    return (
        <div key={_id} className={`cartItem transition ease-out duration-1000 cart_item flex flex-row max-w-[23.75rem] h-fit ${isRemoved ? 'animate-slide-left' : ''}`}>
            <div className="cart_item__img">
                <Link to={`/product/${product?._id}`}>
                    <LazyLoadImage src={`${product?.Images[0]}?size=272x200`}
                                   loading="lazy"
                                   className="w-[11.25rem] h-[17rem] object-scale-down"
                                   alt={`Фотография товара ${product?.Title}`}
                                   placeholderSrc={`${product?.Images[0]}?size=50x50`}
                    />
                </Link>
            </div>
            <div className="cart-item__content-container pl-3 flex flex-col text-left">
                <div className="cart-item__content-container-title w-[222px]">
                    <Link to={`/product/${product?._id}`}>{product?.Title}</Link>
                </div>
                <div className="cart-item__content-container-price">
                    {numeral(Price * Quantity).format('0,0.00 $')}
                </div>
                <div className="cart-item__content-container-size-selection color_selector flex flex-row flex-wrap gap-2 items-center pt-2">
                    <div className="cart-item__content-container-size-selection__container">
                        <div className="cart-item__content-container-size-selection__header font-bold text-sm mb-2">
                            Выбранный размер
                        </div>
                        <div className="cart-item__content-container-size-selection__footer">
                            <a
                                href="#"
                                className="transition-colors duration-300 ease-out size_selector__item opacity-100"
                            >
                                {Size}
                            </a>
                        </div>
                    </div>
                </div>
                <div className="cart-item__content-container-color-selection grow">
                    <div className="color_selector flex flex-row gap-2 items-center pt-3">
                        <a
                            href="#"
                            className={`transition-colors duration-300 ease-out color_selector__item active ${Color === "white" ? 'border-collapse' : ''}`}
                            style={{ backgroundColor: Color }}
                        >
                        </a>
                    </div>
                </div>
                <div className="cart-item__content-container-block flex flex-row content-center items-center pt-4">
                    <div className="cart-item__content-container-block-iterator">
                        <Counter Price={Price} defaultCount={Quantity} onChangePrice={() => {}} onQuantityChange={handleQuantityChange} />
                    </div>
                    <div className="cart-item__content-container-block-removal-btn ml-3">
                        <FontAwesomeIcon className="cursor-pointer transition-opacity opacity-40 hover:opacity-100"
                                         icon={faTrash}
                                         size="sm"
                                         onClick={handleRemove}
                                         strokeWidth={2.5} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItem;
