// Wudgres App - Mock Data with Real Images
import { User } from '../types';

export const backgroundImages = {
    woodTexture: require('../assets/images/backgrounds/wood-texture.jpg'),
    logo: require('../assets/images/logo.png'),
    hero: require('../assets/images/backgrounds/wood-texture.jpg'), // Fallback
};

// Category images are now served from Supabase Storage.
// These are null fallbacks — the app fetches live URLs from app_category_images table.
const categoryImages = {
    doors: null,
    enggWood: null,
    plywood: null,
    windowshutters: null,
    nfc: null,
};

const seriesImages = {
    venDecor: { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/ven-decor.png" },
    lamorous: { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/lamorous.png" },
    timbor: { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/timbor.png" },
    teakVeneer: { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/teak-veneer.png" },
    metalem: { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/metalem.png" },
    espial: { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/espial.png" },
    divine: { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/divine.png" },
    embozz: { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/embozz.png" },
    lamina: { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/lamina-2.png" },
    solidWhite: { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/solid-white.png" },
    flushDoors: { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/flush-doors.png" },
};

export const categories = [
    {
        id: 'doors',
        name: 'Doors',
        image: categoryImages.doors,
        productCount: 150,
    },
    {
        id: 'nfc',
        name: 'NFC',
        image: categoryImages.nfc,
        productCount: 20,
    },
    {
        id: 'window-shutters',
        name: 'Window Shutters',
        image: categoryImages.windowshutters,
        productCount: 15,
    },
    {
        id: 'plywood',
        name: 'Plywood & Block Boards',
        image: categoryImages.plywood,
        productCount: 30,
    },
    {
        id: 'eng-wood-frames',
        name: 'Eng. Wood Frames',
        image: categoryImages.enggWood,
        productCount: 50,
    },
];

export const series = [
    {
        id: 'timbor',
        name: 'Legacy Wood',
        image: seriesImages.timbor,
        categoryId: 'doors',
        productCount: 14,
    },
    {
        id: 'ven-decor',
        name: 'Ven Decor',
        image: seriesImages.venDecor,
        categoryId: 'doors',
        productCount: 25,
    },
    {
        id: 'teak-veneer',
        name: 'Teak Veneer',
        image: seriesImages.teakVeneer,
        categoryId: 'doors',
        productCount: 10,
    },
    {
        id: 'lamorous',
        name: 'Lamorous',
        image: seriesImages.lamorous,
        categoryId: 'doors',
        productCount: 18,
    },
    {
        id: 'metalem',
        name: 'Metalem',
        image: seriesImages.metalem,
        categoryId: 'doors',
        productCount: 5,
    },
    {
        id: 'espial',
        name: 'Espial',
        image: seriesImages.espial,
        categoryId: 'doors',
        productCount: 8,
    },
    {
        id: 'divine',
        name: 'Divine',
        image: seriesImages.divine,
        categoryId: 'doors',
        productCount: 6,
    },
    {
        id: 'embozz',
        name: 'Embozz',
        image: seriesImages.embozz,
        categoryId: 'doors',
        productCount: 12,
    },
    {
        id: 'lamina',
        name: 'Lamina',
        image: seriesImages.lamina,
        categoryId: 'doors',
        productCount: 15,
    },
    {
        id: 'solid-white',
        name: 'Solid White',
        image: seriesImages.solidWhite,
        categoryId: 'doors',
        productCount: 20,
    },
    {
        id: 'flush-doors',
        name: 'Flush Doors',
        image: seriesImages.flushDoors,
        categoryId: 'doors',
        productCount: 30,
    },
];

export const currentUser: User = {
    id: '1',
    name: 'Gaurang',
    email: 'gaurang@example.com',
    phone: '+91 98765 43210',
};
