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

## Project Structure

The project is organized using **Feature Sliced Design (FSD)** ([documentation](https://feature-sliced.design/docs/get-started/overview)).  
I personally like the philosophy of this architecture: splitting the application into entities, features, and smaller widgets makes coding more enjoyable.  
I also tried to write components and UI blocks that might be **reusable** in the future whenever possible.

---

## Project Functionality

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

  1. Detect mobile or desktop on the server and load the corresponding page: This would make the app **less responsive** to browser resizing.
  2. Implement full client-side Infinite Scroll: Not feasible because the task required the first page to be **SSR**.
  3. Render all data up to the current page and then continue with Infinite Scroll: If a user opened page 30 on mobile, the browser would be overloaded, affecting performance.

- As a result, Infinite Scroll is implemented as a **client-side component** wrapping the initial server-side data.
- Two **loaders** are used at the top and bottom of the content to handle scrolling both upwards and downwards, loading more data as needed.
- Two **anchors** track how much data has been loaded before and after the server-rendered page.
- Images are loaded with **lazy loading** for performance.

---
