export default function MusicBrowser() {
    const albums = [
        { id: 1, title: "Midnight Melodies", artist: "The Synth Waves" },
        { id: 2, title: "Acoustic Sessions", artist: "Luna & The Stars" },
        { id: 3, title: "Neon Nights Vol. 1", artist: "Cyberpunk Collective" },
        { id: 4, title: "Lo-Fi Beats to Study To", artist: "Chillhop Master" },
        { id: 5, title: "Symphony No. 9", artist: "Classic Orchestra" },
        { id: 6, title: "Summer Anthems", artist: "Various Artists" },
    ];

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-8 font-sans box-border">
            
            <div className="mb-8">
                <h1 className="text-3xl font-bold m-0">Recently Added</h1>
            </div>

            {/* CSS Grid implemented via Tailwind arbitrary values for the auto-fill behavior */}
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6 list-none p-0 m-0">
                
                {albums.map((album) => (
                    <li key={album.id}>
                        {/* The interactive card wrapper */}
                        <div className="bg-neutral-800 p-4 rounded-lg cursor-pointer transition-all duration-300 hover:bg-neutral-700 hover:-translate-y-1 block">
                            
                            {/* Visual block using img placeholder */}
                            <img 
                                src={`https://placehold.co/400x400/262626/FFFFFF/png?text=${album.title.charAt(0)}`}
                                alt={`Album cover for ${album.title}`} 
                                className="w-full aspect-square rounded mb-4 object-cover shadow-lg block"
                            />
                            
                            {/* Text container */}
                            <div>
                                <h2 className="text-base font-semibold mb-1 truncate m-0">
                                    {album.title}
                                </h2>
                                <p className="text-sm text-neutral-400 truncate m-0">
                                    {album.artist}
                                </p>
                            </div>

                        </div>
                    </li>
                ))}

            </ul>

        </div>
    );
}