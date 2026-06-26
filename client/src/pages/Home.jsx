import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import SocialProof from '../components/SocialProof';

function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = el.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = entry.target.dataset.revealTransform || 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = item.dataset.revealInitial || 'translateY(32px)';
      item.style.transition = `opacity 700ms ease-out ${item.dataset.revealDelay || '0ms'}, transform 700ms ease-out ${item.dataset.revealDelay || '0ms'}`;
      observer.observe(item);
    });
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function Home() {
  const { t } = useI18n();
  const { user, isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);
  const sectionRef = useScrollReveal();

  const CARDS = [
    { slug: 'jd-e-card', name: t('cardNames.jd-e-card'), brand: t('cardBrands.jd'), region: t('home.regionChina'), gradient: 'from-[#e53935] to-[#b71c1c]', icon: 'ri-shopping-bag-3-fill', badge: 'BEST', price: '105,090원', discount: `${t('home.upTo')} 7%`, img: 'https://public.readdy.ai/ai/img_res/edited_22b069a66bbe469de69201f29ba19bce_dda0b3f8.jpg' },
    { slug: 'tmall-card', name: t('cardNames.tmall-card'), brand: t('cardBrands.tmall'), region: t('home.regionChina'), gradient: 'from-[#ff5722] to-[#bf360c]', icon: 'ri-store-2-fill', badge: null, price: '21,244원', discount: `${t('home.upTo')} 6%`, img: 'https://readdy.ai/api/search-image?query=Premium%20luxury%20physical%20gift%20card%20design%20for%20Tmall%20Chinese%20e-commerce%20platform%2C%20identical%20premium%20style%20to%20Netflix%20gift%20card.%20Dark%20warm%20gradient%20background%20with%20dramatic%20cinematic%20lighting.%20The%20card%20is%20displayed%20at%20an%20elegant%203D%20isometric%20perspective%20angle%20with%20realistic%20depth%2C%20soft%20shadows%2C%20and%20subtle%20reflections.%20Card%20surface%20has%20rich%20orange%20to%20deep%20red%20gradient%20with%20clean%20crisp%20white%20TMALL%20text%20prominently%20printed%20in%20sharp%20modern%20sans-serif%20font.%20Small%20silver%20metallic%20chip%20visible%20on%20the%20card.%20High-end%20studio%20product%20photography%2C%20photorealistic%20rendering%2C%20elegant%20premium%20retail%20catalog%20aesthetic%2C%20the%20brand%20text%20must%20be%20perfectly%20legible%20and%20sharp%20with%20no%20blur&width=420&height=265&seq=tmall-premium-netflix-style-2026-06-16&orientation=landscape' },
    { slug: 'amazon-card', name: t('cardNames.amazon-card'), brand: t('cardBrands.amazon'), region: t('home.regionGlobalShopping'), gradient: 'from-[#ff9900] to-[#e65100]', icon: 'ri-amazon-fill', badge: 'HOT', price: '73,720원', discount: `${t('home.upTo')} 3%`, img: 'https://public.readdy.ai/ai/img_res/edited_a141461041ba769d88d85d223b149772_2d94da05.jpg' },
    { slug: 'uber-card', name: t('cardNames.uber-card'), brand: t('cardBrands.uber'), region: t('home.regionGlobalTravel'), gradient: 'from-[#1a1a1a] to-[#000000]', icon: 'ri-taxi-fill', badge: null, price: '71,440원', discount: `${t('home.upTo')} 6%`, img: 'https://public.readdy.ai/ai/img_res/edited_edcf3d674a08f6d0dcedc413982a78c7_9785cfae.jpg' },
    { slug: 'netflix-card', name: t('cardNames.netflix-card'), brand: t('cardBrands.netflix'), region: t('home.regionGlobalEnt'), gradient: 'from-[#e50914] to-[#b30710]', icon: 'ri-netflix-fill', badge: 'NEW', price: '72,200원', discount: `${t('home.upTo')} 5%`, img: 'https://public.readdy.ai/ai/img_res/edited_4bf2ee1ba1f6940970ae6623f0c10027_aef826a2.jpg' },
    { slug: 'costco-card', name: t('cardNames.costco-card'), brand: t('cardBrands.costco'), region: t('home.regionGlobalShopping'), gradient: 'from-[#e31837] to-[#8a0e21]', icon: 'ri-shopping-cart-2-fill', badge: null, price: '145,920원', discount: `${t('home.upTo')} 4%`, img: 'https://public.readdy.ai/ai/img_res/edited_23cbf32a910db424d7ab98ec64bf50fa_ef5db8cf.jpg' },
    { slug: 'lazada-card', name: t('cardNames.lazada-card'), brand: t('cardBrands.lazada'), region: t('home.regionSEA'), gradient: 'from-[#0f136d] to-[#070942]', icon: 'ri-shopping-bag-fill', badge: null, price: '55,460원', discount: `${t('home.upTo')} 6%`, img: 'https://public.readdy.ai/ai/img_res/edited_f98f30b290057c3ec42ec40c31cbcdb2_7cee643d.jpg' },
  ];

  const FAQS = [
    { q: t('faqs.q1'), a: t('faqs.a1') },
    { q: t('faqs.q2'), a: t('faqs.a2') },
    { q: t('faqs.q3'), a: t('faqs.a3') },
    { q: t('faqs.q4'), a: t('faqs.a4') },
    { q: t('faqs.q5'), a: t('faqs.a5') },
    { q: t('faqs.q6'), a: t('faqs.a6') },
  ];

  const STEPS = [
    { num: 1, title: t('home.step1Title'), desc: t('home.step1Desc'), icon: 'ri-user-add-line' },
    { num: 2, title: t('home.step2Title'), desc: t('home.step2Desc'), icon: 'ri-shopping-cart-2-line' },
    { num: 3, title: t('home.step3Title'), desc: t('home.step3Desc'), icon: 'ri-secure-payment-line' },
    { num: 4, title: t('home.step4Title'), desc: t('home.step4Desc'), icon: 'ri-mail-send-line' },
  ];

  const BENEFITS = [
    { num: '01', title: t('home.benefit1Title', '100% 정품 보증'), desc: t('home.benefit1Desc', '공식 유통사를 통해 발급된 정품 디지털 코드만 취급합니다. 잔액 미충전 시 100% 환불 보장.'), icon: 'ri-shield-check-fill', cornerBg: 'oklch(0.86 0.045 175 / 0.3)', iconBg: 'oklch(0.86 0.045 175)', iconColor: 'oklch(0.52 0.08 175)', lineBg: 'oklch(0.66 0.075 175)' },
    { num: '02', title: t('home.benefit2Title', '평균 3분 즉시 발급'), desc: t('home.benefit2Desc', '결제 완료 후 평균 3분 이내, 등록된 이메일로 PIN 코드가 자동 발급됩니다.'), icon: 'ri-flashlight-fill', cornerBg: 'oklch(0.92 0.085 82 / 0.3)', iconBg: 'oklch(0.92 0.085 82)', iconColor: 'oklch(0.75 0.155 75)', lineBg: 'oklch(0.81 0.15 78)' },
    { num: '03', title: t('home.benefit3Title', '최대 7% 추가 할인'), desc: t('home.benefit3Desc', '추천인 코드로 가입하시면 일반 회원보다 평생 추가 할인 혜택을 누리세요.'), icon: 'ri-coupon-3-fill', cornerBg: 'oklch(0.88 0.06 22 / 0.3)', iconBg: 'oklch(0.88 0.06 22)', iconColor: 'oklch(0.56 0.19 22)', lineBg: 'oklch(0.68 0.16 22)' },
    { num: '04', title: t('home.benefit4Title', '채널톡 실시간 상담'), desc: t('home.benefit4Desc', '오전 09:00~저녁 21:00. 구매 전 문의부터 발급 후 사용 가이드까지 친절하게 안내해 드립니다.'), icon: 'ri-customer-service-2-fill', cornerBg: 'oklch(0.92 0.085 82 / 0.3)', iconBg: 'oklch(0.92 0.085 82)', iconColor: 'oklch(0.75 0.155 75)', lineBg: 'oklch(0.81 0.15 78)' },
  ];

  return (
    <div className="min-h-screen bg-background-50" ref={sectionRef}>
      {/* ═══ HERO ═══ */}
      <section className="relative w-full overflow-hidden bg-background-50">
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(https://readdy.ai/api/search-image?query=Elegant%20warm%20cream%20and%20ivory%20studio%20background%20with%20subtle%20floating%20golden%20gift%20card%20shapes%20and%20soft%20amber%20bokeh%20particles%2C%20premium%20editorial%20photography%20style%2C%20minimal%20clean%20composition%2C%20warm%20neutral%20tones%2C%20soft%20natural%20lighting%2C%20luxury%20feel%2C%20no%20people%2C%20delicate%20gold%20foil%20accents&width=1920&height=1080&seq=hero-bg-2026-cream-v1&orientation=landscape)` }}></div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background-50/35 via-background-50/15 to-background-50/65"></div>
        <div className="pointer-events-none absolute top-32 left-[12%] z-[1] h-72 w-72 rounded-full bg-accent-400/8 blur-[80px]"></div>
        <div className="pointer-events-none absolute bottom-24 right-[8%] z-[1] h-96 w-96 rounded-full bg-primary-400/6 blur-[100px]"></div>
        <div className="pointer-events-none absolute top-1/2 left-1/2 z-[1] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary-400/4 blur-[60px]"></div>
        <div className="absolute inset-0 z-[1] bg-dot-pattern opacity-60"></div>

        {/* Floating gift cards (xl only) */}
        <div className="absolute top-32 right-10 z-[5] hidden xl:block animate-float-y" style={{ animationDelay: '0s' }}>
          <div className="w-72 rotate-[5deg] overflow-hidden rounded-2xl bg-gradient-to-br from-[#b71c1c] via-[#c62828] to-[#7f0000] p-6 shadow-2xl ring-1 ring-background-50/20">
            <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-white/5 blur-xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-20 w-20 rounded-full bg-white/5 blur-xl" />
            <div className="flex items-center justify-between mb-4">
              <i className="ri-vip-diamond-fill text-amber-400 text-lg"></i>
              <span className="text-[10px] font-medium tracking-wider text-white/40">GiftWay</span>
            </div>
            <div className="text-lg font-mono tracking-[0.15em] text-white/70 mb-4">**** **** **** 7842</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-medium tracking-wider text-white/40 mb-0.5">JD E-CARD</div>
                <div className="text-sm font-bold text-amber-400">¥1,000</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-24 left-8 z-[5] hidden xl:block animate-float-y" style={{ animationDelay: '1.8s', animationDuration: '7s' }}>
          <div className="w-72 -rotate-[4deg] overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a3a1a] via-[#1b5e20] to-[#0a1f0a] p-6 shadow-2xl ring-1 ring-background-50/20">
            <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-white/5 blur-xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-20 w-20 rounded-full bg-white/5 blur-xl" />
            <div className="flex items-center justify-between mb-4">
              <i className="ri-amazon-fill text-amber-400 text-lg"></i>
              <span className="text-[10px] font-medium tracking-wider text-white/40">GiftWay</span>
            </div>
            <div className="text-lg font-mono tracking-[0.15em] text-white/70 mb-4">**** **** **** 0291</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-medium tracking-wider text-white/40 mb-0.5">AMAZON</div>
                <div className="text-sm font-bold text-amber-400">$200</div>
              </div>
              <span className="text-[10px] font-bold text-white/50 bg-white/10 rounded px-2 py-0.5">USA</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col items-center justify-center px-6 pt-40 pb-32 text-center md:px-10 md:pt-48 md:pb-40">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-accent-300/50 bg-background-50/85 px-5 py-2.5 text-xs font-semibold tracking-wide text-accent-700 backdrop-blur-md" data-reveal data-reveal-delay="0ms">
            <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-500 opacity-60"></span><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-500"></span></span>
            {t('home.newMemberDiscount')}
          </span>
          <h1 className="mt-10 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight text-foreground-950 md:text-6xl lg:text-7xl" style={{ fontFamily: 'var(--font-heading)' }} data-reveal data-reveal-delay="150ms">
            {t('home.heroTitle1')}<br /><span className="text-gradient-warm">{t('home.heroTitle2')}</span>{t('home.heroTitleSuffix')}
          </h1>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-foreground-500 md:text-lg" data-reveal data-reveal-delay="300ms">
            {t('home.heroDesc')}
          </p>
          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row" data-reveal data-reveal-delay="450ms">
            <Link to="/giftcards" className="group relative whitespace-nowrap overflow-hidden rounded-2xl bg-primary-500 px-9 py-[17px] text-sm font-bold text-background-50 hover:bg-primary-600 hover:scale-[1.03] transition-all duration-300 flex items-center gap-2.5">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-background-50/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <i className="ri-shopping-bag-3-line text-base relative z-10"></i><span className="relative z-10">{t('home.browseCards')}</span>
            </Link>
            <Link to={isAuthenticated ? '/mypage' : '/signup'} className="group whitespace-nowrap rounded-2xl border-2 border-primary-200 bg-background-50/90 px-9 py-[17px] text-sm font-bold text-primary-700 backdrop-blur-md hover:bg-primary-50 hover:border-primary-300 hover:scale-[1.03] transition-all duration-300 flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-400/20 text-accent-600 group-hover:scale-110 transition-transform"><i className="ri-user-add-line text-sm"></i></span>{isAuthenticated ? t('home.mypage') : t('home.signupCta')}
            </Link>
          </div>
          <div className="mt-14 md:mt-16 grid w-full max-w-3xl grid-cols-3 gap-3 md:gap-5" data-reveal data-reveal-delay="750ms">
            {[
              { val: '320,000+', label: t('home.statSales'), icon: 'ri-shopping-bag-3-fill', bgColor: 'bg-secondary-50', textColor: 'text-secondary-600' },
              { val: '5.2%', label: t('home.statDiscount'), icon: 'ri-percent-fill', bgColor: 'bg-accent-50', textColor: 'text-accent-600' },
              { val: t('home.statTimeVal', '3분 이내'), label: t('home.statTime'), icon: 'ri-timer-flash-fill', bgColor: 'bg-primary-50', textColor: 'text-primary-600' },
            ].map((s, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl border border-background-200/50 bg-background-50/85 p-4 backdrop-blur-sm hover:border-primary-200 hover:-translate-y-1 transition-all duration-500 md:p-5">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className={`relative mx-auto flex h-11 w-11 items-center justify-center rounded-2xl ${s.bgColor}`}>
                  <i className={`${s.icon} text-lg ${s.textColor}`}></i>
                </div>
                <div className="relative mt-3 text-xl font-bold tracking-tight text-foreground-950 md:text-2xl lg:text-3xl" style={{ fontFamily: 'var(--font-heading)' }}>{s.val}</div>
                <div className="relative mt-1.5 text-[11px] font-medium uppercase tracking-wide text-foreground-400 md:text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-background-300/50 to-transparent" />

      {/* ═══ CARD GRID ═══ */}
      <section id="cards" className="bg-background-100/50 py-20 md:py-28" data-product-shop="true">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="flex flex-col items-start gap-5 md:flex-row md:items-end md:justify-between" data-reveal data-reveal-delay="0ms">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-100/80 px-3.5 py-1.5 text-xs font-semibold text-primary-700 border border-primary-200/50">
                <span className="flex h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse"></span>{t('home.popularCards')}
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground-950 md:text-4xl" style={{ fontFamily: 'var(--font-heading)' }}>{t('home.sectionCardsTitle')}</h2>
            </div>
            <Link to="/giftcards" className="rounded-xl border border-background-300/80 bg-background-50 px-6 py-3 text-sm font-semibold text-foreground-700 hover:bg-background-100 hover:border-primary-300 flex items-center gap-2 transition-colors">{t('home.viewAll')}<i className="ri-arrow-right-line"></i></Link>
          </div>
          <div className="mt-10 md:mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {CARDS.map((card, i) => (
              <Link key={card.slug} to={`/giftcards/${card.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-background-200/60 bg-background-50 hover:-translate-y-1.5 hover:border-primary-300/60 transition-all duration-500" data-reveal data-reveal-delay={`${100 + i * 80}ms`}>
                <div className={`relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br ${card.gradient}`}>
                  <img alt={card.name} className="absolute inset-0 h-full w-full object-cover object-top opacity-35 mix-blend-overlay group-hover:scale-105 group-hover:opacity-45 transition-all duration-700" src={card.img} />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground-950/50 via-foreground-950/10 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-background-50/5 via-transparent to-transparent"></div>
                  {card.badge && <span className="absolute right-3 top-3 md:right-4 md:top-4 rounded-full bg-accent-500/95 px-3 py-1 text-[10px] font-bold text-foreground-950 backdrop-blur-sm shadow-sm">{card.badge}</span>}
                  <div className="absolute left-3 top-3 md:left-4 md:top-4 flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-background-50/95 text-foreground-900 ring-1 ring-background-50/10 backdrop-blur-sm"><i className={`${card.icon} text-lg`}></i></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                    <div className="mb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-background-100/70">{card.region}</div>
                    <div className="text-lg md:text-xl font-bold tracking-tight text-background-50">{card.name}</div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
                  <p className="text-xs line-clamp-2 md:text-sm text-foreground-500">{card.brand}</p>
                  <div className="mt-auto flex items-end justify-between border-t border-background-200/60 pt-4">
                    <div>
                      <div className="text-[10px] font-medium uppercase tracking-wider text-foreground-400">{t('home.lowestPrice')}</div>
                      <div className="text-lg font-bold tracking-tight text-foreground-950 md:text-xl">{card.price}<span className="ml-1 text-xs font-medium text-foreground-400">~</span></div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent-100/80 px-2.5 py-1 text-[11px] font-bold text-accent-800 border border-accent-200/50">
                      <i className="ri-coupon-3-fill text-[10px]"></i>{card.discount}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-background-300/50 to-transparent" />

      {/* ═══ BENEFITS ═══ */}
      <section id="benefits" className="relative bg-background-50 py-20 md:py-28">
        <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />
        <div className="relative mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="text-center mb-12 md:mb-16" data-reveal data-reveal-delay="0ms">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary-100/80 px-3.5 py-1.5 text-xs font-semibold text-secondary-700 border border-secondary-200/50">
              <i className="ri-shield-star-fill text-secondary-500"></i>{t('home.benefitsBadge')}
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground-950 md:text-4xl" style={{ fontFamily: 'var(--font-heading)' }}>{t('home.benefitsTitle')}</h2>
            <p className="mt-4 max-w-2xl mx-auto text-sm text-foreground-500 md:text-base">{t('home.benefitsDesc')}</p>
          </div>
          <div className="mt-12 md:mt-16 grid grid-cols-2 gap-4 md:gap-6 md:grid-cols-4">
            {BENEFITS.map((b, i) => (
              <div key={b.num} className="group relative overflow-hidden rounded-2xl border border-background-200/60 bg-background-50 p-5 md:p-6 hover:border-primary-200/60 hover:-translate-y-1 transition-all duration-500" data-reveal data-reveal-delay={`${100 + i * 100}ms`}>
                <div className="absolute -top-10 -right-10 h-20 w-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundColor: b.cornerBg }} />
                <div className="absolute top-3 right-3 h-7 w-7 md:h-8 md:w-8 rounded-full bg-foreground-900/90 flex items-center justify-center text-[9px] font-bold text-background-50">{b.num}</div>
                <div className="h-11 w-11 md:h-12 md:w-12 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" style={{ backgroundColor: b.iconBg, color: b.iconColor }}>
                  <i className={`${b.icon} text-xl`}></i>
                </div>
                <h3 className="mt-4 text-base md:text-lg font-bold text-foreground-950">{b.title}</h3>
                <p className="mt-2 text-xs text-foreground-500 md:text-sm">{b.desc}</p>
                <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundColor: b.lineBg }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-background-300/50 to-transparent" />

      {/* ═══ STEPS ═══ */}
      <section className="relative bg-background-100/60 py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
            <div data-reveal data-reveal-delay="0ms" data-reveal-initial="translateX(-32px)" data-reveal-transform="translateX(0)">
              <span className="inline-flex items-center gap-2 rounded-full bg-accent-100/80 px-3.5 py-1.5 text-xs font-semibold text-accent-800 border border-accent-200/50"><i className="ri-route-line text-accent-600"></i>{t('home.stepsSubtitle')}</span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground-950 md:text-4xl" style={{ fontFamily: 'var(--font-heading)' }}>
                {t('home.stepsTitle').split('·')[0]}<span className="text-primary-600">·</span>{t('home.stepsTitle').split('·')[1]}
              </h2>
              <div className="mt-8 relative overflow-hidden rounded-2xl border border-primary-200/30 bg-gradient-to-br from-primary-500 to-primary-700 p-7 md:p-9 text-background-50 hover:shadow-lg hover:shadow-primary-500/10 transition-shadow duration-500">
                <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-white/5 blur-xl" />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-20 w-20 rounded-full bg-white/5 blur-xl" />
                <i className="ri-gift-fill text-8xl md:text-9xl text-background-50/8 absolute right-4 bottom-4 pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <i className="ri-gift-fill text-accent-400"></i>
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent-300">{t('home.memberBenefits')}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2">{t('home.memberTitle')}</h3>
                  <p className="text-sm text-background-100/70">{t('home.memberDesc')}</p>
                  <Link to="/signup" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-sm font-bold text-foreground-950 hover:bg-accent-400 hover:scale-[1.03] transition-all duration-300">
                    <i className="ri-user-add-fill"></i>{t('home.freeSignup')}
                  </Link>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute left-[30px] top-8 bottom-8 w-0.5 hidden lg:block" style={{ background: 'linear-gradient(180deg, oklch(0.88 0.06 22 / 0.6), oklch(0.88 0.06 22 / 0.3), oklch(0.88 0.06 22 / 0.6))' }} />
              <div className="space-y-4">
                {STEPS.map((step, i) => (
                  <div key={step.num} className="group relative flex gap-4 md:gap-5 rounded-2xl border border-background-200/60 bg-background-50 p-5 hover:border-primary-200/60 hover:-translate-x-0.5 transition-all duration-500" data-reveal data-reveal-delay={`${300 + i * 120}ms`} data-reveal-initial="translateX(-32px)" data-reveal-transform="translateX(0)">
                    <div className="absolute -left-[22px] top-1/2 -translate-y-1/2 hidden lg:block">
                      <div className="h-2.5 w-2.5 rounded-full bg-background-50 ring-2 ring-primary-200/60 group-hover:ring-primary-400/60 transition-colors" />
                    </div>
                    <div className="relative flex h-[60px] w-[60px] md:h-[68px] md:w-[68px] flex-shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 group-hover:scale-105 group-hover:bg-primary-100 transition-all duration-500">
                      <i className={`${step.icon} text-2xl`}></i>
                      <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-foreground-950 ring-2 ring-background-50">{step.num}</span>
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="text-sm md:text-base font-bold text-foreground-950">{step.title}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-foreground-500 md:text-sm">{step.desc}</p>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 hidden lg:block text-foreground-300">
                        <i className="ri-arrow-down-s-line"></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-background-300/50 to-transparent" />

      {/* ═══ CTA ═══ */}
      <section className="bg-background-50 py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-10">
          <div className="relative overflow-hidden rounded-3xl bg-foreground-900 px-6 py-14 md:px-14 md:py-20 lg:px-20 lg:py-24">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(https://readdy.ai/api/search-image?query=Abstract%20warm%20golden%20bokeh%20light%20background%20with%20soft%20ambient%20glow%20and%20elegant%20celebration%20particles%2C%20premium%20festive%20atmosphere%2C%20sophisticated%20event%20visual%20theme%2C%20rich%20depth%20and%20warmth%2C%20luxury%20aesthetic%2C%20refined%20golden%20light%20accents%2C%20clean%20modern%20composition%2C%20dramatic%20warm%20lighting&width=1600&height=600&seq=cta-bg-2026-v1&orientation=landscape)` }}></div>
            <div className="absolute inset-0 opacity-25 bg-gradient-to-br from-accent-500/30 via-primary-600/20 to-accent-400/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground-950/85 via-foreground-950/55 to-foreground-950/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground-950/40 via-transparent to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-accent-500/5 blur-[120px] pointer-events-none" />
            <div className="relative z-10 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
              <div data-reveal data-reveal-delay="0ms">
                <span className="inline-flex items-center gap-2 rounded-full border border-accent-400/40 bg-accent-500/15 px-4 py-2 text-xs font-semibold text-accent-300">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse"></span>{t('home.ctaDiscount')}
                </span>
                <h2 className="mt-6 text-3xl font-bold leading-[1.12] tracking-tight text-background-50 md:text-4xl lg:text-5xl" style={{ fontFamily: 'var(--font-heading)' }}>
                  {t('home.ctaTitle1')} <br className="hidden sm:block" />{t('home.ctaTitle2')} <span className="text-accent-400">{t('home.ctaDiscount')}</span>{t('home.ctaTitle3')}
                </h2>
                <div className="mt-6 flex flex-wrap gap-5">
                  <span className="flex items-center gap-2 text-sm text-background-100/70"><i className="ri-shield-check-fill text-accent-400/80"></i>{t('footer.sslSecure')}</span>
                  <span className="flex items-center gap-2 text-sm text-background-100/70"><i className="ri-time-fill text-accent-400/80"></i>{t('home.statTimeVal', '3분 이내')}</span>
                  <span className="flex items-center gap-2 text-sm text-background-100/70"><i className="ri-customer-service-2-fill text-accent-400/80"></i>{t('footer.consultHours')}</span>
                </div>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row lg:justify-end" data-reveal data-reveal-delay="200ms">
                <Link to="/signup" className="group relative overflow-hidden rounded-2xl bg-accent-500 px-10 py-5 text-base font-bold text-foreground-950 hover:bg-accent-400 hover:scale-[1.03] shadow-lg shadow-accent-500/10 transition-all duration-300 inline-flex items-center justify-center gap-2.5">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-background-50/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <i className="ri-user-add-fill text-base relative z-10"></i><span className="relative z-10">{t('home.freeSignup')}</span>
                </Link>
                <Link to="/giftcards" className="rounded-2xl border-2 border-background-50/35 bg-background-50/8 px-10 py-5 text-base font-bold text-background-50 backdrop-blur-md hover:bg-background-50/20 hover:scale-[1.03] transition-all duration-300 inline-flex items-center justify-center gap-2.5">{t('home.browseCards')}<i className="ri-arrow-right-line"></i></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-background-300/50 to-transparent" />

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="relative bg-background-100/60 py-20 md:py-28">
        <div className="mx-auto max-w-[900px] px-6 md:px-10">
          <div className="text-center mb-12" data-reveal data-reveal-delay="0ms">
            <h2 className="text-3xl font-bold tracking-tight text-foreground-950 md:text-4xl" style={{ fontFamily: 'var(--font-heading)' }}>{t('home.faqTitle')}</h2>
            <p className="mt-4 text-sm text-foreground-500 md:text-base">{t('home.faqSubtitle')}</p>
          </div>
          <div className="flex flex-col gap-3 md:gap-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-background-200/60 bg-background-50 overflow-hidden hover:border-primary-200/60 transition-colors duration-300" data-reveal data-reveal-delay={`${100 + i * 60}ms`}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center gap-4 px-5 py-5 text-left"
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary-500/90 text-background-50 text-xs font-bold">Q</span>
                  <h4 className="flex-1 text-sm md:text-base font-bold text-foreground-950">{faq.q}</h4>
                  <i className={`ri-arrow-down-s-line text-foreground-300 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}></i>
                </button>
                <div className={`grid transition-all duration-300 ${openFaq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 pl-[68px]">
                      <p className="text-sm leading-relaxed text-foreground-500">{faq.a}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center" data-reveal data-reveal-delay="400ms">
            <Link to="/faq" className="rounded-full border border-primary-300/80 bg-primary-50/80 px-7 py-3.5 text-sm font-semibold text-primary-700 hover:scale-[1.02] transition-transform inline-flex items-center gap-2">
              {t('home.faqMore')}<i className="ri-arrow-right-line text-xs"></i>
            </Link>
          </div>
          <div className="mt-8 rounded-2xl border border-background-200/60 bg-background-50 p-7 hover:border-accent-300/50 transition-colors duration-300" data-reveal data-reveal-delay="500ms">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-100 text-accent-600"><i className="ri-customer-service-2-fill text-xl"></i></div>
              <div>
                <div className="font-bold text-foreground-950">{t('home.faqNotFound')}</div>
                <div className="text-sm text-foreground-500">{t('footer.consultHours')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SocialProof />
    </div>
  );
}
