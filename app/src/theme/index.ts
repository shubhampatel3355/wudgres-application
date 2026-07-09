// Wudgres App Theme Configuration
export const theme = {
    colors: {
        // Primary colors
        primary: '#C4A962',
        primaryDark: '#A08545',

        // Background colors
        background: '#1A1A1A',
        backgroundLight: '#2B2B2B',
        backgroundCard: '#333333',

        // Surface colors
        surface: '#FFFFFF',
        surfaceLight: '#F5F5F5',

        // Text colors
        textPrimary: '#FFFFFF',
        textSecondary: '#AAAAAA',
        textDark: '#333333',
        textMuted: '#666666',

        // Input colors
        inputBackground: '#1A1A1A',
        inputBorder: '#444444',
        inputPlaceholder: '#888888',

        // Status colors
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
        sv: 0,
    },

    borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        xxl: 24,
        full: 9999,
    },

    fontSize: {
        fontFamily: 'Unbounded_400Regular',
        xs: 10,
        sm: 12,
        md: 14,
        lg: 16,
        xl: 18,
        xxl: 24,
        xxxl: 32,
    },
};

export type Theme = typeof theme;
