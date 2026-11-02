/**
 * The one page container (#386): the header, the footer, every home section and every route's
 * `<main>` share it, so the left edge is the same on every page and every scroll position
 * (16 px gutters at 390 px). Text-heavy blocks limit their measure inside it (`max-w-3xl`,
 * `max-w-prose`), never the container.
 */
export const CONTAINER = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
