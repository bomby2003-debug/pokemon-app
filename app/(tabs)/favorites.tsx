import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';

type FavoritePokemon = {
  name: string;
};

export default function Favorites() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const columns = width > 1200 ? 4 : width > 700 ? 3 : 2;

  const cardWidth =
    columns === 4 ? '23%' : columns === 3 ? '31%' : '48%';

  const [favorites, setFavorites] = useState<any[]>([]);

  const loadFavorites = async () => {
    const data = await AsyncStorage.getItem('favorites');
    const saved = data ? JSON.parse(data) : [];

    const detailedData = await Promise.all(
      saved.map(async (item: FavoritePokemon | string) => {
        const pokemonName = typeof item === 'string' ? item : item.name;

        const res = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
        );

        return res.json();
      })
    );

    setFavorites(detailedData);
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const removeFavorite = async (name: string) => {
    const data = await AsyncStorage.getItem('favorites');
    const saved = data ? JSON.parse(data) : [];

    const updatedFavorites = saved.filter((item: FavoritePokemon | string) => {
      const pokemonName = typeof item === 'string' ? item : item.name;
      return pokemonName !== name;
    });

    await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setFavorites((prev) => prev.filter((item) => item.name !== name));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorites ❤️</Text>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={{
              uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
            }}
            style={styles.pokeballImage}
          />

          <Text style={styles.emptyTitle}>No Favorite Pokémon Yet</Text>
          <Text style={styles.emptySubtitle}>
            Go choose your favorite Pokémon!
          </Text>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.homeButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {favorites.map((item) => {
              const imageUrl =
                item.sprites.other['official-artwork'].front_default ||
                item.sprites.front_default;

              return (
                <View
                  key={item.name}
                  style={[
                    styles.card,
                    {
                      width: cardWidth,
                    },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() =>
                      router.push({
                        pathname: '/pokemon/[name]',
                        params: { name: item.name },
                      })
                    }
                  >
                    <View style={styles.imageBox}>
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        resizeMode="contain"
                      />
                    </View>

                    <Text style={styles.id}>
                      #{String(item.id).padStart(4, '0')}
                    </Text>

                    <Text style={styles.name} numberOfLines={1}>
                      {item.name}
                    </Text>

                    <View style={styles.typeContainer}>
                      {item.types.map((t: any) => {
                        const typeName = t.type.name;

                        return (
                          <Text
                            key={typeName}
                            style={[
                              styles.type,
                              {
                                backgroundColor:
                                  typeColors[typeName] || '#94a3b8',
                              },
                            ]}
                          >
                            {typeName}
                          </Text>
                        );
                      })}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFavorite(item.name)}
                  >
                    <Text style={styles.removeText}>Remove ❤️</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const typeColors: any = {
  grass: '#8BC34A',
  fire: '#FF7A21',
  water: '#4FC3F7',
  electric: '#FACC15',
  poison: '#B77AD5',
  bug: '#9CCC65',
  normal: '#A8A77A',
  ground: '#D6B35A',
  fairy: '#EC8FE6',
  fighting: '#C22E28',
  psychic: '#F95587',
  rock: '#B6A136',
  ghost: '#735797',
  ice: '#96D9D6',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  flying: '#A98FF3',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 24,
  },
  grid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  paddingBottom: 40,
},
  card: {
  height: 380,
  marginBottom: 34,
  marginRight: 24,
},
  imageBox: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  image: {
    width: '90%',
    height: '90%',
  },
  id: {
    fontSize: 14,
    color: '#8b8b8b',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    textTransform: 'capitalize',
    color: '#111827',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  type: {
    color: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 4,
    textTransform: 'capitalize',
    fontSize: 14,
    minWidth: 80,
    textAlign: 'center',
    marginRight: 6,
    marginBottom: 6,
    overflow: 'hidden',
  },
  removeButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 9,
    borderRadius: 6,
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
  },
  removeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pokeballImage: {
    width: 90,
    height: 90,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
    textAlign: 'center',
  },
  homeButton: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  homeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});