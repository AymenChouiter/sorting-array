<div align="center">

# Real-Time Algorithm Visualizer Using SSE Technologies⚡

Visual, step-by-step sorting animations powered by **Node.js**, **Express**, and **Server‑Sent Events (SSE)**.

</div>

---

## ✨ Overview

**SortFlow** is an educational **sorting algorithm visualizer** that shows, in real time, how classic algorithms transform an array from unsorted to sorted.  
It focuses on **clarity**, **data flow**, and **visual feedback**, making it easier to understand what is happening at each step.

### Core Idea (Short)

Users enter a list of numbers, choose an algorithm (**Bubble**, **Selection**, **Insertion**, **Merge**, or **Quick Sort**), and watch each intermediate step streamed from the server and rendered in the browser.  
Every comparison and swap is reflected visually so learners can follow the algorithm’s reasoning rather than just the final result.

### Core Idea (Detailed – SSE Flow)

This project uses **<a href="https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events" target="_blank">Server‑Sent Events (SSE)</a>** to drive the visualization:

1. The frontend builds a **sorting configuration payload** (array contents and metadata).
2. It opens an `EventSource` connection to `GET /sort/:algo?data=...`, where `:algo` is the chosen algorithm.
3. On the server, an Express **controller**:
   - Parses and validates the incoming payload.
   - Instantiates a **sorting engine** (the Model) with the array state.
   - Calls the requested algorithm method (e.g. `bubble`, `quick`).
4. As the algorithm runs, it **writes SSE events** like:
   ```txt
   data: {"arr":[...],"whoChangeFir":1,"whoChangeSec":2,"color":["48bb78","e53e3e",...]}

   ```
   Each event represents a single *step* in the algorithm (e.g. comparison, swap, merge segment).
5. The browser’s `EventSource.onmessage` handler **updates the DOM incrementally**, appending a new visual snapshot of the array for each step until a final `"status": "done"` event is received.

Because SSE keeps **one long‑lived HTTP connection** open from server to client, the visualizer can push many small updates without page reloads, polling, or complex bidirectional protocols.

---

## 🧱 Architecture: MVC Pattern

SortFlow is structured using a clean **Model‑View‑Controller (MVC)** separation:

- **View (Frontend)**
  - `public/index.html` – HTML5 layout for the array input, algorithm picker, and results area.
  - `public/css/style.css` – Responsive styling, including the custom **"Tomorrow"** font, mobile‑first layout, and component styles.
  - `public/js/logic.js` – A `SortingViewController` that:
    - Manages DOM state (inputs, selected algorithm, result list).
    - Opens the SSE connection to the backend.
    - Renders each sorting step returned by the server.

- **Controller (Express Layer)**
  - `server/app.js` – Application entry point; wires static assets and mounts the `/sort` routes.
  - `server/routes/itemRoutes.js` – Defines `GET /sort/:algo` and delegates to the controller.
  - `server/controllers/itemController.js` – Validates requests, constructs the sorting engine, and streams SSE responses back to the client.

- **Model (Sorting Engines)**
  - `server/models/sortingFunctions.js` – Encapsulates the mutable array state and exposes algorithm methods:
    - `bubble(...)`
    - `selection(...)`
    - `insertion(...)`
    - `merge(...)`
    - `quick(...)`
  - Each method emits **intermediate states** instead of just producing a final sorted array, enabling rich step‑by‑step visualization.

- **Utils (Helper Functions)**
  - `server/utils/secondery.js` – Stateless helpers for:
    - Swapping elements.
    - Partitioning ranges for Quick Sort.
    - Merging sorted subarrays for Merge Sort.
    - Coloring indices for visualization.
    - Building the payloads sent as SSE messages.

This separation ensures that **rendering**, **request handling**, and **algorithmic logic** remain decoupled and testable.

---

## 📡 Technical Highlight: <a href="https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events" target="_blank">Server‑Sent Events (SSE)</a>

Unlike many demos that rely on REST (request/response only) or full **WebSockets**, SortFlow uses **SSE** as a lightweight way to push real‑time updates from the server to the browser.

- **Why SSE?**
  - ✅ **Low Overhead** – Simple HTTP connection kept open; no WebSocket handshake or extra infrastructure.
  - ✅ **Unidirectional Real‑Time Updates** – Perfect for scenarios where the server only needs to *push* updates (like streaming algorithm steps).
  - ✅ **Native Browser Support** – `EventSource` is built into modern browsers; no extra client library required.
  - ✅ **Natural Fit for Step‑By‑Step Visualization** – The server can emit one event per "step", and the client renders them sequentially.

In this project:

- The controller sets appropriate SSE headers:
  - `Content-Type: text/event-stream`
  - `Cache-Control: no-cache`
  - `Connection: keep-alive`
- The sorting engine writes each intermediate state using `res.write('data: {...}\n\n')`.
- The client listens with:

```js
const eventSource = new EventSource(`/sort/${selectedAlgorithm}?data=${encodedConfig}`);

eventSource.onmessage = (event) => {
  const step = JSON.parse(event.data);
  // update DOM with this step
};
```

This pattern creates a **smooth, continuous animation** of the sorting process with minimal complexity.

---

## 🧬 Design Patterns Used

- **<a href="https://developer.mozilla.org/en-US/docs/Glossary/MVC" target="_blank">Model‑View‑Controller (MVC)</a>**
  - Separates concerns between **data & algorithms** (Model), **HTTP & request handling** (Controller), and **UI rendering** (View).

- **<a href="https://en.wikipedia.org/wiki/Strategy_pattern" target="_blank">Strategy Pattern</a>**
  - Different sorting algorithms (Bubble, Selection, Insertion, Merge, Quick) are implemented as separate **strategies** on the same engine class.
  - The controller selects a strategy **dynamically** based on the `:algo` route parameter:
    - e.g. `/sort/bubble`, `/sort/quick`, etc.
  - This makes it easy to:
    - Add new algorithms without changing the controller.
    - Switch between algorithms at runtime with a simple parameter change.

---

## 📂 Project Structure

```bash
sorting/
├── public/                    # View layer (static frontend assets)
│   ├── index.html             # Main UI shell for the visualizer
│   ├── css/
│   │   └── style.css          # Layout, components, responsive styles
│   └── js/
│       └── logic.js           # SortingViewController and SSE client logic
│
├── server/                    # Backend (Controller + Model + Utils)
│   ├── app.js                 # Express app entry point
│   ├── routes/
│   │   └── itemRoutes.js      # /sort/:algo route definitions
│   ├── controllers/
│   │   └── itemController.js  # Handles incoming sort requests (SSE)
│   ├── models/
│   │   └── sortingFunctions.js# SortingArrayProcessor (sorting engines / Model)
│   └── utils/
│       └── secondery.js       # Low-level helpers (swap, merge, partition, etc.)
│
├── package.json               # Node.js dependencies and scripts
└── package-lock.json
```

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js** (LTS version recommended)
- **npm** (comes with Node)

### 2. Install Dependencies

From the project root:

```bash
npm install
```

### 3. Run the Server

```bash
node server/app.js
```

By default, the server runs on **http://localhost:8000**.

### 4. Open the Visualizer

Point your browser to:

```text
http://localhost:8000
```

Then:

1. Enter numbers into the array input.
2. Select a sorting algorithm from the picker.
3. Click **Sort** and watch the algorithm run step by step in real time.

---

## 🎯 Learning Outcomes

This project is ideal if you want to:

- Understand **how classic sorting algorithms work internally**.
- See the impact of each comparison, swap, partition, and merge.
- Learn how to use **SSE** with **Express** for streaming data.
- Practice structuring a Node.js project using **MVC** and the **Strategy Pattern**.

---

## 🛠️ Possible Extensions

- Add more algorithms (e.g. Heap Sort, Shell Sort, Radix Sort).
- Provide **speed controls** (slow/normal/fast playback).
- Add **code view** alongside the visualization to show which part of the algorithm is currently executing.
- Persist or share example arrays and runs.

---

## 📄 License

This project is open for learning and experimentation.  
You can adapt it to your needs; consider adding a formal license (MIT, Apache 2.0, etc.) if you plan to publish or reuse it in other projects.

