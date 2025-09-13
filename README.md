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
