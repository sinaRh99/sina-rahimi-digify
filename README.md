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

```

---

## Why This Approach

It’s better to first explain the alternative approaches I considered and why I decided against them. These trade-offs eventually led me to the current solution.

### 1. Server-side Agent Detection

One option was to check the user agent on the server and decide whether to render the desktop or mobile view of the application.

- **Problem:** The application would not be **responsive**. It would only handle the initial render correctly, but it wouldn’t adapt if the user resized the window or switched devices.

---

### 2. Dedicated Client-side Infinite Scroll (Starting at Page 1)

Another approach was to create a dedicated client-side component that renders everything in the mobile view starting from page 1 and only responds to scrolling down. This is a common way infinite scrolling is usually implemented.

- **Problem:** While simpler to build, this approach is **not SEO-friendly**. Since all HTML would be rendered on the client, search engines would not have meaningful server-rendered content to index, reducing discoverability and performance in search results.

---

### 3. Prepending All Pages Up to Current Page

In the `InfiniteScrollerWrapper` component, I could have rendered HTML for all pages from the first page up to the current one and prepended it before the server-rendered HTML. Then, I would only add a bottom loader to handle scrolling down.

- **Problem:** This becomes highly inefficient when the user lands on a relatively high page (e.g., page 20), since it would require rendering the content of 19 previous pages immediately.
- The only way to optimize this would be to implement **virtual scrolling** (rendering only the slice of data currently visible and removing everything off-screen). But this again requires a **dedicated client-side rendering solution**, leading back to the same SEO problem as in approach #2.

---

### Why the Current Approach Works Best

By combining **SSR for the initial render** with a **client-side InfiniteScroller wrapper**, the chosen solution achieves a balance of:

- **Responsiveness**: The app adapts dynamically to screen width changes instead of locking to the first request’s view.
- **SEO friendliness**: Initial HTML is rendered on the server and is crawlable by search engines.
- **Optimized performance**: The client only loads additional slices of data when needed, without preloading all pages or maintaining a heavy virtualized list.

---
