// Wudgres App - Doors Category Data
import { ImageSourcePropType } from 'react-native';

export interface DoorCategory {
    id: string;
    name: string;
    image: ImageSourcePropType;
    description: string;
}

// Use existing series images for door categories
const doorCategoryImages = {
    timborAcacia: require('../assets/images/door/timbor/Timbor.png'),
    venDecor: require('../assets/images/door/door-image/Ven-Decor.png'),
    teakVeneer: require('../assets/images/door/teak/Teak Veneer.png'),
    lamorous: require('../assets/images/door/door-image/Lamorous.png'),
    metalem: require('../assets/images/door/metalem/Metalem.png'),
    espial: require('../assets/images/door/espial/Espial.png'),
    divine: require('../assets/images/door/divine/Divine.png'),
    embozz: require('../assets/images/door/embozz/Embozz.png'),
    lamina: require('../assets/images/door/lamina/Lamina.png'),
    solidWhite: require('../assets/images/door/door-image/Solid White.png'),
    flushDoors: require('../assets/images/door/door-image/Flush Doors.png'),
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
