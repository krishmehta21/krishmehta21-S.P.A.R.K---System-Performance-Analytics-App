
# 🖥️ S.P.A.R.K - System Dashboard

S.P.A.R.K is a sleek, responsive system monitoring dashboard built with **React**, **Chakra UI**, **Framer Motion**, and **Recharts** on the frontend, powered by a **Django** backend API. It provides real-time system metrics including CPU, RAM, Disk, Network, Battery, and System Info with smooth animations and live updating charts.

---

## Features

- Real-time fetching of system metrics from Django REST API every 3 seconds
- Animated, smooth transitions for numeric values and progress bars using Framer Motion springs
- Interactive and responsive charts for CPU, RAM, Disk, and Network usage via Recharts
- Clean and modern UI built with Chakra UI components
- Responsive grid layout that adapts to mobile and desktop
- Battery status monitoring with progress bar and alerts for low battery
- System information display including hostname, OS, uptime, user, etc.
- Error handling and retry button if backend API is unreachable
- Lightweight, easy-to-extend React frontend
- Modular components for stats, cards, and animated displays
- Electron-compatible (can be packaged into a desktop app)

---

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- Yarn or npm
- Python 3.8+
- Django with Django REST Framework backend exposing `/api/metrics/` endpoint returning system metrics JSON

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/spark-system-dashboard.git
cd spark-system-dashboard
````

2. Install frontend dependencies:

```bash
cd frontend
npm install
# or
yarn install
```

3. Start the React development server:

```bash
npm start
# or
yarn start
```

4. Make sure your Django backend API is running locally at:

```
http://127.0.0.1:8000/api/metrics/
```

This API should return system metrics in the JSON format expected by the frontend.

---

## Usage

* The dashboard automatically fetches data every 3 seconds and updates UI smoothly.
* View CPU, RAM, Disk, Network, Battery stats in individual cards.
* Hover over charts to see tooltips with exact values.
* Click "Retry" if the backend API fails to respond.
* Supports dark/light theming (can be added as a future feature).

---

## Project Structure

```
/frontend
  /src
    App.tsx           # Main dashboard React component
    components/
      Card.tsx        # Reusable card container component
      StatDisplay.tsx # Animated stats display
      SmoothProgress.tsx  # Progress bar with smooth animation
    hooks/            # Custom hooks (optional)
    utils/            # Helper utilities
/backend
  manage.py
  api/
    views.py          # Metrics API views
    serializers.py    # System metrics serializers
  ...
```

---

## Dependencies

* [React](https://reactjs.org/)
* [Chakra UI](https://chakra-ui.com/)
* [Framer Motion](https://www.framer.com/motion/)
* [Recharts](https://recharts.org/en-US/)
* [Django REST Framework](https://www.django-rest-framework.org/) (backend)

---

## Future Improvements & TODO

* Add dark mode toggle
* Add configurable update interval  
* Support for historical data persistence and longer graph timelines  
* Export data as CSV or JSON  
* Notifications for threshold breaches (CPU > 90%, battery < 10%, etc.)  
* Support for multiple systems/hosts  
* Packaging as Electron desktop app with system tray integration  
* Add unit and integration tests for components and API  
* Improve mobile responsiveness and UX  

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contact

Created by **KRISH MEHTA** — feel free to reach out via [21mehtak@gmail.com](mailto:21mehtak@gmail.com) or [GitHub](https://github.com/krishmehta21).

