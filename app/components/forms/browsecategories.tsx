interface Genre {
  id: string;
  name: string;
}

interface BrowseCategoriesProps {
  genres: Genre[];
}

const BrowseCategories = ({ genres }: BrowseCategoriesProps) => {
  return (
    <div className="browse-categories">
      {genres.map((genre) => (
        <button key={genre.id} className="button">
          {genre.name}
        </button>
      ))}
    </div>
  );
};

export default BrowseCategories;
