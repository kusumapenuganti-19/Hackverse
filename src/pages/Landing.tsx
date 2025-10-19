import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { Sparkles, TrendingDown, Clock, Zap, ArrowRight, Menu, CheckCircle2, Target, Users, Shield } from "lucide-react";
import { useState } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation Bar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b"
      >
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary rounded-lg">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Raayan</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm hover:text-primary transition-colors">How It Works</a>
              <a href="#comparison" className="text-sm hover:text-primary transition-colors">Why Raayan?</a>
              <a href="#future" className="text-sm hover:text-primary transition-colors">Future</a>
              <Button size="sm" onClick={() => navigate("/dashboard")}>
                Get Started
              </Button>
            </div>

            <button
              className="md:hidden p-2 hover:bg-muted rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden mt-3 pb-3 space-y-2"
            >
              <a href="#features" className="block py-2 text-sm hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="block py-2 text-sm hover:text-primary" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
              <a href="#comparison" className="block py-2 text-sm hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Why Raayan?</a>
              <a href="#future" className="block py-2 text-sm hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Future</a>
              <Button size="sm" className="w-full" onClick={() => navigate("/dashboard")}>
                Get Started
              </Button>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-20">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="max-w-5xl mx-auto text-center space-y-6"
        >
          {/* Logo with Image */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
              <div className="relative p-5 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-xl transition-transform duration-700 group-hover:rotate-180">
                <Sparkles className="h-14 w-14 text-primary-foreground" />
              </div>
            </div>
          </motion.div>

          {/* Headline */}
          <div className="space-y-3">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold tracking-tight"
            >
              Meet Raayan
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto"
            >
              Your AI-powered decision optimizer for food delivery and travel booking
            </motion.p>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto"
            >
              Stop wasting time comparing prices across multiple apps. Let Raayan's AI analyze all options instantly and recommend the best deal with complete transparency.
            </motion.p>
          </div>

          {/* Value Props with Images */}
          <motion.div
            id="features"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-8"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-5 bg-card border rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-center mb-3">
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <TrendingDown className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="font-bold text-base mb-2">Save Money</h3>
              <p className="text-sm text-muted-foreground">
                Compare prices across platforms instantly and save ₹200+ per order
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-5 bg-card border rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-center mb-3">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="font-bold text-base mb-2">Save Time</h3>
              <p className="text-sm text-muted-foreground">
                Get the fastest delivery and travel options in under 3 seconds
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-5 bg-card border rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-center mb-3">
                <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h3 className="font-bold text-base mb-2">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">
                Smart recommendations with transparent reasoning you can trust
              </p>
            </motion.div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-6 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="text-lg px-10 py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all group"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/dashboard?tab=bookings")}
              className="text-lg px-10 py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all group"
            >
              <TrendingDown className="mr-2 h-5 w-5" />
              Spend Analyzer
            </Button>
            <Button
              size="lg"
              onClick={() => navigate("/guardian")}
              className="text-lg px-10 py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
            >
              <Shield className="mr-2 h-5 w-5" />
              Guardian
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-muted/30 py-16 md:py-20 px-6 border-t border-b">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12"
          >
            How Raayan Works
          </motion.h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="text-center space-y-3 p-6 rounded-xl border border-border/50 bg-card/50 hover:shadow-lg transition-all"
            >
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Target className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="font-bold">1. Enter Details</h3>
              <p className="text-sm text-muted-foreground">
                Tell Raayan what you need - food delivery, bus travel, or safety analysis
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="text-center space-y-3 p-6 rounded-xl border border-border/50 bg-card/50 hover:shadow-lg transition-all"
            >
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                </div>
              </div>
              <h3 className="font-bold">2. Raayan Analyzes</h3>
              <p className="text-sm text-muted-foreground">
                Raayan's AI searches across 4+ platforms and analyzes safety factors in real-time
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              className="text-center space-y-3 p-6 rounded-xl border border-border/50 bg-card/50 hover:shadow-lg transition-all"
            >
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="font-bold">3. Raayan Recommends</h3>
              <p className="text-sm text-muted-foreground">
                See Raayan's pick with transparent reasoning and safety scores
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              className="text-center space-y-3 p-6 rounded-xl border border-border/50 bg-card/50 hover:shadow-lg transition-all"
            >
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <TrendingDown className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="font-bold">4. Save & Stay Safe</h3>
              <p className="text-sm text-muted-foreground">
                Book with confidence, track savings, and travel safely with Raayan
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Before vs After Section */}
      <section id="comparison" className="bg-muted/50 py-16 md:py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12"
          >
            Why Raayan?
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Before */}
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-6 bg-background border rounded-xl shadow-sm"
            >
              <h3 className="text-xl font-bold text-muted-foreground mb-4">Before Raayan</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">❌</span>
                  <span>Open 4+ apps to compare prices</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">❌</span>
                  <span>Manually calculate delivery fees and discounts</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">❌</span>
                  <span>Waste 15-20 minutes per search</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">❌</span>
                  <span>Miss hidden charges and better deals</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">❌</span>
                  <span>No clear recommendation</span>
                </p>
              </div>
            </motion.div>

            {/* After */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-6 bg-primary/5 border-2 border-primary rounded-xl shadow-sm"
            >
              <h3 className="text-xl font-bold mb-4">After Raayan</h3>
              <div className="space-y-3 text-sm">
                <p className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✅</span>
                  <span>One search across all platforms</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✅</span>
                  <span>AI calculates everything instantly</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✅</span>
                  <span>Get results in under 3 seconds</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✅</span>
                  <span>See total cost with all fees included</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✅</span>
                  <span>Smart pick with clear reasoning</span>
                </p>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-8 bg-background rounded-2xl border-2 shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <p className="text-4xl md:text-5xl font-bold text-primary">₹200+</p>
                <p className="text-sm text-muted-foreground mt-2">Average savings per order</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <p className="text-4xl md:text-5xl font-bold text-primary">20 min</p>
                <p className="text-sm text-muted-foreground mt-2">Time saved per search</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <p className="text-4xl md:text-5xl font-bold text-primary">4+</p>
                <p className="text-sm text-muted-foreground mt-2">Platforms compared</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Future Vision Section */}
      <section id="future" className="bg-background py-16 md:py-20 px-6 border-t">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-4"
          >
            The Future of Raayan
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto"
          >
            We're building a comprehensive AI companion for all your daily decisions
          </motion.p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-card border rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2 text-center">Raayan Health</h3>
              <p className="text-sm text-muted-foreground text-center mb-3">
                Compare medicine prices, lab tests, and doctor consultations
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Find cheapest pharmacies nearby</li>
                <li>• Compare diagnostic centers</li>
                <li>• Generic alternatives suggestions</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-card border rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2 text-center">Raayan Companion</h3>
              <p className="text-sm text-muted-foreground text-center mb-3">
                AI-powered study assistant for faster learning
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Auto-generate flashcards & quizzes</li>
                <li>• Smart content summaries</li>
                <li>• Personalized study paths</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-purple-200 dark:border-purple-800 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2 text-center">Raayan Guardian</h3>
              <p className="text-sm text-muted-foreground text-center mb-3 font-medium">
                Your AI-powered safety companion
              </p>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400">✓</span>
                  <span>Real-time route safety analysis with weather & crowd data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400">✓</span>
                  <span>Emergency SOS with SMS alerts to trusted contacts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400">✓</span>
                  <span>Find nearby safe zones (police, hospitals, safe places)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400">✓</span>
                  <span>Community incident reporting for safer routes</span>
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
                <button
                  onClick={() => navigate("/guardian")}
                  className="w-full text-xs text-center font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors cursor-pointer"
                >
                  Now Live! Try Raayan Guardian →
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground border-t bg-background">
        <p className="font-semibold text-sm">Team Raayan</p>
      </footer>
    </div>
  );
}