import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PokemonDetail() {
  const router = useRouter();
  const { name } = useLocalSearchParams();
  const [pokemon, setPokemon] = useState<any>(null);
  const [evolutions, setEvolutions] = useState<string[]>([]);

  useEffect(() => {
    if (!name) return;

    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
      .then((res) => res.json())
      .then((data) => setPokemon(data))
      .catch((err) => console.log(err));
  }, [name]);

  useEffect(() => {
    if (!name) return;

    fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`)
      .then((res) => res.json())
      .then((speciesData) => fetch(speciesData.evolution_chain.url))
      .then((res) => res.json())
      .then((evolutionData) => {
        const chain: string[] = [];
        let current = evolutionData.chain;

        while (current) {
          chain.push(current.species.name);
          current = current.evolves_to[0];
        }

        setEvolutions(chain);
      })
      .catch((err) => console.log(err));
  }, [name]);

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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Evolution</Text>

            <View style={styles.evolutionContainer}>
              {evolutions.map((evo, index) => (
                <Text key={evo} style={styles.evolutionText}>
                  {evo}
                  {index < evolutions.length - 1 ? '  →  ' : ''}
                </Text>
              ))}
            </View>
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
  evolutionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  evolutionText: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'capitalize',
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