import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Pokemon = {
  name: string;
  url: string;
};

export default function Home() {
  const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const limit = 20;

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=2000')
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.results.sort((a: Pokemon, b: Pokemon) =>
          a.name.localeCompare(b.name)
        );

        setAllPokemons(sorted);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    setPage(0);
  }, [search]);

  const filteredPokemons = allPokemons.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPokemons.length / limit);

  const currentPokemons = filteredPokemons.slice(
    page * limit,
    page * limit + limit
  );

  const getPokemonId = (url: string) => {
    const parts = url.split('/').filter(Boolean);
    return parts[parts.length - 1];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoText}>PokéApp</Text>
        <Text style={styles.subtitle}>Pokemon List 🔥</Text>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search all Pokemon..."
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={currentPokemons}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => {
          const id = getPokemonId(item.url);

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: '/pokemon/[name]',
                  params: { name: item.name },
                })
              }
            >
              <Image
                source={{
                  uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
                }}
                style={styles.image}
              />

              <Text style={styles.name}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.pagination}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setPage((prev) => Math.max(prev - 1, 0))}
        >
          <Text style={styles.buttonText}>⬅ Prev</Text>
        </TouchableOpacity>

        <Text style={styles.pageText}>
          Page {page + 1} / {totalPages || 1}
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            setPage((prev) => Math.min(prev + 1, totalPages - 1))
          }
        >
          <Text style={styles.buttonText}>Next ➡</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 44,
    fontWeight: '900',
    color: '#facc15',
    letterSpacing: 2,
    textShadowColor: '#1e3a8a',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 4,
  },
  search: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#ffffff',
    marginBottom: 10,
    borderRadius: 14,
    elevation: 3,
  },
  image: {
    width: 55,
    height: 55,
    marginRight: 15,
  },
  name: {
    fontSize: 20,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pageText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});