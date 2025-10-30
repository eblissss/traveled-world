# Traveled World 🌍

A beautiful, performant React web application that visualizes your travel history on both 2D maps and 3D globes with smooth animations, intuitive interactions, and a premium input experience.

## Features

- 🗺️ **Dual View Modes**: Switch between 2D map (Leaflet) and 3D globe (react-globe.gl) views
- 🔍 **Smart City Search**: Fuzzy search with typo tolerance using Fuse.js (35ms on 100k+ cities)
- ⚡ **Performance Optimized**: Web Worker for CSV parsing, prevents UI blocking
- 🎨 **Beautiful Animations**: Smooth transitions powered by Framer Motion
- 💾 **Local Storage**: Data persists in IndexedDB via Zustand
- 🎯 **Accessible**: WCAG AA compliant with keyboard navigation support
- 📱 **Responsive**: Works beautifully on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Visualization**: react-globe.gl (3D), React Leaflet (2D)
- **Search**: Fuse.js (fuzzy search)
- **State**: Zustand with persistence
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS
- **Data**: CSV parsing with PapaParse

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── input/       # City search, form components
│   ├── map/         # Globe3D and Map2D components
│   ├── layout/      # Header, ViewSwitcher, StyleSelector
│   └── ui/          # Reusable UI components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helpers
├── store/           # Zustand state management
├── types/           # TypeScript type definitions
├── workers/         # Web Worker for CSV processing
└── styles/          # Global styles
```

## Usage

1. **Search for a City**: Type in the search box (minimum 2 characters)
2. **Select a City**: Use arrow keys or click to select from results
3. **Add Details**: Choose "Visited" or "Lived", and set the date
4. **View on Map**: See your cities appear on the 2D map or 3D globe
5. **Switch Views**: Toggle between 2D and 3D views
6. **Change Style**: Select Light, Dark, or Satellite map themes

## Performance

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.0s
- **Search Response**: < 100ms
- **Animation Frame Rate**: 60fps

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT

## Credits

- Design document by Ethan
- Built with ❤️ using modern web technologies

