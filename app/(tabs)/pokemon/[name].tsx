import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PokemonDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const pokemonName = Array.isArray(params.name)
    ? params.name[0]
    : params.name;

  const [pokemon, setPokemon] = useState<any>(null);
  const [evolutions, setEvolutions] = useState<any[]>([]);

  useEffect(() => {
    if (!pokemonName) return;

    let isActive = true;

    setPokemon(null);
    setEvolutions([]);

    const loadPokemonDetail = async () => {
      try {
        const pokemonRes = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
        );
        const pokemonData = await pokemonRes.json();

        const speciesRes = await fetch(pokemonData.species.url);
        const speciesData = await speciesRes.json();

        const evolutionRes = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionRes.json();

        const chainNames: string[] = [];
        let current = evolutionData.chain;

        while (current) {
          chainNames.push(current.species.name);
          current = current.evolves_to[0];
        }

        const evolutionDetails = await Promise.all(
          chainNames.map(async (name) => {
            const res = await fetch(
              `https://pokeapi.co/api/v2/pokemon/${name}`
            );
            return res.json();
          })
        );

        if (isActive) {
          setPokemon(pokemonData);
          setEvolutions(evolutionDetails);
        }
      } catch (err) {
        console.log(err);
      }
    };

    loadPokemonDetail();

    return () => {
      isActive = false;
    };
  }, [pokemonName]);

  if (!pokemon) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  const mainType = pokemon.types[0].type.name;
  const bgColor = typeColors[mainType] || '#64748b';

  const imageUrl =
    pokemon.sprites.other['official-artwork'].front_default ||
    pokemon.sprites.front_default;

  const saveFavorite = async () => {
    try {
      const oldData = await AsyncStorage.getItem('favorites');
      const favorites = oldData ? JSON.parse(oldData) : [];

      const newPokemon = {
        id: pokemon.id,
        name: pokemon.name,
        image: imageUrl,
        type: mainType,
        height: pokemon.height,
        weight: pokemon.weight,
        baseExperience: pokemon.base_experience,
      };

      const isSaved = favorites.some(
        (item: any) => item.name === pokemon.name
      );

      if (isSaved) {
        Alert.alert('แจ้งเตือน', 'โปเกม่อนตัวนี้ถูกบันทึกแล้ว');
        return;
      }

      await AsyncStorage.setItem(
        'favorites',
        JSON.stringify([...favorites, newPokemon])
      );

      Alert.alert('สำเร็จ', 'บันทึกโปเกม่อนที่ชอบแล้ว');
    } catch (error) {
      Alert.alert('ผิดพลาด', 'ไม่สามารถบันทึกได้');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>⬅ Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.id}>#{pokemon.id}</Text>
          <Text style={styles.name}>{pokemon.name}</Text>

          <Image source={{ uri: imageUrl }} style={styles.image} />

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={saveFavorite}
          >
            <Text style={styles.favoriteText}>❤️ บันทึกเป็นตัวที่ชอบ</Text>
          </TouchableOpacity>

          <View style={styles.typeContainer}>
            {pokemon.types.map((t: any) => (
              <Text key={t.type.name} style={styles.type}>
                {t.type.name}
              </Text>
            ))}
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Height</Text>
              <Text style={styles.infoValue}>
                {(pokemon.height / 10).toFixed(1)} m
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>
                {(pokemon.weight / 10).toFixed(1)} kg
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Base EXP</Text>
              <Text style={styles.infoValue}>{pokemon.base_experience}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Abilities</Text>

            {pokemon.abilities.map((a: any) => (
              <Text key={a.ability.name} style={styles.ability}>
                • {a.ability.name}
              </Text>
            ))}
          </View>

          <View style={styles.evolutionSection}>
            <Text style={styles.evolutionTitle}>Evolutions</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.evolutionScroll}
            >
              {evolutions.map((evo, index) => {
                const evoImage =
                  evo.sprites.other['official-artwork'].front_default ||
                  evo.sprites.front_default;

                return (
                  <View key={evo.name} style={styles.evolutionItemWrap}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.evolutionItem}
                      onPress={() =>
                        router.push({
                          pathname: '/pokemon/[name]',
                          params: { name: evo.name },
                        })
                      }
                    >
                      <View style={styles.evolutionCircle}>
                        <Image
                          source={{ uri: evoImage }}
                          style={styles.evolutionImage}
                          resizeMode="contain"
                        />
                      </View>

                      <Text style={styles.evolutionName}>
                        {evo.name}{' '}
                        <Text style={styles.evolutionId}>
                          #{String(evo.id).padStart(4, '0')}
                        </Text>
                      </Text>

                      <View style={styles.evolutionTypes}>
                        {evo.types.map((t: any) => {
                          const typeName = t.type.name;

                          return (
                            <Text
                              key={typeName}
                              style={[
                                styles.evolutionType,
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

                    {index < evolutions.length - 1 && (
                      <Text style={styles.arrow}>›</Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stats</Text>

            {pokemon.stats.map((s: any) => (
              <View key={s.stat.name} style={styles.statRow}>
                <View style={styles.statHeader}>
                  <Text style={styles.statName}>{s.stat.name}</Text>
                  <Text style={styles.statValue}>{s.base_stat}</Text>
                </View>

                <View style={styles.statBarBackground}>
                  <View
                    style={[
                      styles.statBar,
                      { width: `${Math.min(s.base_stat, 100)}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const typeColors: any = {
  grass: '#22c55e',
  fire: '#ef4444',
  water: '#3b82f6',
  electric: '#eab308',
  poison: '#a855f7',
  bug: '#84cc16',
  normal: '#94a3b8',
  ground: '#b45309',
  fairy: '#ec4899',
  fighting: '#dc2626',
  psychic: '#f43f5e',
  rock: '#78716c',
  ghost: '#6366f1',
  ice: '#38bdf8',
  dragon: '#7c3aed',
  dark: '#1f2937',
  steel: '#64748b',
  flying: '#60a5fa',
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 90,
    paddingBottom: 30,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  backText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    width: '88%',
    padding: 22,
    borderRadius: 26,
    alignItems: 'center',
  },
  id: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748b',
  },
  name: {
    fontSize: 34,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  image: {
    width: 210,
    height: 210,
    marginBottom: 8,
  },
  favoriteButton: {
    backgroundColor: '#facc15',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 18,
  },
  favoriteText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  type: {
    backgroundColor: '#0f172a',
    color: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    textTransform: 'capitalize',
    fontWeight: 'bold',
  },
  infoGrid: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 4,
  },
  section: {
    width: '100%',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ability: {
    fontSize: 16,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  evolutionSection: {
    width: '100%',
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: '#555',
    borderRadius: 16,
    padding: 18,
  },
  evolutionTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  evolutionScroll: {
    alignItems: 'center',
  },
  evolutionItemWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  evolutionItem: {
    alignItems: 'center',
    width: 170,
  },
  evolutionCircle: {
    width: 135,
    height: 135,
    borderRadius: 100,
    borderWidth: 5,
    borderColor: '#fff',
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  evolutionImage: {
    width: 110,
    height: 110,
  },
  evolutionName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    marginBottom: 8,
    textAlign: 'center',
  },
  evolutionId: {
    color: '#cbd5e1',
    fontWeight: 'normal',
  },
  evolutionTypes: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  evolutionType: {
    color: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 8,
    textTransform: 'capitalize',
    fontWeight: 'bold',
    fontSize: 13,
    overflow: 'hidden',
  },
  arrow: {
    fontSize: 70,
    color: '#fff',
    marginHorizontal: 14,
    fontWeight: '300',
  },
  statRow: {
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statName: {
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  statValue: {
    fontWeight: 'bold',
  },
  statBarBackground: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 10,
  },
});