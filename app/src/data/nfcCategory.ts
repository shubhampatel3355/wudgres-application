// Wudgres App - NFC Category Data
import { ImageSourcePropType } from 'react-native';

export interface NFCCategory {
    id: string;
    name: string;
    image: ImageSourcePropType;
    description: string;
}

// NFC category images (using door images as placeholders until NFC images are added)
const nfcCategoryImages = {
    nfcDoors: require('../assets/images/wpc/NFC Doors.png'),
    nfcFrames: require('../assets/images/wpc/NFC Frames Bg.png'),
};

export const nfcCategories: NFCCategory[] = [
    {
        id: 'nfc-doors',
        name: 'NFC Doors',
        image: nfcCategoryImages.nfcDoors,
        description:
            'Premium NFC laminated doors with advanced surface finish, durability, and modern design aesthetics',
    },
    {
        id: 'nfc-frames',
        name: 'NFC Frames',
        image: nfcCategoryImages.nfcFrames,
        description:
            'High-quality NFC laminated door frames engineered for strength, consistency, and long-term performance',
    },
];

export const getNFCCategoryById = (
    id: string
): NFCCategory | undefined => {
    return nfcCategories.find(category => category.id === id);
};
