import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'
import ThemeToggle from '../../components/ThemeToggle'
import logo_white from '../../assets/logo-white.png'
import logo_dark from '../../assets/logo-dark.png'
import {
  Heart,
  Stethoscope,
  Users,
  Shield,
  Star,
  Calendar,
  Clock,
  CheckCircle,
  ChevronRight,
  ArrowRight,
  Home as HomeIcon,
  Mail,
  Phone,
  MapPin,
  User,
  Award,
  Sparkles,
  Brain,
  HeartHandshake,
  Moon,
  Sun,
  LogIn
} from 'lucide-react'


import { useTheme } from '../../contexts/ThemeContext'

export default function Home() {
  const { isDark } = useTheme()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDoctors(data || [])
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-16 h-16 rounded-full border-4 border-[#b0e7e7] border-t-[#1a5858] dark:border-[#2d9e9e] dark:border-t-[#8adcdc] animate-spin"></div>
        <p className="text-gray-600 dark:text-gray-300 font-medium mt-4">Loading healthcare professionals...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Navigation - Fixed Colors */}
      <nav className="bg-white dark:bg-gray-800 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="w-40 h-40 flex items-center justify-center hover:opacity-90 transition-opacity">
                {/* Show different icon based on theme */}
                {isDark ? (
                  <img
                    src={logo_dark}
                    alt="HealthCare Pro Logo"
                    className="w-40 h-40 object-contain"
                  />
                ) : (
                  <img
                    src={logo_white}
                    alt="HealthCare Pro Logo"
                    className="w-40 h-40 object-contain"
                  />
                )}
              </Link>

            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #b0e7e7 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Gradient Blobs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#b0e7e7]/20 dark:bg-[#2d9e9e]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#8adcdc]/20 dark:bg-[#1a5858]/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 mb-6">
                <Sparkles className="w-4 h-4 text-[#1a5858] dark:text-[#8adcdc]" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Professional Mental Healthcare</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Your Journey to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a5858] via-[#2d9e9e] to-[#3ebdbd] dark:from-[#5fcece] dark:via-[#8adcdc] dark:to-[#b0e7e7] animate-gradient">
                  Better Mental Health
                </span>
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Connect with licensed mental health professionals who are dedicated to
                supporting your wellbeing. Take the first step towards a healthier,
                happier you with our compassionate care team.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  href="#doctors"
                  className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#b0e7e7] to-[#8adcdc] dark:from-[#2d9e9e] dark:to-[#1a5858] text-[#1a5858] dark:text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book a Session</span>
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="#features"
                  className="flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-2 border-gray-200 dark:border-gray-700"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Learn More</span>
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#b0e7e7] to-[#8adcdc] dark:from-[#2d9e9e] dark:to-[#1a5858] rounded-3xl transform -rotate-6"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700 card-enhanced">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 group">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#b0e7e7] to-[#8adcdc] dark:from-[#2d9e9e] dark:to-[#1a5858] flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                      <HeartHandshake className="w-7 h-7 text-[#1a5858] dark:text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Compassionate Care</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Personalized mental health support</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                      <Brain className="w-7 h-7 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Expert Guidance</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Evidence-based therapy approaches</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                      <Shield className="w-7 h-7 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Safe & Confidential</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Secure online sessions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-y border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: `${doctors.length}+`, label: 'Expert Professionals', icon: Users },
              { value: '500+', label: 'Sessions Completed', icon: CheckCircle },
              { value: '98%', label: 'Client Satisfaction', icon: Star },
              { value: '24/7', label: 'Support Available', icon: Clock }
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#b0e7e7] to-[#8adcdc] dark:from-[#2d9e9e] dark:to-[#1a5858] rounded-xl mb-3">
                    <Icon className="w-6 h-6 text-[#1a5858] dark:text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <main id="doctors" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#b0e7e7]/20 dark:bg-[#2d9e9e]/20 rounded-full mb-4">
            <Stethoscope className="w-4 h-4 text-[#1a5858] dark:text-[#8adcdc]" />
            <span className="text-sm font-medium text-[#1a5858] dark:text-[#8adcdc]">Our Team</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Meet Our Mental Health Professionals
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our team of licensed therapists and psychologists brings expertise and compassion
            to every session, helping you navigate your mental health journey.
          </p>
        </div>

        {doctors.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">No doctors available at the moment</p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">Please check back soon for available professionals</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 card-enhanced overflow-hidden"
              >
                {/* Doctor Image */}
                <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
                  {doctor.profile_image_url ? (
                    <img
                      src={doctor.profile_image_url}
                      alt={doctor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#b0e7e7] to-[#8adcdc] dark:from-[#2d9e9e] dark:to-[#1a5858] flex items-center justify-center">
                        <User className="w-12 h-12 text-[#1a5858] dark:text-white" />
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Available Now
                    </span>
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-[#1a5858] dark:group-hover:text-[#8adcdc] transition-colors">
                        {doctor.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                          {doctor.specialty}
                        </div>
                      </div>
                    </div>
                    <Award className="w-5 h-5 text-amber-500" />
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 leading-relaxed">
                    {doctor.description || 'Licensed mental health professional with expertise in evidence-based therapeutic approaches.'}
                  </p>

                  <Link
                    to={`/book/${doctor.id}`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-[#b0e7e7] to-[#8adcdc] dark:from-[#2d9e9e] dark:to-[#1a5858] text-[#1a5858] dark:text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <span>Book Session</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-[#1a5858] to-[#0d3d3d] dark:from-[#0f172a] dark:to-[#1e293b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">Why Choose Us</span>
              </div>

              <h2 className="text-3xl font-bold text-white mb-8">
                Compassionate Care, <br />
                Exceptional Results
              </h2>

              <div className="space-y-6">
                {[
                  {
                    icon: Shield,
                    title: 'Confidential & Secure',
                    description: 'Your privacy is protected with end-to-end encryption and strict confidentiality policies.'
                  },
                  {
                    icon: Star,
                    title: 'Expert Professionals',
                    description: 'Our team consists of licensed therapists with years of clinical experience.'
                  },
                  {
                    icon: Calendar,
                    title: 'Flexible Scheduling',
                    description: 'Book sessions that fit your schedule with our easy online booking system.'
                  }
                ].map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                        <p className="text-white/70 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#b0e7e7]/20 to-[#8adcdc]/20 rounded-3xl transform rotate-3"></div>
              <div className="relative bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20">
                <div className="text-white/90 text-lg italic leading-relaxed mb-6">
                  "Taking the first step towards better mental health is the most important
                  step you can take. We're here to support you on this journey with
                  compassion and expertise."
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#b0e7e7] to-[#8adcdc] dark:from-[#2d9e9e] dark:to-[#1a5858] flex items-center justify-center">
                    <Heart className="w-6 h-6 text-[#1a5858] dark:text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">HealthCare Pro Team</p>
                    <p className="text-white/60 text-sm">Dedicated to Your Wellbeing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Link to="/" className="w-40 h-40 flex items-center justify-center hover:opacity-90 transition-opacity">
                  {/* Show different icon based on theme */}
                  {isDark ? (
                    <img
                      src={logo_dark}
                      alt="HealthCare Pro Logo"
                      className="w-40 h-40 object-contain"
                    />
                  ) : (
                    <img
                      src={logo_white}
                      alt="HealthCare Pro Logo"
                      className="w-40 h-40 object-contain"
                    />
                  )}
                </Link>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Professional mental healthcare services for individuals seeking support and guidance.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Info</h4>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>support@healthcarepro.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>123 Health St, Wellness City</span>
                </div>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <a href="#" className="hover:text-[#1a5858] dark:hover:text-[#8adcdc] transition-colors block">Our Team</a>
                <a href="#" className="hover:text-[#1a5858] dark:hover:text-[#8adcdc] transition-colors block">Services</a>
                <a href="#" className="hover:text-[#1a5858] dark:hover:text-[#8adcdc] transition-colors block">Resources</a>
                <a href="#" className="hover:text-[#1a5858] dark:hover:text-[#8adcdc] transition-colors block">Testimonials</a>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <a href="#" className="hover:text-[#1a5858] dark:hover:text-[#8adcdc] transition-colors block">Privacy Policy</a>
                <a href="#" className="hover:text-[#1a5858] dark:hover:text-[#8adcdc] transition-colors block">Terms of Service</a>
                <a href="#" className="hover:text-[#1a5858] dark:hover:text-[#8adcdc] transition-colors block">Cookie Policy</a>
                <a href="#" className="hover:text-[#1a5858] dark:hover:text-[#8adcdc] transition-colors block">Accessibility</a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} HealthCare Pro. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Licensed Mental Health Provider</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}