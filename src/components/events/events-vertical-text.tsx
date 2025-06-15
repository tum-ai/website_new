export default function EventsVerticalText() {
  return (
    <div className="w-full h-full flex items-center justify-center absolute">
      <h1
        className="text-[20vh] text-purple-600 -rotate-90 whitespace-nowrap"
        style={{
          transformOrigin: "center",
          letterSpacing: "0.05em",
          fontFamily: "Quartzo",
          fontSize: "20vh",
          fontWeight: "900",
        }}
      >
        EVENTS
      </h1>
    </div>
  )
}
