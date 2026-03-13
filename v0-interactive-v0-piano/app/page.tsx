import Piano from "../components/Piano"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-8">
      <h1 className="text-3xl font-bold mb-8">Interactive Piano</h1>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl">
        <Piano />
      </div>
    </div>
  )
}

