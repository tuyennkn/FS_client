"use client";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useAppDispatch } from "@/store/hooks";
import { useEffect } from "react";
import { fetchCart } from "@/features/cart/cartSlice";
import { useAppSelector } from "@/hooks/redux";
import { fetchCategories } from "@/features/category/categorySlice";
import { getUserInfo } from "@/utils/tokenUtils";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);

    // if logged in, fetch cart data
    useEffect(() => {
        const userInfo = getUserInfo();
        dispatch(fetchCategories());
        if (userInfo) {
            dispatch(fetchCart());
        }
    }, [dispatch, user]);

    return (
        <div className="flex min-h-screen flex-col">
            <Navigation />
            {children}
            <Footer />
        </div>
    );
}
