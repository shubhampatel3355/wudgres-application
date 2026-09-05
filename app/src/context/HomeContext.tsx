import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Image } from 'react-native';
import { supabase } from '../lib/supabase';
import { categories } from '../data/mockData';

interface HomeContextType {
  userName: string;
  heroContent: any;
  dynamicCategories: any[];
  preloadHomeData: () => Promise<void>;
  isLoading: boolean;
}

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export const HomeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userName, setUserName] = useState<string>('User');
  const [heroContent, setHeroContent] = useState<any>(null);
  const [dynamicCategories, setDynamicCategories] = useState<any[]>(categories);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const mountedRef = React.useRef(true);

  React.useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const preloadHomeData = async () => {
    try {
      setIsLoading(true);

      const fetchUser = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', user.id)
              .single();
            if (data?.name) {
              setUserName(data.name.split(' ')[0]);
            }
          }
        } catch (err) {
          console.warn('Error fetching user', err);
        }
      };

      const fetchHeroContent = async () => {
        try {
          const { data } = await supabase
            .from('app_hero_content')
            .select('*')
            .limit(1)
            .maybeSingle();
          if (data && mountedRef.current) {
            setHeroContent(data);
          }
        } catch (err) {
          console.warn('Error fetching hero content', err);
        }
      };

      const fetchCategoryImages = async () => {
        try {
          const { data } = await supabase.from('app_category_images').select('*');
          if (data && data.length > 0 && mountedRef.current) {
            const updatedCategories = categories.map((cat) => {
              const remoteCat = data.find((d) => d.id === cat.id);
              if (remoteCat && remoteCat.image_url) {
                return { ...cat, image: { uri: remoteCat.image_url } };
              }
              return cat;
            });
            setDynamicCategories(updatedCategories);

            // Prefetch category images for smooth loading
            const imagePromises = updatedCategories
              .filter(cat => cat.image?.uri)
              .map(cat => Image.prefetch(cat.image!.uri).catch(() => {}));

            await Promise.all(imagePromises);
          }
        } catch (err) {
          console.warn('Error fetching category images', err);
        }
      };

      await Promise.all([fetchUser(), fetchHeroContent(), fetchCategoryImages()]);
    } catch (error) {
      console.warn('Error preloading home data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HomeContext.Provider
      value={{
        userName,
        heroContent,
        dynamicCategories,
        preloadHomeData,
        isLoading,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};

export const useHomeContext = () => {
  const context = useContext(HomeContext);
  if (context === undefined) {
    throw new Error('useHomeContext must be used within a HomeProvider');
  }
  return context;
};
