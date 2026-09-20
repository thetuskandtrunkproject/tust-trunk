export function Newsletter() {
  return (
    <section className="w-full py-20 md:py-32 bg-mint px-4 relative overflow-hidden">
      {/* Playful background accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cloud rounded-full opacity-30 -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-sunshine rounded-full opacity-40 translate-y-1/4 -translate-x-1/4"></div>
      
      <div className="container mx-auto max-w-2xl text-center relative z-10">
        <h2 className="font-heading text-4xl md:text-6xl text-ink font-bold mb-4">Join the club</h2>
        <p className="text-ink/80 text-lg md:text-xl mb-8 max-w-md mx-auto font-medium">
          Sign up to receive 10% off your first order, plus exclusive access to new drops and sales.
        </p>
        <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={e => e.preventDefault()}>
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="flex-1 bg-white border-2 border-transparent rounded-full px-6 py-4 focus:outline-none focus:border-coral text-ink placeholder:text-ink/40 shadow-sm"
            required
          />
          <button type="submit" className="bg-coral text-white font-bold px-8 py-4 rounded-full hover:bg-opacity-90 hover:scale-105 transition-all shadow-md">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  )
}
