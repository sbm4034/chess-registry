'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function HomePage() {
  const supabase = createClient();
  const [images, setImages] = useState<any[]>([]);
  const [members, setMembers] = useState<
    { id: string; name: string; title: string; photo_url: string }[]
  >([]);
  const [activeModal, setActiveModal] = useState<
    | { type: 'gallery'; index: number }
    | { type: 'member'; index: number }
    | null
  >(null);
  const [failedGalleryImages, setFailedGalleryImages] = useState<number[]>([]);
  const [failedMemberImages, setFailedMemberImages] = useState<number[]>([]);
  const [loadingGalleryImages, setLoadingGalleryImages] = useState<boolean[]>([]);
  const [loadingMemberImages, setLoadingMemberImages] = useState<boolean[]>([]);
  const [galleryRetry, setGalleryRetry] = useState<number[]>([]);
  const [memberRetry, setMemberRetry] = useState<number[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [activeMemberSlide, setActiveMemberSlide] = useState(0);
  const memberSliderRef = useRef<HTMLDivElement | null>(null);
  const [showDonate, setShowDonate] = useState(false);

  useEffect(() => {
    supabase
      .from('gallery')
      .select('image_url')
      .order('display_order', { ascending: true })
      .limit(8)
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
      const prevIndex = (activeModal.index - 1 + images.length) % images.length;
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
      const prevIndex = (activeModal.index - 1 + members.length) % members.length;
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
    

    <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-background text-primary">
      <section className="relative min-h-[75vh]">
        <div className="absolute inset-0">
          <Image
            src="/chess_hero_banner.png"
            alt="Chess hero banner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark/80 via-dark/60 to-dark/70" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center text-white">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-widest text-accent">
              OFFICIAL CHESS REGISTRY
            </p>
            <h1 className="text-5xl md:text-6xl font-serif font-semibold tracking-tight text-primary-foreground">
              Empowering Chess Across Panipat
            </h1>
            <div className="w-24 h-[3px] bg-accent mx-auto mt-6" />
            <p className="text-lg font-sans text-white/80 max-w-2xl mx-auto">
              Official Registration & Tournament Platform
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                href="/events"
                className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 shadow-md hover:shadow-lg rounded-full px-8 py-3 font-semibold"
              >
                Explore Events
              </Link>
              <Link
                href="/players"
                className="border border-accent text-accent hover:bg-accent hover:text-accent-foreground rounded-full px-8 py-3 font-semibold transition-all duration-300"
              >
                Find a Player
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl text-primary text-center">
            Trusted Chess Infrastructure
          </h2>
<div className="mt-10 grid gap-6 md:grid-cols-2 text-center md:divide-x md:divide-border">

  <div className="md:px-6">
    <p className="text-6xl font-bold text-primary tracking-tight">150+</p>
    <p className="mt-2 uppercase tracking-widest text-xs text-muted-foreground">
      Players Participated Over the Years
    </p>
  </div>

  <div className="md:px-6">
    <p className="text-6xl font-bold text-primary tracking-tight">20+</p>
    <p className="mt-2 uppercase tracking-widest text-xs text-muted-foreground">
      Tournaments Conducted
    </p>
  </div>

</div>
        </div>
      </section>

      <section className="bg-surface border-t border-border py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl text-primary text-center">
            Recent Tournament Highlights
          </h2>
          <div className="w-16 h-[2px] bg-accent mx-auto mt-3 mb-12" />
          <div className="flex gap-6 overflow-x-auto scrollbar-hide" ref={sliderRef}>
            {[
              ...images.map((img) => img.image_url),
            ].map((src, idx) => (
              <div
                key={`${src}-${idx}`}
                className="relative min-w-[280px] bg-surface border border-border rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <Image
                  src={src}
                  alt="Tournament highlight"
                  width={400}
                  height={280}
                  className="w-full h-48 object-cover rounded-xl"
                />
                <div className="absolute bottom-3 left-3 bg-dark/60 text-primary-foreground text-xs px-3 py-1 rounded-full">
                  Tournament Highlight
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background border-t border-border py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-surface border border-border rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-8">
              <h3 className="font-serif text-xl text-primary font-semibold">Explore Events</h3>
              <p className="mt-2 text-muted-foreground">
                View upcoming official tournaments and registration details.
              </p>
              <div className="mt-5">
                <Link
                  href="/events"
                  className="inline-flex items-center bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 shadow-md hover:shadow-lg rounded-full px-6 py-2"
                >
                  View Events →
                </Link>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-8">
              <h3 className="font-serif text-xl text-primary font-semibold">Search Players</h3>
              <p className="mt-2 text-muted-foreground">
                Find players, coaches, and referees by city or state.
              </p>
              <div className="mt-5">
                <Link
                  href="/players"
                  className="inline-flex items-center bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 shadow-md hover:shadow-lg rounded-full px-6 py-2"
                >
                  View Players →
                </Link>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-8">
              <h3 className="font-serif text-xl text-primary font-semibold">Support Chess</h3>
              <p className="mt-2 text-muted-foreground">
                Help us organize tournaments and grow chess access for the community.
              </p>
              <div className="mt-5">
                <button
                  onClick={() => setShowDonate(true)}
                  className="inline-flex items-center bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 shadow-md hover:shadow-lg rounded-full px-6 py-2"
                >
                  Donate via Gpay
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface border-t border-border py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl text-primary text-center">
            Member Associations
          </h2>
          <div className="mt-8 flex gap-6 overflow-x-auto pb-2 scroll-smooth" ref={memberSliderRef}>
            {members.map((member, index) => (
              <div
                key={member.id}
                className="group relative min-w-[240px] max-w-[260px] bg-surface border border-border rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setActiveModal({ type: 'member', index })}
                  className="block w-full text-left"
                >
                  <div className="relative h-56 w-full overflow-hidden bg-surface">
                    {failedMemberImages.includes(index) ? (
                      <div className="flex h-full items-center justify-center bg-surface text-sm text-muted-foreground">
                        Image unavailable
                      </div>
                    ) : (
                      <>
                        {loadingMemberImages[index] && (
                          <div className="absolute inset-0 animate-pulse bg-surface" />
                        )}
                        <Image
                          key={`member-${index}-${memberRetry[index] || 0}`}
                          src={`${memberUrls[index]}${
                            memberRetry[index] ? `?retry=${memberRetry[index]}` : ''
                          }`}
                          alt={member.name}
                          fill
                          sizes="(max-width: 768px) 260px, 280px"
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
                          onLoadingComplete={() =>
                            setLoadingMemberImages((prev) => {
                              const next = [...prev];
                              next[index] = false;
                              return next;
                            })
                          }
                        />
                      </>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/40 via-dark/10 to-transparent" />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-surface/90 px-3 py-2 text-left shadow-sm">
                    <p className="text-base font-semibold text-primary">
                      {member.name}
                    </p>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {member.title}
                    </p>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-dark/70 p-4 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
          onTouchStart={(event) => {
            const touch = event.touches[0];
            if (!touch) return;
            (event.currentTarget as HTMLElement).dataset.touchStart = String(
              touch.clientX,
            );
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
              className="absolute -top-3 -right-3 rounded-full bg-background p-2 shadow transition hover:bg-surface"
            >
              <X className="h-4 w-4 text-primary" />
            </button>

            <div className="relative overflow-hidden rounded-2xl bg-background">
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
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark/70 via-dark/20 to-transparent p-6 text-primary-foreground">
                  <p className="text-lg font-semibold">
                    {members[activeModal.index].name}
                  </p>
                  <p className="text-sm text-primary-foreground/80">
                    {members[activeModal.index].title}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={goPrev}
              aria-label="Previous"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow transition hover:bg-background"
            >
              ‹
            </button>
            <button
              onClick={goNext}
              aria-label="Next"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow transition hover:bg-background"
            >
              ›
            </button>
          </div>
        </div>
      )}

      {showDonate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-dark/70 p-4"
          onClick={() => setShowDonate(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-primary">
                Support Chess Development
              </h3>
              <button
                onClick={() => setShowDonate(false)}
                className="rounded-full bg-surface p-2"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-primary" />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Any amount is appreciated and helps us organize more tournaments.
            </p>
            <div className="mt-5 flex flex-col items-center gap-4">
  
  
  <div className="relative h-64 w-64 rounded-2xl border border-border bg-white overflow-hidden">
    <Image
      src="https://wrkbecdjmehklugtcpyt.supabase.co/storage/v1/object/public/documents-public/QR_code.jpeg"
      alt="UPI QR Code"
      fill
      className="object-contain p-2"
      sizes="256px"
      priority
    />
  </div>

  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    UPI:
    <span className="font-semibold text-primary">
      kavitav1721@okaxis
    </span>

    <button
      onClick={() => navigator.clipboard.writeText('kavitav1721@okaxis')}
      className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs font-semibold text-primary hover:bg-accent hover:text-accent-foreground transition"
    >
      Copy
    </button>
  </div>

</div>
            <button
              onClick={() => setShowDonate(false)}
              className="mt-6 w-full rounded-full bg-primary text-primary-foreground py-2 font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>

    
  );
}
