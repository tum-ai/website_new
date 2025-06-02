# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


## Using Biome for Linting and Formatting

[Biome](https://biomejs.dev/) is a fast, all-in-one tool for formatting and linting JavaScript/TypeScript projects.

### Installation

```bash
npm install -D --save-exact @biomejs/biome
```

### Usage

Format your code:

```bash
npm run format
```

Lint your code:

```bash
npm run lint
```

```bash
npm run lint:apply
```

### Configuration

Use `biome.json` in the project root (or use `npx biome init` to create a new one):

See the [Biome documentation](https://biomejs.dev/docs/) for more options.

---