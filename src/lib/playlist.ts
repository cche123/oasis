export type PlaylistTrack = {
  id: string;
  title: string;
  artist: string;
  audioSrc?: string;
  /** Full-track YouTube video ID (plays from 0:00) */
  youtubeId?: string;
  itunesTerm: string;
  gradient: string;
  spotifyQuery: string;
};

export const OASIS_PLAYLIST: PlaylistTrack[] = [
  {
    id: "innerbloom",
    title: "Innerbloom",
    artist: "RÜFÜS DU SOL",
    audioSrc: "/audio/innerbloom.mp3",
    youtubeId: "Tx9zMFodNtA",
    itunesTerm: "Rufus Du Sol Innerbloom",
    gradient: "linear-gradient(135deg, #1a1a2e 0%, #4a3f6b 50%, #e94560 100%)",
    spotifyQuery: "Rüfus Du Sol Innerbloom",
  },
  {
    id: "ode-to-rashaan",
    title: "Ode to Rashaan",
    artist: "Berlioz",
    audioSrc: "/audio/ode-to-rashaan.mp3",
    youtubeId: "fT3xznNNoJQ",
    itunesTerm: "Berlioz Ode to Rashaan",
    gradient: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
    spotifyQuery: "Berlioz Ode to Rashaan",
  },
  {
    id: "valerie",
    title: "Valerie",
    artist: "Mark Ronson ft. Amy Winehouse",
    audioSrc: "/audio/valerie.mp3",
    youtubeId: "dxiBH0CjOfA",
    itunesTerm: "Mark Ronson Valerie Amy Winehouse",
    gradient: "linear-gradient(135deg, #2c1810 0%, #8b4513 50%, #d4a574 100%)",
    spotifyQuery: "Mark Ronson Valerie Amy Winehouse",
  },
  {
    id: "midnight-in-harlem",
    title: "Midnight in Harlem",
    artist: "Tedeschi Trucks Band",
    audioSrc: "/audio/midnight-in-harlem.mp3",
    youtubeId: "6GkdCiqsFUI",
    itunesTerm: "Tedeschi Trucks Band Midnight in Harlem",
    gradient: "linear-gradient(135deg, #1a1208 0%, #3d2914 50%, #c9a227 100%)",
    spotifyQuery: "Tedeschi Trucks Band Midnight in Harlem",
  },
  {
    id: "my-eyes",
    title: "My Eyes",
    artist: "Travis Scott",
    audioSrc: "/audio/my-eyes.mp3",
    youtubeId: "pildU9lK6vM",
    itunesTerm: "Travis Scott My Eyes",
    gradient: "linear-gradient(135deg, #0d0d0d 0%, #333 50%, #888 100%)",
    spotifyQuery: "Travis Scott My Eyes",
  },
  {
    id: "passionfruit",
    title: "Passionfruit",
    artist: "Drake",
    audioSrc: "/audio/passionfruit.mp3",
    youtubeId: "EgfsXTOn_pI",
    itunesTerm: "Drake Passionfruit",
    gradient: "linear-gradient(135deg, #4a1942 0%, #7b2d8e 50%, #c77dff 100%)",
    spotifyQuery: "Drake Passionfruit",
  },
  {
    id: "drama",
    title: "Drama",
    artist: "Roy Woods & Drake",
    audioSrc: "/audio/drama.mp3",
    youtubeId: "XP0fdtXn49s",
    itunesTerm: "Roy Woods Drake Drama",
    gradient: "linear-gradient(135deg, #1c1c1c 0%, #434343 50%, #9e9e9e 100%)",
    spotifyQuery: "Roy Woods Drake Drama",
  },
];
