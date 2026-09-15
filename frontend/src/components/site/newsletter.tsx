export function Newsletter() {
  return (
    <section className="w-full py-20 md:py-32 bg-sky-soft px-4">
      <div className="container mx-auto max-w-2xl text-center">
        <h2 className="font-fraunces text-4xl md:text-5xl text-ink mb-4">Join the club</h2>
        <p className="text-ink/80 text-lg mb-8 max-w-md mx-auto">
          Sign up to receive 10% off your first order, plus exclusive access to new drops and sales.
        </p>
        <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={e => e.preventDefault()}>
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="flex-1 bg-cloud border border-ink/10 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-ink/20 text-ink placeholder:text-ink/40"
            required
          />
          <button type="submit" className="bg-ink text-cloud font-medium px-8 py-4 rounded-full hover:bg-ink/90 transition-colors">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  )
}
