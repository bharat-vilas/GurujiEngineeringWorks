import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Cpu, Wrench, Zap, Shield, Award, Settings2,
  Phone, Mail, MapPin, LogIn, Menu, X, ChevronDown,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";

const SERVICES = [
  {
    icon: Cpu,
    title: "CNC Machining",
    desc: "Precision components machined to exact tolerances using advanced CNC technology.",
  },
  {
    icon: Wrench,
    title: "Lathe & Turning",
    desc: "High-quality turning operations for shafts, bushings, and custom rotational parts.",
  },
  {
    icon: Zap,
    title: "Fabrication & Welding",
    desc: "Structural steel fabrication and certified welding for industrial assemblies.",
  },
  {
    icon: Settings2,
    title: "Milling Operations",
    desc: "Flat, contoured and profile milling to achieve complex component geometries.",
  },
  {
    icon: Award,
    title: "Surface Finishing",
    desc: "Grinding, polishing and surface treatment for a superior finish quality.",
  },
  {
    icon: Shield,
    title: "Custom Engineering",
    desc: "End-to-end solutions from design consultation through delivery and support.",
  },
];

const STATS = [
  { value: "8+", label: "Years of Experience" },
  { value: "150+", label: "Projects Completed" },
  { value: "80+", label: "Satisfied Clients" },
  { value: "2018", label: "Est. Year" },
];

const NAV_LINKS = ["Services", "About", "Contact"];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ── */}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-sm shadow-md"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <img
                src="/GEWlogo2.png"
                alt="Guruji Engineering Works"
                className="h-9 w-auto object-contain"
              />
              <div>
                <p className={cn("font-bold text-sm leading-tight transition-colors", scrolled ? "text-gray-900" : "text-white")}>
                  Guruji Engineering Works
                </p>
                <p className={cn("text-[10px] leading-tight transition-colors", scrolled ? "text-gray-500" : "text-white/70")}>
                  Precision Engineering
                </p>
              </div>
            </div>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map(item => (
                <button
                  key={item}
                  onClick={() => scrollTo(item.toLowerCase())}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    scrolled
                      ? "text-gray-600 hover:text-gray-900"
                      : "text-white/80 hover:text-white"
                  )}
                >
                  {item}
                </button>
              ))}
              <Button
                onClick={() => navigate("/login")}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-5"
              >
                <LogIn className="h-4 w-4" /> Login
              </Button>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className={cn(
                "md:hidden p-2 rounded-lg transition-colors",
                scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
              )}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t shadow-lg"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(item => (
                <button
                  key={item}
                  onClick={() => scrollTo(item.toLowerCase())}
                  className="flex w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  {item}
                </button>
              ))}
              <div className="pt-2">
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <LogIn className="h-4 w-4" /> Login to Dashboard
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url("/lathe_workshop_login_background_v2_centered_4K.png")` }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/75" />

        {/* Hero content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-16">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex justify-center mb-6"
            >
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm ring-2 ring-white/20">
                <img src="/GEWlogo2.png" alt="GEW Logo" className="h-20 w-auto object-contain drop-shadow-2xl" />
              </div>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-3 drop-shadow-lg">
              Guruji Engineering Works
            </h1>

            <p className="text-xl sm:text-2xl font-medium text-emerald-300 mb-3 tracking-wide">
              Precision Engineering · Exceptional Quality
            </p>

            <p className="text-base text-white/65 max-w-2xl mx-auto mb-10 leading-relaxed">
              Delivering high-precision machined components and custom engineering solutions
              to industry leaders — on time, every time.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button
                onClick={() => scrollTo("services")}
                size="lg"
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-12 text-base shadow-xl shadow-emerald-900/30"
              >
                Explore Services
              </Button>
              <Button
                onClick={() => scrollTo("contact")}
                size="lg"
                variant="outline"
                className="gap-2 border-white/60 text-white bg-white/10 hover:bg-white hover:text-gray-900 px-8 h-12 text-base backdrop-blur-sm"
              >
                Contact Us
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="h-7 w-7" />
        </motion.div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            className="text-center mb-16"
          >
            <span className="inline-block text-emerald-600 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
              What We Offer
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Our Services</h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto leading-relaxed">
              From raw material to finished component — comprehensive machining and fabrication
              services tailored to your exact requirements.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.08 }}
                  className="group bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-lg hover:border-emerald-100 transition-all duration-300"
                >
                  <div className="h-13 w-13 h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-5 group-hover:bg-emerald-600 transition-colors duration-300">
                    <Icon className="h-6 w-6 text-emerald-700 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── About / Stats ── */}
      <section id="about" className="py-24 bg-emerald-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-block text-emerald-300 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
                Who We Are
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-6">
                Built on Precision,<br />Driven by Quality
              </h2>
              <p className="text-emerald-100 leading-relaxed mb-5 text-base">
                Founded in 2018, Guruji Engineering Works is a trusted name in precision machining,
                fabrication, and custom engineering solutions based in Sahibabad Industrial Area, Uttar Pradesh.
                Over 8+ years, we have built a reputation for delivering high-quality work with consistency and reliability.
              </p>
              <p className="text-emerald-100 leading-relaxed text-base">
                With 150+ projects completed and 80+ satisfied clients, we serve industries ranging from
                automotive and heavy machinery to infrastructure — delivering components that meet the most
                demanding specifications, on time and within budget.
              </p>
            </motion.div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-5">
              {STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.88 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="bg-emerald-600/50 rounded-2xl p-7 text-center border border-emerald-500/60 hover:bg-emerald-600/70 transition-colors"
                >
                  <div className="text-4xl font-extrabold text-white mb-1 tabular-nums">{s.value}</div>
                  <div className="text-emerald-200 text-sm font-medium">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            className="text-center mb-16"
          >
            <span className="inline-block text-emerald-600 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
              Reach Out
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Contact Us</h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto leading-relaxed">
              Ready to discuss your project? Get in touch and our team will respond promptly.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
            {[
              { icon: Phone, label: "Phone", value: "+91 88518 22243 / +91 80763 37582", href: "tel:+918851822243" },
              { icon: Mail, label: "Email", value: "ramv60074@gmail.com", href: "mailto:ramv60074@gmail.com" },
              { icon: MapPin, label: "Location", value: "Sahibabad Industrial Area, UP, India", href: "#" },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.a
                  key={c.label}
                  href={c.href}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.1 }}
                  className="block text-center p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all group cursor-pointer"
                >
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-600 transition-colors">
                    <Icon className="h-6 w-6 text-emerald-700 group-hover:text-white transition-colors" />
                  </div>
                  <div className="font-semibold text-gray-900 mb-1">{c.label}</div>
                  <div className="text-sm text-gray-500 leading-snug">{c.value}</div>
                </motion.a>
              );
            })}
          </div>

          {/* Login CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-block bg-gray-50 rounded-2xl px-8 py-8 border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-sm mb-4">Are you a team member?</p>
              <Button
                onClick={() => navigate("/login")}
                size="lg"
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-10 h-12 text-base shadow-lg"
              >
                <LogIn className="h-5 w-5" /> Login to Dashboard
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/GEWlogo2.png" alt="GEW Logo" className="h-8 w-auto object-contain opacity-70" />
              <div>
                <p className="font-semibold text-sm text-white/90">Guruji Engineering Works</p>
                <p className="text-xs text-gray-500">Precision Engineering</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              © {new Date().getFullYear()} Guruji Engineering Works. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
