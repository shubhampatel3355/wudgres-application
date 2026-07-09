// Type definitions for Wudgres App
import { ImageSourcePropType } from 'react-native';

export interface Product {
    id: string;
    img: ImageSourcePropType;
    slug: string;
    name: string;
    description: string;
    series: string;
    thickness?: string;
    height?: string;
    width?: string;
    finish?: string;
    usage?: string;
    type?: string;
    veneers?: string;
    VENEER?: VeneerOption[];
}

export interface VeneerOption {
    img: string;
    text: string;
}

export interface Category {
    id: string;
    name: string;
    image: ImageSourcePropType;
    productCount: number;
}

export interface Series {
    id: string;
    name: string;
    image: ImageSourcePropType;
    categoryId: string;
    productCount: number;
}

export interface User {
    id: string;
    name: string;
    email?: string;
    phone?: string;
}

// Navigation types
export type RootStackParamList = {
    Login: undefined;
    Main: undefined;
    AllProducts: { categoryId?: string };
    ProductSeries: { seriesName: string; categoryId?: string };
    ProductDetail: { productId: string };
    NfcDoorDetail: { productId: string };
};

export type BottomTabParamList = {
    Home: undefined;
    Products: undefined;
    Gallery: undefined;
    Profile: undefined;
};
