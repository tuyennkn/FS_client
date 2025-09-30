"use client";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useAppDispatch } from "@/store/hooks";
import { useEffect } from "react";
import { fetchCart } from "@/features/cart/cartSlice";
import { useAppSelector } from "@/hooks/redux";
import { fetchCategories } from "@/features/category/categorySlice";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);

    // if logged in, fetch cart data
    useEffect(() => {
        if (user) {
            dispatch(fetchCart());
        }
    }, [dispatch, user]);

    // Additional fetch categories if needed
    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    return (
        <div className="flex min-h-screen flex-col">
            <Navigation />
            {children}
            <Footer />
        </div>
    );
}
