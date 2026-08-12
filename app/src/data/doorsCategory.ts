// Wudgres App - Doors Category Data
import { ImageSourcePropType } from 'react-native';

export interface DoorCategory {
    id: string;
    name: string;
    image: ImageSourcePropType;
    description: string;
}

const doorCategoryImages = {
    timborAcacia: { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/timbor.png" },
    venDecor: { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/ven-decor.png" },
    teakVeneer: { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/teak-veneer.png" },
    lamorous: { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/lamorous.png" },
    metalem: { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/metalem.png" },
    espial: { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/espial.png" },
    divine: { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/divine.png" },
    embozz: { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/embozz.png" },
    lamina: { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/lamina.png" },
    solidWhite: { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/solid-white.png" },
    flushDoors: { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/flush-doors.png" },
};

export const doorCategories: DoorCategory[] = [
    {
        id: 'timbor-acacia',
        name: 'Legacy Wood',
        image: doorCategoryImages.timborAcacia,
        description: 'Premium solid Acacia wood doors with beautiful natural grains',
    },
    {
        id: 'ven-decor',
        name: 'Ven Decor',
        image: doorCategoryImages.venDecor,
        description: 'Elegant veneer doors with refined decorative finishes',
    },
    {
        id: 'teak-veneer',
        name: 'Teak Veneer',
        image: doorCategoryImages.teakVeneer,
        description: 'Classic teak veneer doors with rich natural textures',
    },
    {
        id: 'lamorous',
        name: 'Lamorous',
        image: doorCategoryImages.lamorous,
        description: 'Modern laminate doors for contemporary interiors',
    },
    {
        id: 'metalem',
        name: 'Metalem',
        image: doorCategoryImages.metalem,
        description: 'Stylish doors with metallic accents and bold aesthetics',
    },
    {
        id: 'espial',
        name: 'Espial',
        image: doorCategoryImages.espial,
        description: 'Minimalist door designs with subtle elegance',
    },
    {
        id: 'divine',
        name: 'Divine',
        image: doorCategoryImages.divine,
        description: 'Designer doors inspired by artistic and divine patterns',
    },
    {
        id: 'embozz',
        name: 'Embozz',
        image: doorCategoryImages.embozz,
        description: 'Textured embossed doors with premium surface detailing',
    },
    {
        id: 'lamina',
        name: 'Lamina',
        image: doorCategoryImages.lamina,
        description: 'Sleek laminate doors engineered for durability and style',
    },
    {
        id: 'solid-white',
        name: 'Solid White',
        image: doorCategoryImages.solidWhite,
        description: 'Clean, modern solid white doors for bright interiors',
    },
    {
        id: 'flush-doors',
        name: 'Flush Doors',
        image: doorCategoryImages.flushDoors,
        description: 'Strong and reliable flush doors with a smooth finish',
    },

];

export const getDoorCategoryById = (id: string): DoorCategory | undefined => {
    return doorCategories.find(c => c.id === id);
};
