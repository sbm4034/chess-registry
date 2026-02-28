'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar,
  CheckCircle,
  CreditCard,
  IndianRupee,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/outline';
import { Card } from '@/app/components/ui/Card';
import { Section } from '@/app/components/ui/Section';
import LoadingButton from '@/app/components/ui/LoadingButton';
import { X } from 'lucide-react';

export default function EventRegisterPage() {
  const supabase = createClient();
  const params = useParams();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [registrationClosed, setRegistrationClosed] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [profileMissing, setProfileMissing] = useState(false);


  useEffect(() => {
  const fetchSignedUrl = async () => {
    setSignedUrl(null); // reset first

    if (!registration?.payment_screenshot) return;

    const { data, error } = await supabase.storage
      .from('payment-screenshots')
      .createSignedUrl(registration.payment_screenshot, 60);

    if (!error && data?.signedUrl) {
      setSignedUrl(data.signedUrl);
    }
  };

  fetchSignedUrl();
}, [registration]);

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.push(`/login?redirect=/events/${eventId}/register`);
        return;
      }

      const user = sessionData.session.user;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile) {
        setProfileMissing(true);
        setLoading(false);
        return;
      }

      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (!eventData) {
        setLoading(false);
        return;
      }

      setEvent(eventData);

      // Auto close
      if (eventData.registration_deadline) {
        const today = new Date();
        const deadline = new Date(eventData.registration_deadline);
        if (today > deadline) {
          setRegistrationClosed(true);
        }
      }

      const { data: reg } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      setRegistration(reg);
      setLoading(false);
    };

    init();
  }, [eventId]);

  const registerForEvent = async () => {
    if (registration || submitting || registrationClosed) return;

    setSubmitting(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) return;

const { error } = await supabase
  .from('registrations')
  .upsert(
    {
      user_id: user.id,
      event_id: eventId,
      category: 'Open',
      payment_status: 'pending',
      verification_status: 'pending',
    },
    { onConflict: 'event_id,user_id' }
  );

    if (!error) {
      window.location.reload();
    }

    setSubmitting(false);
  };

const uploadPaymentScreenshot = async (file: File) => {
  if (!registration || uploading) return;

  setUploading(true);

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) {
    setUploading(false);
    return;
  }

  const filePath = `${user.id}/${eventId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('payment-screenshots')
    .upload(filePath, file);

  if (uploadError) {
    alert(uploadError.message);
    setUploading(false);
    return;
  }

  const { error: updateError } = await supabase
    .from('registrations')
    .update({
      payment_status: 'paid',
      payment_screenshot: filePath,
    })
    .eq('id', registration.id);

  if (updateError) {
    alert(updateError.message);
    setUploading(false);
    return;
  }

  setUploading(false);
  window.location.reload();
};

  const getStatusMessage = () => {
    if (!registration) return null;

    if (registration.verification_status === 'approved') {
      return {
        text: 'Your participation is officially confirmed.',
        color: 'text-green-600',
      };
    }

    if (registration.payment_status === 'paid') {
      return {
        text: 'Payment received. Awaiting organizer approval.',
        color: 'text-blue-600',
      };
    }

    return {
      text: 'Registration submitted. Please complete payment to confirm participation.',
      color: 'text-gray-600',
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading registration…</p>
      </div>
    );
  }

  if (profileMissing) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-6 text-center max-w-md">
          <p className="text-sm text-gray-700">
            Please complete your profile registration before registering for events.
          </p>

          <Link
            href="/register"
            className="mt-4 inline-block rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
          >
            Complete Registration
          </Link>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Event not found</p>
      </div>
    );
  }

  const status = getStatusMessage();

  return (
    <>
      <div className="min-h-screen px-4 py-8 font-sans bg-surface-base">
        <Section className="py-6">
          <div className="mx-auto max-w-3xl space-y-8 rounded-3xl border border-surface-warm bg-white/80 p-4 shadow-sm backdrop-blur md:p-8">

            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl shadow-md">
              <Image
                src="/chess_event_registration_banner.jpg"
                alt="Event registration banner"
                width={1400}
                height={420}
                className="h-48 w-full object-cover md:h-56"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                <p className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                  OFFICIAL PANIPAT CHESS EVENT
                </p>
                <h1 className="mt-2 font-serif text-2xl md:text-3xl text-white">
                  Event Registration
                </h1>
                <p className="mt-2 text-xs md:text-sm italic text-white/70">
                  <span className="inline-block align-middle text-[0.9em]">♟</span>{' '}
                  <span className="align-middle">Show Your Strategy. Prove Your Move. Become the District Champion!</span>
                </p>
              </div>
            </div>

            {/* Header */}
            <Card className="p-5 md:p-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
                <ShieldCheck className="h-4 w-4 text-gray-400" />
                Official Panipat Chess Event
              </div>
              <h1 className="font-serif mt-3 text-2xl text-text-default md:text-3xl">
                Event Registration
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Complete your registration for this event
              </p>
            </Card>

            {/* Event Info */}
            <Card className="p-5 md:p-6 shadow-md">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div
                  onClick={() => event.image_url && setZoomImage(event.image_url)}
                  className="relative h-24 w-full overflow-hidden rounded-2xl border border-surface-warm bg-white md:h-24 md:w-36 cursor-pointer"
                >
                  {event.image_url ? (
                    <Image
                      src={event.image_url}
                      alt={event.name}
                      width={360}
                      height={240}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface-warm text-xs text-gray-500">
                      Event
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <h2 className="text-xl font-bold text-text-default">
                    {event.name}
                  </h2>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{event.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} className="text-gray-400" />
                    <span>
                      {event.start_date} → {event.end_date}
                    </span>
                  </div>

                  {event.fee_amount && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-brand-gold/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-dark">
                      <IndianRupee size={14} />
                      <span>Fee: ₹{event.fee_amount}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Registration Closed */}
            {registrationClosed && (
              <Card className="p-5">
                <p className="text-red-600 font-medium text-sm">
                  Registration Closed
                </p>
              </Card>
            )}

            {/* Not Registered */}
            {!registration && !registrationClosed && (
              <Card className="p-5 md:p-6">
                <h3 className="text-sm font-semibold text-gray-700">
                  Confirm Participation
                </h3>

                <LoadingButton
                  onClick={registerForEvent}
                  loading={submitting}
                  loadingText="Registering..."
                  className="mt-4 w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold shadow-md hover:bg-accent hover:text-accent-foreground hover:scale-[1.01] transition-all duration-300"
                >
                  Confirm Registration
                </LoadingButton>
              </Card>
            )}

            {/* Registered */}
            {registration && (
              <>
                <Card className="p-5 space-y-2">
                  <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <CheckCircle size={18} />
                    Registration Submitted
                  </div>
                  <p className={`text-sm ${status?.color}`}>
                    {status?.text}
                  </p>
                </Card>

                {registration.payment_status !== 'paid' && (
  <Card className="p-5 space-y-4">
    <div className="flex items-center gap-2 font-medium text-text-default">
      <CreditCard size={18} />
      Upload Payment Screenshot for Confirmation & Event Approval
    </div>

    {event.fee_amount && (
      <div className="text-sm font-semibold">
        Amount to Pay: ₹{event.fee_amount}
      </div>
    )}

    <p className="text-sm text-gray-700">
      Scan QR below and mention your name & event.
    </p>

    <div className="flex flex-col items-center gap-4 rounded-2xl border border-surface-warm bg-white p-5 shadow-sm">
      <div
        onClick={() =>
          setZoomImage(
            'https://wrkbecdjmehklugtcpyt.supabase.co/storage/v1/object/public/documents-public/QR_code.jpeg'
          )
        }
        className="relative w-44 h-44 cursor-pointer"
      >
        <Image
          src="https://wrkbecdjmehklugtcpyt.supabase.co/storage/v1/object/public/documents-public/QR_code.jpeg"
          alt="QR Code"
          fill
          className="rounded-xl object-contain"
        />
      </div>

      <div className="text-xs text-gray-600 text-center">
        UPI ID: <strong>kavitav1721@okaxis</strong>
      </div>
    </div>

    {/* ACTION ROW FIXED ALIGNMENT */}
    <div className="flex flex-wrap items-center gap-6 pt-2">
<label
  className={`inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md hover:bg-accent hover:text-accent-foreground transition-all duration-300 cursor-pointer ${
    uploading ? 'opacity-60 cursor-not-allowed' : ''
  }`}
>
  {uploading ? 'Uploading Screenshot…' : 'Upload Payment Screenshot'}
        <input
  type="file"
  accept="image/*"
  hidden
  disabled={uploading}
  onChange={(e) =>
    e.target.files &&
    uploadPaymentScreenshot(e.target.files[0])
  }
/>
      </label>

      {event.support_whatsapp && (
        <Link
          href={`https://wa.me/${event.support_whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5" />
          Contact Support
        </Link>
      )}
    </div>
  </Card>
)}
{registration &&
  registration.payment_status === 'paid' &&
  registration.payment_screenshot && (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 font-medium">
        <CreditCard size={18} />
        Uploaded Payment Screenshot
      </div>

      <div className="flex flex-col items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm">
        {signedUrl ? (
          <div
            onClick={() => setZoomImage(signedUrl)}
            className="relative w-44 h-44 cursor-pointer"
          >
            <Image
              src={signedUrl}
              alt="Payment Screenshot"
              fill
              className="rounded-xl object-contain"
              unoptimized
            />
          </div>
        ) : (
          <div className="text-xs text-gray-500">
            Loading screenshot...
          </div>
        )}

        <div className="text-xs text-gray-600 text-center">
          Click image to zoom
        </div>
      </div>
    </Card>
)}
              </>
            )}
          </div>
        </Section>
      </div>

      {/* ZOOM MODAL */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setZoomImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomImage(null)}
              className="absolute -top-3 -right-3 bg-white rounded-full p-2"
            >
              <X size={16} />
            </button>

            <Image
              src={zoomImage}
              alt="Zoomed"
              width={1200}
              height={900}
              className="rounded-2xl object-contain max-h-[90vh]"
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  );
}
