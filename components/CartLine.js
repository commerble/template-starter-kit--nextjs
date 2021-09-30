import { Price } from "./Price"
import { TrashIcon, MinusIcon, PlusIcon } from "@heroicons/react/outline"

const emptyCallback = () => {};

export const CartLine = ({
    productId,
    name,
    variation,
    unitPrice,
    qty,
    img,
    onIncClick = emptyCallback,
    onDecClick = emptyCallback,
    onRemoveClick = emptyCallback,
    disabled = false,
    hiddenActions = false,
}) => {
    return <article className="flex flex-col md:flex-row items-center gap-8">
        <div className="w-36">
            <div className="image image-squircle">
                <img src={img} alt="Sample image" loading="lazy" decoding="async"/>
            </div>
        </div>
        <div className="flex-1">
            <div className="flex flex-row justify-between items-baseline">
                <h1 className="mr-8 inline-block">{name}</h1>
                <h2 className="text-sm text-gray-500 inline-block">{variation}</h2>
            </div>
            <p className="text-lg my-4"><Price value={unitPrice} mark/> {hiddenActions && <span>&times; {qty}</span>}</p>
            {!hiddenActions&&(
                <div className="flex flex-row items-center gap-4">
                    <button onClick={() => onDecClick(productId)} disabled={disabled || qty<=1}><MinusIcon className="h-5 w-5 text-gray-500 border-2 border-gray-300 rounded-md"/></button>
                    <span>{qty}</span>
                    <button onClick={() => onIncClick(productId)} disabled={disabled}><PlusIcon className="h-5 w-5 text-gray-500 border-2 border-gray-300 rounded-md"/></button>
                    <span className="flex-grow"></span>
                    <button onClick={() => onRemoveClick(productId)} disabled={disabled}><TrashIcon className="h-5 w-5 text-gray-500"/></button>
                </div>)}
        </div>
    </article>
}