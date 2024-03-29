import Link from "next/link";
import React from "react";

type Props = {
    simple?: boolean
}

export const Header: React.FC<Props> = ({ simple }) => {
    return <header className="global-header">
        <nav className="global-header__container">
            <div className="flex justify-between items-center">
                <Link href="/" className="font-bold text-xl text-indigo-600">
                    Commerble Shop
                </Link>
            </div>
            {!simple&&(
                <div className="flex flex-row ml-auto mt-0">
                    <Link href="/mypage" className="p-2 lg:px-4 md:mx-2 text-gray-600 rounded hover:bg-gray-200 hover:text-gray-700 transition-colors duration-300">
                        MY PAGE
                    </Link>
                    <Link href="/cart" className="p-2 lg:px-4 md:mx-2 text-gray-600 rounded hover:bg-gray-200 hover:text-gray-700 transition-colors duration-300">
                        CART
                    </Link>
                </div>
            )}
        </nav>
    </header>
}