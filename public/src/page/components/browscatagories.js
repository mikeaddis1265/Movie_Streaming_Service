// src/components/BrowseCategories.js
const BrowseCategories = ({ genres }) => {
    return (
        <div className="browse-categories">
            {genres.map(genre => (
                <button key={genre.id} className="button">{genre.name}</button>
            ))}
        </div>
    );
};

export default BrowseCategories;