// Counter.tsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

const Counter = ({ Price, defaultCount, onChangePrice, onQuantityChange }: { Price: number, defaultCount: number, onChangePrice: (newPrice: number) => void, onQuantityChange: (newQuantity: number) => void }) => {
    const [count, setCount] = useState(defaultCount);
    const [price, setPrice] = useState(Price);

    const increment = () => {
        if (count >= 99) {
            return;
        }
        setCount(count + 1);
        onQuantityChange(count + 1); // Вызываем колбэк при увеличении количества
        onChangePrice(price * (count + 1));
    };

    const decrement = () => {
        if(count == 1)
            return;
        if (count > 0) {
            setCount(count - 1);
            onQuantityChange(count - 1); // Вызываем колбэк при уменьшении количества
            onChangePrice(price * (count - 1));
        }
    };

    return (
        <div className="cart-item__content-container-block-iterator flex flex-row content-center items-center">
            <button className="iterator_btn transition hover:!bg-gray-200" onClick={decrement}><FontAwesomeIcon icon={faMinus} size="1x" strokeWidth={2.5} /></button>
            <span className="ml-2 mr-2 text-center iterator_count w-7">{count}</span>
            <button className="iterator_btn transition hover:!bg-gray-200" onClick={increment}><FontAwesomeIcon icon={faPlus} size="1x" strokeWidth={2.5} /></button>
        </div>
    );
};

export default Counter;
