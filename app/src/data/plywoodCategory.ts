// Wudgres App - Plywood Category Data
import { ImageSourcePropType } from 'react-native';

export interface PlywoodCategory {
    id: string;
    name: string;
    image: ImageSourcePropType;
    description: string;
}

const plywoodCategoryImages = {
    plywood: { uri: 'https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/plywood/plywoodmain.jpeg' },
    blockBoard: { uri: 'https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/plywood/blockboardmain.jpeg' },
};

export const plywoodCategories: PlywoodCategory[] = [
    {
        id: 'plywood',
        name: 'Plywood',
        image: plywoodCategoryImages.plywood,
        description:
            'Premium quality plywood for all your interior and exterior woodworking needs.',
    },
    {
        id: 'block-boards',
        name: 'Block Boards',
        image: plywoodCategoryImages.blockBoard,
        description:
            'Durable and strong block boards for constructing robust furniture and doors.',
    },
];

export const getPlywoodCategoryById = (
    id: string
): PlywoodCategory | undefined => {
    return plywoodCategories.find(category => category.id === id);
};
