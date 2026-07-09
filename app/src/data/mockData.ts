// Wudgres App - Mock Data with Real Images
import { User } from '../types';

export const backgroundImages = {
    woodTexture: require('../assets/images/backgrounds/wood-texture.jpg'),
    logo: require('../assets/images/logo.png'),
    hero: require('../assets/images/backgrounds/wood-texture.jpg'), // Fallback
};

const categoryImages = {
    doors: require('../assets/images/home/Door Forest Web bg.jpg'),
    enggWood: require('../assets/images/home/Frames Bg.jpg'),
    plywood: require('../assets/images/home/Ply Wood Bg.jpg'),
    windowshutters: require('../assets/images/home/WINDOWS Web BG.jpg'),
    nfc: require('../assets/images/home/NFC Web bg.jpg'),
};

const seriesImages = {
    venDecor: require('../assets/images/door/door-image/Ven-Decor.png'),
    lamorous: require('../assets/images/door/door-image/Lamorous.png'),
    timbor: require('../assets/images/door/timbor/Timbor Bg.png'),
    teakVeneer: require('../assets/images/door/teak/Teak Veneer Bg.png'),
    metalem: require('../assets/images/door/metalem/Metalem Bg.png'),
    espial: require('../assets/images/door/espial/Espial Bg.png'),
    divine: require('../assets/images/door/divine/Divine Bg.png'),
    embozz: require('../assets/images/door/embozz/Embozz Bg.png'),
    lamina: require('../assets/images/door/lamina/Lamina 2.jpeg'),
    solidWhite: require('../assets/images/door/door-image/Solid White.png'),
    flushDoors: require('../assets/images/door/door-image/Flush Doors.png'),
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
        name: 'Timbor',
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
