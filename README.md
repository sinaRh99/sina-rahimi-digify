# Countries Explorer

A web application that displays a list of countries and provides search, filter, pagination, and infinite scroll functionality.

💻 **Live Demo:** [https://sina-rahimi-digify.vercel.app](https://sina-rahimi-digify.vercel.app)

```bash
# Development
npm run dev

# Production
npm run build
npm run start
```

---

## Project Organization

This project follows the principles of **Feature-Sliced Design (FSD)** ([documentation](https://feature-sliced.design/docs/get-started/overview)).

I like this architectural approach because it encourages splitting the application into meaningful layers such as entities, features, and widgets. This separation not only keeps the codebase maintainable but also makes coding more enjoyable.

Throughout this project, I tried to demonstrate how I think ahead when structuring components, For Example:

- **Pagination**: Although currently only used on the home page, I placed it inside a shared `ui` block named `Pagination`. This way, the component stays independent of where it’s used and how its state changes are handled, making it reusable in the future.
- **Fetcher helper**: I built a small utility function that abstracts API requests and consistently returns `data`, an `errorMessage`, and an error state. This helps reduce repetition and keeps components focused on rendering logic instead of handling fetch details.

---

## Project Structure

This project uses a **client-side InfiniteScroller wrapper** around the SSR-rendered countries list page. Some key data such as `perPage`, `currentPage`, `lastPage`, and `filteredCountries` are provided as `initialData` to a **Zustand store provider** that wraps the page. These values are then consumed by components that need them. From that point on, components update the store whenever necessary and also update the `searchParams` to ensure data consistency across refreshes.

On **desktop**, the server fetches the countries list from the API and renders a list of `CountryCard` components on the server. The generated HTML is sent to the browser for painting and hydration. Subsequent navigation using the traditional pagination at the bottom of the page updates the browser router on the client side. The server then responds with JSON containing the new slice of countries based on `URLSearchParams` (such as `page`, `perPage`, and `search`). The browser then handles rendering the updated `CountryCard` components using this JSON.

On **mobile**, the `InfiniteScrollWrapper` determines whether the user needs to scroll to the top or bottom based on the `currentPage`. With the help of JavaScript’s `IntersectionObserver`, the app dynamically renders additional countries as the user scrolls. For example, when a user first loads page 3 on mobile, the countries of page 3 are rendered on the server. Scrolling upward prepends the data of page 2 before the server-side generated HTML, while scrolling downward appends the data of page 4 after it. The user can continue scrolling upward until the first page is loaded, or downward until the last page is reached. The number of items rendered at each step depends on the same `perPage` value from the URL, which is also stored in the Zustand store.

The app is fully **responsive** and adapts seamlessly to screen width changes, ensuring both SSR and client-side infinite scrolling behave consistently across devices.

---

### Data Flow Overview

```text
                ┌─────────────────────────────────────────────┐
                │                 Desktop Flow                 │
                └─────────────────────────────────────────────┘
   ┌───────────────┐       ┌───────────────┐        ┌──────────────┐
   │   Browser     │──────▶│     Server     │──────▶│   HTML + CSS  │
   │  (Request)    │       │  (Fetch API)   │        │   + JSON      │
   └───────────────┘       └───────────────┘        └──────────────┘
            │                                         │
            │<───── Hydration & Pagination Updates ───┘
            │
            ▼
   ┌────────────────────────────────────────────────────────────┐
   │ Browser updates UI using JSON slices (page, perPage, query) │
   └────────────────────────────────────────────────────────────┘


                ┌─────────────────────────────────────────────┐
                │                  Mobile Flow                 │
                └─────────────────────────────────────────────┘
   ┌───────────────┐
   │ SSR Render    │  → Initial page (e.g., Page 3) rendered on server
   └───────────────┘
            │
            ▼
   ┌─────────────────────┐
   │ InfiniteScrollWrapper│
   └─────────────────────┘
      │            │
      ▼            ▼
  Scroll Up     Scroll Down
 (load prev)   (load next)
      │            │
      ▼            ▼
 ┌───────────────┐ ┌───────────────┐
 │ Page N-1 Data │ │ Page N+1 Data │
 └───────────────┘ └───────────────┘

User can continue scrolling until:
- First page is reached (top)
- Last page is reached (bottom)

---

### Initial Load

- The project fetches data from the API on the server initially.
- A **helper function** called `fetcher` is created for reusable API requests.
- API responses are **cached** so that subsequent requests return the cached data directly.
- The initial HTML is rendered on the server using the fetched data.
- The store is initialized with the required initial values during the first load, and the first page is built.

### Desktop View

- The **Pagination** component manages URL parameters for search.
- After the first load, only JSON data is fetched from the server, and the browser renders the HTML for the subsequent pages.

### Mobile View

- Several approaches were considered:

  1. **Detect mobile/desktop on the server and load the corresponding page:**

  - While this could allow different layouts for mobile and desktop, it would make the app **non-responsive**.
  - Users resizing their browser or switching devices would not see a seamless experience, breaking the dynamic responsiveness of the app.

2. **Implement full Infinite Scroll entirely on the client-side:**

   - Infinite Scroll naturally requires client-side handling because it responds to user scroll events.
   - However, the task required that the **first page and initial load be server-rendered (SSR)**.
   - If I fully moved Infinite Scroll to the client, the first load would no longer have SSR benefits like SEO and faster initial rendering.

3. **Render all pages up to the current page and then use Infinite Scroll:**
   - This approach could work for desktop, where the user might navigate directly to page 5 and scroll seamlessly.
   - On mobile, if the user opens a high page number (e.g., page 30), the browser would need to render an enormous amount of DOM nodes at once, causing **performance issues** and possibly crashing the page.

- As a result, Infinite Scroll is implemented as a **client-side component** wrapping the initial server-side data.
- Two **loaders** are used at the top and bottom of the content to handle scrolling both upwards and downwards, loading more data as needed.
- Two **anchors** track how much data has been loaded before and after the server-rendered page.
- Images are loaded with **lazy loading** for performance.

---
```
