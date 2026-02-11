'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';
import Link from 'next/link';
import { X, Calendar, MapPin, ShieldCheck } from 'lucide-react';
import { Playfair_Display, Manrope } from 'next/font/google';

const display = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
  preload: false,
});

const sans = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  preload: false,
});
export default function HomePage() {
  const [images, setImages] = useState<any[]>([]);
  const [members, setMembers] = useState<
    { id: string; name: string; title: string; photo_url: string }[]
  >([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeModal, setActiveModal] = useState<
    | { type: 'gallery'; index: number }
    | { type: 'member'; index: number }
    | null
  >(null);
  const [showDonate, setShowDonate] = useState(false);
  const [failedGalleryImages, setFailedGalleryImages] = useState<number[]>([]);
  const [failedMemberImages, setFailedMemberImages] = useState<number[]>([]);
  const [loadingGalleryImages, setLoadingGalleryImages] = useState<boolean[]>(
    [],
  );
  const [loadingMemberImages, setLoadingMemberImages] = useState<boolean[]>([]);
  const [galleryRetry, setGalleryRetry] = useState<number[]>([]);
  const [memberRetry, setMemberRetry] = useState<number[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [activeMemberSlide, setActiveMemberSlide] = useState(0);
  const memberSliderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });

    supabase
      .from('gallery')
      .select('image_url')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        const list = data || [];
        setImages(list);
        setLoadingGalleryImages(list.map(() => true));
        setFailedGalleryImages([]);
        setGalleryRetry(list.map(() => 0));
      });

    supabase
      .from('member_associations')
      .select('id, name, title, photo_url')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        const list = data || [];
        setMembers(list);
        setLoadingMemberImages(list.map(() => true));
        setFailedMemberImages([]);
        setMemberRetry(list.map(() => 0));
      });
  }, []);

  useEffect(() => {
    if (!images.length) return;
    const id = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % images.length);
    }, 4500);
    return () => clearInterval(id);
  }, [images.length]);

  const scrollToIndex = (
    ref: React.RefObject<HTMLDivElement | null>,
    index: number,
  ) => {
    const container = ref.current;
    if (!container) return;
    const firstChild = container.children[0] as HTMLElement | undefined;
    if (!firstChild) return;
    const style = getComputedStyle(container);
    const gapValue = style.columnGap || style.gap || '0px';
    const gap = Number.parseFloat(gapValue) || 0;
    const itemWidth = firstChild.offsetWidth + gap;
    container.scrollTo({ left: index * itemWidth, behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToIndex(sliderRef, activeSlide);
  }, [activeSlide]);

  useEffect(() => {
    if (!members.length) return;
    const id = setInterval(() => {
      setActiveMemberSlide((prev) => (prev + 1) % members.length);
    }, 5200);
    return () => clearInterval(id);
  }, [members.length]);

  useEffect(() => {
    scrollToIndex(memberSliderRef, activeMemberSlide);
  }, [activeMemberSlide]);

  const memberUrls = useMemo(
    () =>
      members.map((member) =>
        supabase.storage.from('member-photos').getPublicUrl(member.photo_url).data
          .publicUrl,
      ),
    [members],
  );

  const galleryImage =
    activeModal?.type === 'gallery'
      ? images[activeModal.index]?.image_url
      : null;
  const memberImage =
    activeModal?.type === 'member'
      ? memberUrls[activeModal.index]
      : null;

  const goPrev = useCallback(() => {
    if (!activeModal) return;
    if (activeModal.type === 'gallery' && images.length) {
      setActiveModal({
        type: 'gallery',
        index: (activeModal.index - 1 + images.length) % images.length,
      });
    }
    if (activeModal.type === 'member' && members.length) {
      setActiveModal({
        type: 'member',
        index: (activeModal.index - 1 + members.length) % members.length,
      });
    }
  }, [activeModal, images.length, members.length]);

  const goNext = useCallback(() => {
    if (!activeModal) return;
    if (activeModal.type === 'gallery' && images.length) {
      setActiveModal({
        type: 'gallery',
        index: (activeModal.index + 1) % images.length,
      });
    }
    if (activeModal.type === 'member' && members.length) {
      setActiveModal({
        type: 'member',
        index: (activeModal.index + 1) % members.length,
      });
    }
  }, [activeModal, images.length, members.length]);

  useEffect(() => {
    if (!activeModal) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') goPrev();
      if (event.key === 'ArrowRight') goNext();
      if (event.key === 'Escape') setActiveModal(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeModal, goNext, goPrev]);

  useEffect(() => {
    if (!activeModal) return;
    if (typeof window === 'undefined') return;

    if (activeModal.type === 'gallery' && images.length) {
      const nextIndex = (activeModal.index + 1) % images.length;
      const prevIndex =
        (activeModal.index - 1 + images.length) % images.length;
      const preload = [nextIndex, prevIndex]
        .map((idx) => images[idx]?.image_url)
        .filter(Boolean) as string[];
      preload.forEach((src) => {
        const img = new window.Image();
        img.src = src;
      });
    }

    if (activeModal.type === 'member' && members.length) {
      const nextIndex = (activeModal.index + 1) % members.length;
      const prevIndex =
        (activeModal.index - 1 + members.length) % members.length;
      const preload = [nextIndex, prevIndex]
        .map((idx) => memberUrls[idx])
        .filter(Boolean) as string[];
      preload.forEach((src) => {
        const img = new window.Image();
        img.src = src;
      });
    }
  }, [activeModal, images, members, memberUrls]);

  return (
    <div
      className={`${sans.className} relative w-full space-y-8`}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-[120%] -translate-x-1/2 rounded-[40%] bg-gradient-to-b from-slate-100 via-slate-50 to-transparent" />
        <div className="absolute right-8 top-20 h-32 w-32 rounded-full bg-slate-200/50 blur-2xl" />
        <div className="absolute left-6 top-40 h-24 w-24 rounded-full bg-slate-100/60 blur-2xl" />
      </div>

      {/* Recent events slideshow */}
      <section className="space-y-4 rounded-3xl border border-slate-100 bg-white/85 p-4 shadow-sm md:p-6">
        <div className="flex items-center justify-end">
          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => {
                if (!images.length) return;
                setActiveSlide(
                  (prev) => (prev - 1 + images.length) % images.length,
                );
              }}
              disabled={!images.length}
              className="rounded-full border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-50"
              aria-label="Previous slide"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => {
                if (!images.length) return;
                setActiveSlide((prev) => (prev + 1) % images.length);
              }}
              disabled={!images.length}
              className="rounded-full border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-50"
              aria-label="Next slide"
            >
              ›
            </button>
          </div>
        </div>
        <div
          ref={sliderRef}
          className="flex overflow-x-auto pb-2 scroll-smooth"
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveModal({ type: 'gallery', index: idx })}
              className="group relative min-w-full max-w-full overflow-hidden border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md md:min-w-full md:max-w-full"
            >
              {failedGalleryImages.includes(idx) ? (
                <div className="flex h-64 items-center justify-center bg-slate-100 text-sm text-slate-500 md:h-80">
                  Image unavailable
                </div>
              ) : (
                <div className="relative h-64 w-full md:h-80">
                  {loadingGalleryImages[idx] && (
                    <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
                  )}
                  <Image
                    key={`gallery-${idx}-${galleryRetry[idx] || 0}`}
                    src={`${img.image_url}${
                      galleryRetry[idx] ? `?retry=${galleryRetry[idx]}` : ''
                    }`}
                    alt="Chess event"
                    fill
                    sizes="(max-width: 768px) 100vw, 900px"
                    quality={70}
                    className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                      loadingGalleryImages[idx] ? 'opacity-0' : 'opacity-100'
                    }`}
                    onError={() => {
                      setLoadingGalleryImages((prev) => {
                        const next = [...prev];
                        next[idx] = false;
                        return next;
                      });
                      const retryCount = galleryRetry[idx] || 0;
                      if (retryCount < 1) {
                        setTimeout(() => {
                          setLoadingGalleryImages((prev) => {
                            const next = [...prev];
                            next[idx] = true;
                            return next;
                          });
                          setGalleryRetry((prev) => {
                            const next = [...prev];
                            next[idx] = (next[idx] || 0) + 1;
                            return next;
                          });
                        }, 800);
                        return;
                      }
                      setFailedGalleryImages((prev) =>
                        prev.includes(idx) ? prev : [...prev, idx],
                      );
                    }}
                    onLoad={() =>
                      setLoadingGalleryImages((prev) => {
                        const next = [...prev];
                        next[idx] = false;
                        return next;
                      })
                    }
                  />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-left text-white">
                <p className="text-2xl font-semibold">Panipat Chess Association</p>
                <p className="text-xs text-white/80">Tap to view gallery</p>
              </div>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 pt-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveSlide(idx)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                idx === activeSlide
                  ? 'bg-slate-800'
                  : 'bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Hero */}
      <section className="space-y-5 md:space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white via-white to-slate-50/40 p-6 shadow-sm backdrop-blur md:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-no-repeat opacity-[0.05]"
            style={{
              backgroundImage: "url('/logo.png')",
              backgroundPosition: '85% 18%',
              backgroundSize: 'clamp(240px, 40vw, 520px) auto',
            }}
          />
          <div className="relative space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800 shadow-sm">
              Official Federation Portal
            </div>
            <h1
              className={`${display.className} text-3xl leading-tight text-gray-900 md:text-5xl`}
            >
              Chess Registry
            </h1>
            <p className="text-gray-700 md:text-lg max-w-2xl">
              Register players, verify documents, and participate in official chess
              events with a streamlined, trusted workflow.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={isLoggedIn ? '/profile' : '/events'}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Register for an Event'}
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/players"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
              >
                Search players
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm">
                <Calendar className="h-4 w-4 text-slate-700" />
                Events and registrations
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm">
                <MapPin className="h-4 w-4 text-slate-700" />
                Local and district tournaments
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-slate-700" />
                Secure verification
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Link
          href="/events"
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
        >
          <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-slate-200/40 blur-2xl" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Tournaments
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            Explore Events
          </p>
          <p className="text-sm text-slate-700 mt-1">
            See schedules, venues, and registration details.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-slate-900/20 transition group-hover:translate-x-0.5">
            View upcoming events
            <span aria-hidden="true">→</span>
          </div>
        </Link>

        <Link
          href="/players"
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
        >
          <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-slate-200/30 blur-2xl" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Verification
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            Find a Player
          </p>
          <p className="text-sm text-slate-700 mt-1">
            Check registration status in seconds.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition group-hover:translate-x-0.5">
            Search players
            <span aria-hidden="true">→</span>
          </div>
        </Link>
      </section>

      {/* Info */}
      <section className="space-y-4 rounded-3xl border border-slate-100 bg-white/85 p-4 shadow-sm md:p-6">
        <div className="rounded-2xl border border-gray-100 bg-white/70 p-5 shadow-sm">
          <p className="text-sm text-gray-600">
            This portal is used by players, coaches, referees, and organizers to
            manage chess event participation and verification.
          </p>
        </div>
      </section>

      {/* Association members slider */}
      <section className="space-y-4 rounded-3xl border border-slate-100 bg-white/85 p-4 shadow-sm md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Panipat Chess Association
          </h2>
          <span className="text-xs text-gray-400">Member associations</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Executive committee members
          </p>
          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => {
                if (!members.length) return;
                setActiveMemberSlide(
                  (prev) => (prev - 1 + members.length) % members.length,
                );
              }}
              disabled={!members.length}
              className="rounded-full border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-50"
              aria-label="Previous member"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => {
                if (!members.length) return;
                setActiveMemberSlide((prev) => (prev + 1) % members.length);
              }}
              disabled={!members.length}
              className="rounded-full border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-50"
              aria-label="Next member"
            >
              ›
            </button>
          </div>
        </div>
        <div
          ref={memberSliderRef}
          className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        >
          {members.map((member, index) => {
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => setActiveModal({ type: 'member', index })}
                className="group relative min-w-[240px] max-w-[260px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md md:min-w-[280px]"
              >
                <div className="relative h-56 w-full overflow-hidden bg-white">
                  {failedMemberImages.includes(index) ? (
                    <div className="flex h-full items-center justify-center bg-slate-100 text-sm text-slate-500">
                      Image unavailable
                    </div>
                  ) : (
                    <>
                      {loadingMemberImages[index] && (
                        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
                      )}
                      <Image
                        key={`member-${index}-${memberRetry[index] || 0}`}
                        src={`${memberUrls[index]}${
                          memberRetry[index] ? `?retry=${memberRetry[index]}` : ''
                        }`}
                        alt={member.name}
                        fill
                        sizes="(max-width: 768px) 260px, 280px"
                        quality={70}
                        className={`object-contain transition-transform duration-300 group-hover:scale-105 ${
                          loadingMemberImages[index] ? 'opacity-0' : 'opacity-100'
                        }`}
                        onError={() => {
                          setLoadingMemberImages((prev) => {
                            const next = [...prev];
                            next[index] = false;
                            return next;
                          });
                          const retryCount = memberRetry[index] || 0;
                          if (retryCount < 1) {
                            setTimeout(() => {
                              setLoadingMemberImages((prev) => {
                                const next = [...prev];
                                next[index] = true;
                                return next;
                              });
                              setMemberRetry((prev) => {
                                const next = [...prev];
                                next[index] = (next[index] || 0) + 1;
                                return next;
                              });
                            }, 800);
                            return;
                          }
                          setFailedMemberImages((prev) =>
                            prev.includes(index) ? prev : [...prev, index],
                          );
                        }}
                        onLoad={() =>
                          setLoadingMemberImages((prev) => {
                            const next = [...prev];
                            next[index] = false;
                            return next;
                          })
                        }
                      />
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/85 px-3 py-2 text-left shadow-sm backdrop-blur">
                  <p className="text-base font-semibold text-slate-900">
                    {member.name}
                  </p>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    {member.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-2 pt-2">
          {members.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveMemberSlide(idx)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                idx === activeMemberSlide
                  ? 'bg-slate-800'
                  : 'bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to member ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Support Chess */}
      <section className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm md:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
          Support Chess Development
        </h2>
        <p className="text-sm text-slate-600 max-w-2xl">
          Your voluntary contribution helps us organize tournaments, support young
          players, and keep the Chess Registry accessible for the community.
        </p>
        <button
          onClick={() => setShowDonate(true)}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition hover:bg-slate-800"
        >
          Donate via PhonePe
        </button>
      </section>

      {/* Image Modal */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
          onTouchStart={(event) => {
            const touch = event.touches[0];
            if (!touch) return;
            (event.currentTarget as HTMLElement).dataset.touchStart = String(touch.clientX);
          }}
          onTouchEnd={(event) => {
            const start = Number(
              (event.currentTarget as HTMLElement).dataset.touchStart || 0,
            );
            const touch = event.changedTouches[0];
            if (!touch) return;
            const delta = touch.clientX - start;
            if (Math.abs(delta) < 50) return;
            if (delta > 0) goPrev();
            if (delta < 0) goNext();
          }}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModal(null)}
              aria-label="Close"
              className="absolute -top-3 -right-3 rounded-full bg-white p-2 shadow transition hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-700" />
            </button>

            <div className="relative overflow-hidden rounded-2xl bg-white">
              {(galleryImage || memberImage) && (
                <Image
                  src={galleryImage || memberImage || ''}
                  alt={
                    activeModal.type === 'member'
                      ? members[activeModal.index]?.name || 'Member photo'
                      : 'Event photo'
                  }
                  width={1600}
                  height={1000}
                  className="h-auto w-full object-contain"
                />
              )}
              {activeModal.type === 'member' && members[activeModal.index] && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-6 text-white">
                  <p className="text-lg font-semibold">
                    {members[activeModal.index].name}
                  </p>
                  <p className="text-sm text-white/80">
                    {members[activeModal.index].title}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={goPrev}
                className="rounded-full border border-white/30 bg-white/90 px-3 py-2 text-lg font-semibold text-gray-700 shadow-sm hover:bg-white"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={goNext}
                className="rounded-full border border-white/30 bg-white/90 px-3 py-2 text-lg font-semibold text-gray-700 shadow-sm hover:bg-white"
                aria-label="Next image"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donate Modal */}
      {showDonate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowDonate(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Support Chess Development
                </p>
                <p className="text-xs text-slate-600">
                  Any amount is appreciated.
                </p>
              </div>
              <button
                onClick={() => setShowDonate(false)}
                className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                aria-label="Close donation modal"
              >
                Close
              </button>
            </div>

            <div className="mt-4 flex flex-col items-center gap-3">
              <div className="h-40 w-40 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-500">
                PhonePe QR
              </div>
              <div className="text-xs text-slate-600">
                UPI ID: your-upi-id@upi
              </div>
              <p className="text-xs text-slate-500 text-center">
                This is a voluntary contribution to support local chess activities.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
