# VedaAI - Assessment Extraction & Answer Mapping

AI-powered tool for teachers to extract questions from exam papers, transcribe student answers, and automatically map answers to questions with confidence scoring.

## Features

- **Question Extraction** - Extracts all questions from uploaded question papers using Gemini AI
- **Answer Transcription** - Reads and transcribes handwritten student answers from answer sheets
- **Auto-Mapping** - Automatically matches answers to their corresponding questions
- **Bounding Box Highlights** - Highlights matched answers on the answer sheet with color-coded confidence
- **Confidence Scoring** - Shows match quality (0-100%) for each question-answer pair
- **PDF & Image Support** - Accepts PDF, PNG, JPG, and other common document formats
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| AI Model | Google Gemini 3.5 Flash Lite |
| PDF Processing | pdf.js |

## Getting Started

### Prerequisites

- Node.js 18+
- Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd veda-ai

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Configuration

Add your Gemini API key to `.env.local`:

```
GEMINI_API_KEY=your_api_key_here
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production

```bash
npm run build
npm start
```

## Usage

1. **Upload Files** - Drag and drop or click to upload a question paper and student answer sheet
2. **Start Processing** - Click "Start Mapping" to begin AI extraction
3. **Review Results** - Click any question to see its matched answer highlighted on the answer sheet

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── process/     # AI processing endpoint
│   │   ├── session/     # Session management
│   │   └── upload/      # File upload handler
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Main page
│   └── globals.css      # Global styles
├── components/
│   ├── app-layout.tsx   # Main layout wrapper
│   ├── header.tsx       # Navigation header
│   ├── sidebar.tsx      # Desktop sidebar
│   ├── mobile-drawer.tsx# Mobile navigation
│   ├── upload-screen.tsx    # File upload UI
│   ├── processing-screen.tsx# Processing animation
│   └── review-screen.tsx    # Results review
├── lib/
│   ├── session-store.ts # In-memory session storage
│   └── utils.ts         # Utility functions
└── types/
    └── index.ts         # TypeScript interfaces
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload question paper and answer sheet |
| POST | `/api/process` | Process uploaded files with AI |
| GET | `/api/session/[id]` | Retrieve session data |
| DELETE | `/api/session/[id]` | Delete session |

## License

MIT
