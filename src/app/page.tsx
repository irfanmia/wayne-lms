'use client';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import TrackCard from '@/components/tracks/TrackCard';
import CourseCard from '@/components/courses/CourseCard';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer';
import CountUp from '@/components/ui/CountUp';
import GridBackground from '@/components/ui/GridBackground';
import FloatingParticles from '@/components/ui/FloatingParticles';
import DecorativeArcs from '@/components/ui/DecorativeArcs';
import tracks from '@/data/tracks.json';
import courses from '@/data/courses.json';
import { useI18n } from '@/lib/i18n';
import { motion } from 'framer-motion';

export default function Home() {
  const featuredTracks = tracks.slice(0, 3);
  const featuredCourses = courses.slice(0, 3);
  const { t } = useI18n();

  const heroWords = (t('hero.title1') as string).split(' ');

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gray-50">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <FloatingParticles />
        <DecorativeArcs />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-14 sm:pb-20 relative">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5 text-sm text-orange-700 mb-6"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {t('hero.badge')}
            </motion.div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight font-heading">
              {heroWords.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  className="inline-block mr-[0.3em]"
                >
                  {word}
                </motion.span>
              ))}
              <br />
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-orange-500"
              >
                {t('hero.title2')}
              </motion.span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-lg sm:text-xl text-gray-500 mb-4 max-w-2xl mx-auto"
            >
              {t('hero.subtitle')} <span className="text-gray-900 font-medium">{t('hero.subtitleBold')}</span>
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="text-base sm:text-lg text-gray-400 mb-8 max-w-2xl mx-auto"
            >
              {t('hero.description')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/signup"><Button size="lg" className="btn-glow">{t('hero.joinNow')}</Button></Link>
              <Link href="/courses"><Button variant="secondary" size="lg">{t('hero.knowMore')}</Button></Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <GridBackground className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 font-heading">{t('categories.title')}</h2>
              <p className="text-gray-500">{t('categories.subtitle')}</p>
            </div>
          </AnimatedSection>
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { name: t('categories.aiMl'), icon: '🤖', count: courses.filter(c => c.categorySlug === 'ai-ml').length + '+ ' + t('categories.courses'), href: '/courses?cat=ai-ml' },
              { name: t('categories.webDev'), icon: '🌐', count: courses.filter(c => c.categorySlug === 'web-dev').length + '+ ' + t('categories.courses'), href: '/courses?cat=web-dev' },
              { name: t('categories.devops'), icon: '⚙️', count: courses.filter(c => c.categorySlug === 'devops').length + '+ ' + t('categories.courses'), href: '/courses?cat=devops' },
              { name: t('categories.programming'), icon: '💻', count: tracks.length + '+ ' + t('categories.tracks'), href: '/tracks' },
            ].map(cat => (
              <StaggerItem key={cat.name}>
                <Link href={cat.href}>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 text-center card-hover group">
                    <span className="text-3xl sm:text-4xl mb-3 block group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                    <h3 className="text-gray-900 font-semibold mb-1 group-hover:text-orange-600 transition-colors font-heading text-sm sm:text-base">{cat.name}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">{cat.count}</p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </GridBackground>

      {/* Featured Courses */}
      <section className="bg-gray-50 py-12 sm:py-20 relative">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <AnimatedSection>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 font-heading">{t('popularCourses.title')}</h2>
                <p className="text-gray-500">{t('popularCourses.subtitle')}</p>
              </div>
              <Link href="/courses"><Button variant="outline">{t('popularCourses.viewAll')}</Button></Link>
            </div>
          </AnimatedSection>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map(course => (
              <StaggerItem key={course.slug}>
                <div className="card-hover rounded-xl">
                  <CourseCard course={course} />
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Featured Tracks */}
      <GridBackground className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 font-heading">{t('codingTracks.title')}</h2>
                <p className="text-gray-500">{t('codingTracks.subtitle')}</p>
              </div>
              <Link href="/tracks"><Button variant="outline">{t('codingTracks.viewAll')}</Button></Link>
            </div>
          </AnimatedSection>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTracks.map(track => (
              <StaggerItem key={track.slug}>
                <div className="card-hover rounded-xl">
                  <TrackCard track={track} />
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </GridBackground>

      {/* How it works */}
      <section className="bg-gray-50 py-12 sm:py-20 relative">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <DecorativeArcs />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 font-heading">{t('howItWorks.title')}</h2>
              <p className="text-gray-500">{t('howItWorks.subtitle')}</p>
            </div>
          </AnimatedSection>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { step: '01', title: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc'), icon: '🎯' },
              { step: '02', title: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc'), icon: '💻' },
              { step: '03', title: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc'), icon: '🏆' },
            ].map(item => (
              <StaggerItem key={item.step}>
                <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 text-center shadow-sm card-hover">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <div className="text-orange-500 text-sm font-mono mb-2">{item.step}</div>
                  <h3 className="text-2xl font-medium text-gray-900 mb-3 font-heading">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Stats */}
      <GridBackground className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
              {[
                { value: 25000, suffix: '+', label: t('stats.students') },
                { value: 8, suffix: '+', label: t('stats.courses') },
                { value: 50, suffix: '+', label: t('stats.codingTracks') },
                { value: 500, suffix: '+', label: t('stats.exercises') },
              ].map(stat => (
                <div key={stat.label as string}>
                  <div className="text-2xl sm:text-3xl font-extrabold text-orange-500 mb-1 font-heading">
                    <CountUp end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </GridBackground>

      {/* Testimonials */}
      <section className="bg-gray-50 py-12 sm:py-20 relative">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 font-heading">{t('testimonials.title')}</h2>
            </div>
          </AnimatedSection>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: t('testimonials.t1Name'), role: t('testimonials.t1Role'), text: t('testimonials.t1Text'), avatar: '👩💻' },
              { name: t('testimonials.t2Name'), role: t('testimonials.t2Role'), text: t('testimonials.t2Text'), avatar: '👨🎓' },
              { name: t('testimonials.t3Name'), role: t('testimonials.t3Role'), text: t('testimonials.t3Text'), avatar: '👩🔬' },
            ].map(tl => (
              <StaggerItem key={tl.name as string}>
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm card-hover">
                  <p className="text-gray-600 text-sm mb-4">&ldquo;{tl.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tl.avatar}</span>
                    <div>
                      <p className="text-gray-900 text-sm font-medium">{tl.name}</p>
                      <p className="text-gray-400 text-xs">{tl.role}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Newsletter */}
      <GridBackground className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-orange" />
              <div className="relative">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 font-heading">{t('newsletter.title')}</h2>
                <p className="text-orange-100 mb-6 max-w-xl mx-auto">{t('newsletter.subtitle')}</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                  <input type="email" placeholder={t('newsletter.placeholder') as string} className="w-full sm:flex-1 px-4 py-3 rounded-lg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-white/50" />
                  <button className="bg-white text-orange-600 font-semibold px-6 py-3 rounded-lg text-sm hover:bg-orange-50 transition-colors btn-glow">{t('newsletter.subscribe')}</button>
                </div>
                <p className="text-orange-200 text-xs mt-3">{t('newsletter.noSpam')}</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </GridBackground>
    </div>
  );
}
