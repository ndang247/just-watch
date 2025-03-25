import { Text, View, Image, FlatList, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { images } from "@/constants/images";
import useFetch from "@/services/useFetch";
import { fetchMovies } from "@/services/api";
import SearchBar from "@/components/SearchBar";
import MovieDisplayCard from "@/components/MovieCard";
import { icons } from "@/constants/icons";
import { useDebouncedCallback } from "use-debounce";
import { updateSearchCount } from "@/services/appwrite";

const LoadingState = () => (
  <ActivityIndicator
    size="large"
    color="#0000ff"
    className="my-3"
  />
);

const ErrorState = ({ message }: { message: string }) => (
  <Text className="text-red-500 px-5 my-3">
    Error: {message}
  </Text>
);

const MoviesGrid = ({ movies }: { movies: Movie[] }) => (
  <FlatList
    className="px-5"
    data={movies}
    keyExtractor={(item) => item.id.toString()}
    renderItem={({ item }) => <MovieDisplayCard {...item} />}
    numColumns={3}
    columnWrapperStyle={{
      justifyContent: "flex-start",
      gap: 16,
      marginVertical: 16,
    }}
    contentContainerStyle={{ paddingBottom: 100 }}
  />
);

interface SearchHeaderProps {
  searchQuery: string;
  loading: boolean;
  error: Error | null;
  movies: Movie[] | null;
  onSearch: (text: string) => void;
}

const SearchHeader = ({ searchQuery, loading, error, movies, onSearch }: SearchHeaderProps) => (
  <>
    <View className="w-full flex-row justify-center mt-20 items-center">
      <Image source={icons.logo} className="w-12 h-10" />
    </View>

    <View className="my-5">
      <SearchBar
        placeholder="Search for a movie"
        value={searchQuery}
        onChangeText={onSearch}
      />
    </View>

    {loading && <LoadingState />}
    {error && <ErrorState message={error.message} />}

    {!loading &&
      !error &&
      Boolean(searchQuery.trim()) &&
      Array.isArray(movies) &&
      movies.length > 0 && (
        <Text className="text-xl text-white font-bold">
          Search Results for{" "}
          <Text className="text-accent">{searchQuery}</Text>
        </Text>
      )}
  </>
);

interface EmptyStateProps {
  searchQuery: string;
  loading: boolean;
  error: Error | null;
}

const EmptyState = ({ searchQuery, loading, error }: EmptyStateProps) => {
  if (loading || error) return null;
  
  return (
    <View className="mt-10 px-5">
      <Text className="text-center text-gray-500">
        {searchQuery.trim()
          ? "No movies found"
          : "Start typing to search for movies"}
      </Text>
    </View>
  );
};

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: movies = [],
    loading,
    error,
    refetch: loadMovies,
    reset,
  } = useFetch(() => fetchMovies({ query: searchQuery }), false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (
        searchQuery.trim() &&
        Array.isArray(movies) &&
        movies.length > 0 &&
        movies[0]
      ) {
        updateSearchCount(searchQuery, movies[0]);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [movies, searchQuery]);

  const debouncedSearch = useDebouncedCallback(async () => {
    if (searchQuery.trim()) {
      await loadMovies();
    } else {
      reset();
    }
  }, 500);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    debouncedSearch();
  };

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full h-full z-0"
        resizeMode="cover"
      />

      <SearchHeader
        searchQuery={searchQuery}
        loading={loading}
        error={error}
        movies={movies}
        onSearch={handleSearch}
      />

      {Array.isArray(movies) ? (
        <MoviesGrid movies={movies} />
      ) : (
        <EmptyState
          searchQuery={searchQuery}
          loading={loading}
          error={error}
        />
      )}
    </View>
  );
};

export default Search;
