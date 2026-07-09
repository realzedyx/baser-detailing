'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShadowOverlay } from '@/components/ui/shadow-overlay';

const TOC = [
  { n: '01', title: 'About this business',               id: 's01' },
  { n: '02', title: 'Bookings & deposits',               id: 's02' },
  { n: '03', title: 'Cancellations & rescheduling',      id: 's03' },
  { n: '04', title: 'Pricing & payment',                 id: 's04' },
  { n: '05', title: 'Service delivery',                  id: 's05' },
  { n: '06', title: 'Refunds & remedies',                id: 's06' },
  { n: '07', title: 'Your rights under Australian Consumer Law', id: 's07' },
  { n: '08', title: 'Liability & vehicle condition',     id: 's08' },
  { n: '09', title: 'Weather & access',                  id: 's09' },
  { n: '10', title: 'Privacy',                           id: 's10' },
  { n: '11', title: 'Disputes',                          id: 's11' },
  { n: '12', title: 'General',                           id: 's12' },
];

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Prose helpers ──────────────────────────────────────────────────────────
function SNum({ n }: { n: string }) {
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 11, color: '#CBA65C', letterSpacing: '0.18em', fontWeight: 500, display: 'block', marginBottom: 6 }}>
      {n}
    </span>
  );
}

function STitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 22, fontWeight: 300, color: '#E8E8E8', letterSpacing: '-0.02em', margin: '0 0 20px', lineHeight: 1.2 }}>
      {children}
    </h2>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 12, color: 'rgba(203,166,92,0.75)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500, margin: '24px 0 10px' }}>
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.52)', lineHeight: 1.85, margin: '0 0 14px' }}>
      {children}
    </p>
  );
}

function UL({ items }: { items: React.ReactNode[] }) {
  return (
    <ul style={{ margin: '0 0 14px', padding: 0, listStyle: 'none' }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
          <span style={{ color: '#CBA65C', opacity: 0.6, fontSize: 10, marginTop: 5, flexShrink: 0 }}>✦</span>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.52)', lineHeight: 1.8 }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ margin: '16px 0', padding: '14px 18px', background: 'rgba(203,166,92,0.06)', border: '1px solid rgba(203,166,92,0.2)', borderRadius: 10, borderLeft: '2px solid rgba(203,166,92,0.5)' }}>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, margin: 0 }}>{children}</p>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(203,166,92,0.12), rgba(203,166,92,0.04), transparent)', margin: '48px 0' }} />;
}

function Section({ id, n, title, children }: { id: string; n: string; title: string; children: React.ReactNode }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{ scrollMarginTop: 80 }}
    >
      <SNum n={n} />
      <STitle>{title}</STitle>
      {children}
      <Divider />
    </motion.section>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function TermsPage() {
  const router = useRouter();
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id); });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    TOC.forEach(({ id }) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen w-screen relative overflow-x-hidden" style={{ backgroundColor: '#0a0a0a' }}>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <ShadowOverlay
          color="rgba(203,166,92,0.22)"
          animation={{ scale: 40, speed: 25 }}
          noise={{ opacity: 0.2, scale: 1.5 }}
        />
      </div>

      {/* Sticky back button */}
      <div className="fixed top-0 left-0 right-0 z-50" style={{ padding: '20px 24px', pointerEvents: 'none' }}>
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => router.back()}
          style={{
            pointerEvents: 'all',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            background: 'rgba(10,10,10,0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10,
            padding: '8px 14px',
            cursor: 'pointer',
            fontSize: 12,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.06em',
            transition: 'color 0.2s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </motion.button>
      </div>

      {/* Main layout */}
      <div className="relative z-10 mx-auto" style={{ maxWidth: 780, padding: '0 24px' }}>

        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ paddingTop: 100, paddingBottom: 48 }}
        >
          <p style={{ fontSize: 10, color: 'rgba(203,166,92,0.6)', letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 16 }}>
            Legal
          </p>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 200, color: '#E8E8E8', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 20px' }}>
            Terms, Policies &amp; Consumer Rights
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', marginBottom: 24 }}>
            {['Baser Detailing (sole trader)', 'ABN: 29 765 538 947', 'Last updated: July 2026'].map(t => (
              <span key={t} style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em' }}>{t}</span>
            ))}
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.85, maxWidth: 620, margin: 0 }}>
            This document sets out the terms under which Baser Detailing provides services. By booking a service, you agree to these terms. These terms operate alongside your rights under the Australian Consumer Law (ACL) — nothing here limits or removes those statutory rights.
          </p>
        </motion.div>

        {/* ── TABLE OF CONTENTS ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 64, background: 'rgba(255,255,255,0.018)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px 28px', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(203,166,92,0.3), transparent)' }} />
          <p style={{ fontSize: 10, color: 'rgba(203,166,92,0.65)', letterSpacing: '0.24em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 18 }}>
            On this page
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {TOC.map(({ n, title, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 10,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '7px 10px',
                  borderRadius: 8,
                  textAlign: 'left',
                  transition: 'background 0.2s',
                  width: '100%',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(203,166,92,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <span style={{ fontSize: 10, color: activeId === id ? '#CBA65C' : 'rgba(203,166,92,0.45)', fontWeight: 500, letterSpacing: '0.1em', flexShrink: 0, transition: 'color 0.2s' }}>{n}</span>
                <span style={{ fontSize: 13, color: activeId === id ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.38)', transition: 'color 0.2s', lineHeight: 1.5 }}>{title}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── SECTIONS ───────────────────────────────────────────────── */}

        <Section id="s01" n="01" title="About this business">
          <P>Baser Detailing is operated by Yusuf Baser as a sole trader registered in Victoria, Australia. ABN: 29 765 538 947. The business provides mobile car detailing services to consumers across metropolitan Melbourne.</P>
          <P>As a sole trader, Yusuf Baser is personally responsible for all obligations of the business. Any claim against Baser Detailing is a claim against the individual operator.</P>
          <P>Contact: 0410 532 042 · support@baserdetailing.com</P>
        </Section>

        <Section id="s02" n="02" title="Bookings & deposits">
          <Sub>How bookings work</Sub>
          <P>All bookings are made by appointment. A booking is confirmed only when both parties have agreed on a date, time, location and service, and the deposit has been received. Until then, no time slot is held.</P>
          <P>Bookings must be made at least 2 days in advance. Same-day and next-day slots are not available online, as this does not provide enough notice to schedule a detailer.</P>

          <Sub>Deposit requirement</Sub>
          <P>A deposit of 20% of the quoted service price is required to secure every booking. This deposit:</P>
          <UL items={[
            'Is applied in full against the total price on the day of service',
            'Compensates Baser Detailing for the time slot reserved and any preparation undertaken',
            'Is accepted via PayID, card or cash',
          ]} />

          <Sub>Deposit terms</Sub>
          <P>The deposit is non-refundable if you cancel with less than 24 hours&apos; notice or do not show up (see Section 3). This reflects the genuine loss to the business of a blocked time slot that cannot be rebooked at short notice.</P>
          <Callout>
            <strong style={{ color: 'rgba(203,166,92,0.8)' }}>Important:</strong> A deposit that is retained for a late cancellation or no-show reflects genuine business loss, not a penalty. The 20% figure is proportionate to the cost of a reserved half-day slot. This is consistent with Australian Consumer Law requirements for deposit retention.
          </Callout>

          <Sub>Deposit and consumer guarantees</Sub>
          <P>If Baser Detailing cancels your booking or fails to deliver the agreed service, your deposit will be refunded in full. The non-refundable nature of the deposit applies only to customer-initiated cancellations with insufficient notice.</P>
        </Section>

        <Section id="s03" n="03" title="Cancellations & rescheduling">
          <Sub>Cancellations by you</Sub>
          <UL items={[
            <><strong style={{ color: 'rgba(255,255,255,0.65)' }}>More than 24 hours&apos; notice:</strong> Full deposit transferred to your rescheduled date. No charge.</>,
            <><strong style={{ color: 'rgba(255,255,255,0.65)' }}>Less than 24 hours&apos; notice:</strong> Deposit is forfeited. This compensates for the time slot that cannot reasonably be filled at short notice.</>,
            <><strong style={{ color: 'rgba(255,255,255,0.65)' }}>No-show (no contact, appointment missed):</strong> Deposit is forfeited. The balance is not charged.</>,
          ]} />

          <Sub>Rescheduling</Sub>
          <P>You may reschedule your booking once without penalty provided at least 24 hours&apos; notice is given. Your deposit transfers to the new date. A second reschedule may require a new deposit at the operator&apos;s discretion.</P>

          <Sub>Cancellations by Baser Detailing</Sub>
          <P>Baser Detailing reserves the right to cancel or reschedule a booking in the following circumstances:</P>
          <UL items={[
            'Weather conditions that would prevent safe or quality delivery of the service (see Section 9)',
            'Illness or personal emergency',
            'The location does not provide reasonable access, water, or power as required',
          ]} />
          <P>In all cases where Baser Detailing cancels, your deposit will be refunded in full or transferred to a new date at your choice. You will be notified as early as possible.</P>

          <Sub>Change of mind</Sub>
          <P>Under the Australian Consumer Law, you are not automatically entitled to a refund simply because you change your mind about a service. If you cancel your booking for reasons unrelated to any failure on the part of Baser Detailing, the deposit policy above applies.</P>
        </Section>

        <Section id="s04" n="04" title="Pricing & payment">
          <Sub>Pricing</Sub>
          <P>All prices are quoted in Australian dollars and are inclusive of GST where applicable. Current pricing:</P>
          <UL items={[
            'Interior Detail: from $149 (sedans/hatches) — confirm at booking for SUVs, 4WDs and vans',
            'Exterior Detail: from $129 (sedans/hatches) — confirm at booking for larger vehicles',
            'Full Detail (interior + exterior): from $219 (sedans/hatches); higher for SUVs, 4WDs and vans',
          ]} />
          <P>The final price will be confirmed in writing (by text or email) before the booking is secured. No additional charges will be added on the day without your prior agreement.</P>

          <Sub>Optional add-ons</Sub>
          <P>Some services offer optional add-ons that you can select at the time of booking, at a fixed additional price shown before you confirm:</P>
          <UL items={[
            'Pet hair removal (Interior Detail) — +$25',
            'Ceramic sealant, up to 3 months of protection (Exterior Detail) — +$35',
          ]} />
          <P>Add-ons are chosen by you at booking, not applied without your agreement, and are shown as a separate line item in your price breakdown.</P>

          <Sub>Additional charges</Sub>
          <P>In some circumstances an additional charge may apply beyond the selected service and add-ons. These will always be disclosed before work begins, never after. Circumstances that may attract a surcharge include:</P>
          <UL items={[
            'Heavily soiled interiors requiring significantly more time',
            'Vehicles substantially larger than a standard SUV',
          ]} />
          <P>You are under no obligation to proceed if you do not agree with any additional quoted amount. If you decline, Baser Detailing will complete only the originally agreed scope and charge the originally agreed price.</P>

          <Sub>Payment method</Sub>
          <P>Payment is by PayID, card or cash. Payment is due on the day of service, upon your satisfaction with the work completed.</P>

          <Sub>What is not currently offered</Sub>
          <P>Baser Detailing does not currently offer paint correction or professional multi-year ceramic coating. These services will not be provided and are not included in any quoted price. The optional ceramic sealant add-on above is a separate, shorter-term protective product and is not a substitute for professional ceramic coating.</P>
        </Section>

        <Section id="s05" n="05" title="Service delivery">
          <Sub>What you must provide</Sub>
          <P>To allow the service to be carried out, you must provide:</P>
          <UL items={[
            'Access to a water tap at the service location',
            'Access to a 240V power point',
            'Sufficient space to work around the entire vehicle',
            'The vehicle in a location that is reasonably safe to work at (e.g. not on a busy main road)',
          ]} />
          <P>If a suitable location cannot be provided — for example, the only available spot is on a busy main road, or there is no access to water or power — Baser Detailing offers a complimentary pickup and drop-off service for the customer. This means Yusuf will collect you from your location and return you once the job is complete, while the vehicle remains at an agreed working location. This option is arranged in advance and means a booking does not need to be cancelled simply because the location is unsuitable.</P>

          <Sub>Service order</Sub>
          <P>Services are delivered in the following order: interior first, then wheels and tyres, then the exterior wash and dry. This is the operator&apos;s established workflow and will not be varied.</P>

          <Sub>Time</Sub>
          <P>One booking per day is taken, so your job will never be rushed. Arrival time will be agreed at booking. If the operator is delayed, you will be contacted as early as possible.</P>

          <Sub>Vehicle access</Sub>
          <P>You agree to ensure the vehicle is accessible at the agreed time and location. Baser Detailing is not responsible for delays caused by the vehicle being locked, inaccessible, or in a different location to the one agreed.</P>
        </Section>

        <Section id="s06" n="06" title="Refunds & remedies">
          <Sub>Our commitment</Sub>
          <P>If you are not satisfied with any aspect of the service, you should raise it before the operator leaves. Baser Detailing will make it right on the day wherever possible, at no additional charge. This is both a business commitment and a legal obligation under the Australian Consumer Law.</P>

          <Sub>Minor failures</Sub>
          <P>If there is a minor problem with the service — for example, an area that was missed or not completed to standard — Baser Detailing will re-do or correct that aspect of the work. You are not automatically entitled to a full refund for a minor failure.</P>

          <Sub>Major failures</Sub>
          <P>A major failure occurs where:</P>
          <UL items={[
            'The service is substantially different from what was agreed and described',
            'The service is not delivered with due care and skill',
            'The service causes damage that would not have occurred with proper care',
          ]} />
          <P>In the event of a major failure, you are entitled to choose either a refund for the portion of the service that failed, or to have the service re-performed correctly. These rights exist under the ACL and cannot be excluded by these terms.</P>

          <Sub>How to raise a complaint</Sub>
          <P>Contact Baser Detailing as soon as possible after the service via text or email. Describe the issue clearly and, if possible, include photos. A response will be provided within 2 business days. Baser Detailing will work with you in good faith to resolve the issue promptly.</P>

          <Sub>Change of mind after service</Sub>
          <P>Once a service has been completed and payment has been made, there is no entitlement to a refund because you have changed your mind about wanting the service done. Refund rights arise only where a consumer guarantee has been breached.</P>
        </Section>

        <Section id="s07" n="07" title="Your rights under Australian Consumer Law">
          <P>Nothing in these terms removes or limits your rights under the Australian Consumer Law. These rights apply automatically and cannot be excluded by contract.</P>

          <Sub>Consumer guarantees for services</Sub>
          <P>Under the ACL, all services supplied to consumers must:</P>
          <UL items={[
            'Be provided with due care and skill',
            'Be reasonably fit for the purpose for which they are supplied',
            'Be supplied within a reasonable time (where no time is agreed)',
          ]} />

          <Sub>Your remedies</Sub>
          <P>If a service fails to meet a consumer guarantee, you are entitled to a remedy. The nature of the remedy depends on the severity of the failure:</P>
          <UL items={[
            'Minor failure: the business may choose to re-perform the service or offer compensation for the difference in value',
            'Major failure: you may choose to cancel the service contract and receive a refund, or keep the service and receive compensation for the reduction in value',
          ]} />

          <Sub>No &ldquo;no refunds&rdquo; policy</Sub>
          <P>Baser Detailing does not operate a blanket &ldquo;no refunds&rdquo; policy. Such a statement would be misleading under the ACL. Refund rights exist whenever a consumer guarantee is not met, regardless of any other terms here.</P>

          <Sub>Further information</Sub>
          <P>For more information about your rights under the Australian Consumer Law, visit the ACCC at <a href="https://accc.gov.au" target="_blank" rel="noopener noreferrer" style={{ color: '#CBA65C', textDecoration: 'none', borderBottom: '1px solid rgba(203,166,92,0.3)' }}>accc.gov.au</a> or Consumer Affairs Victoria at <a href="https://consumer.vic.gov.au" target="_blank" rel="noopener noreferrer" style={{ color: '#CBA65C', textDecoration: 'none', borderBottom: '1px solid rgba(203,166,92,0.3)' }}>consumer.vic.gov.au</a>.</P>
        </Section>

        <Section id="s08" n="08" title="Liability & vehicle condition">
          <Sub>Pre-existing condition</Sub>
          <P>Baser Detailing is not responsible for damage that was pre-existing at the time of the booking. You are encouraged to point out any existing scratches, chips, dents or paint issues before work begins, so these can be noted and are not attributed to the detailing service.</P>

          <Sub>Standard of care</Sub>
          <P>Baser Detailing will treat your vehicle with reasonable care and skill throughout the service. All products used are appropriate for automotive detailing. If damage occurs as a direct result of the detailing process through operator error or negligence, Baser Detailing will work with you in good faith to address it.</P>

          <Sub>Limitation of liability</Sub>
          <P>To the extent permitted by law, Baser Detailing&apos;s liability is limited to the cost of re-performing the service or refunding the price paid. Baser Detailing is not liable for indirect or consequential losses.</P>
          <Callout>
            <strong style={{ color: 'rgba(203,166,92,0.8)' }}>Note:</strong> As a sole trader without public liability insurance at this stage, any claim would be against the operator personally. If this is a concern, please raise it before booking.
          </Callout>
        </Section>

        <Section id="s09" n="09" title="Weather & access">
          <Sub>Rain and adverse weather</Sub>
          <P>Car detailing requires suitable outdoor conditions. If weather on the day of your booking is unsuitable (rain, strong wind, extreme heat), Baser Detailing will contact you as early as possible — ideally the evening before — to reschedule. No charge applies to a weather reschedule and your deposit transfers automatically to the new date.</P>

          <Sub>Who decides?</Sub>
          <P>The assessment of whether conditions are suitable is at the operator&apos;s discretion, with the goal of delivering a quality result. A service will not be commenced in conditions where a satisfactory outcome cannot reasonably be achieved.</P>

          <Sub>Access requirements</Sub>
          <P>You are responsible for ensuring the access requirements in Section 5 are met. If the operator arrives and conditions at the location make it impossible or unsafe to proceed, a call-out fee may apply to cover travel costs. This will be communicated before any fee is charged.</P>
        </Section>

        <Section id="s10" n="10" title="Privacy">
          <P>Baser Detailing collects your name, contact details, address and vehicle information for the sole purpose of providing the agreed service and communicating with you about your booking.</P>
          <P>This information is not shared with third parties, not used for marketing without your consent, and is stored securely. You may request access to or deletion of any personal information held by contacting the operator directly.</P>
          <P>Before-and-after photos may be taken of your vehicle for portfolio or marketing purposes. If you do not consent to your vehicle appearing on social media or the Baser Detailing website, please advise the operator before the service begins. Your request will be respected.</P>
        </Section>

        <Section id="s11" n="11" title="Disputes">
          <P>If you have a complaint, please contact Baser Detailing directly in the first instance. Most issues can be resolved quickly and informally:</P>
          <UL items={[
            'Text: 0410 532 042',
            'Email: support@baserdetailing.com',
          ]} />
          <P>If a resolution cannot be reached directly, you may contact Consumer Affairs Victoria at <a href="https://consumer.vic.gov.au" target="_blank" rel="noopener noreferrer" style={{ color: '#CBA65C', textDecoration: 'none', borderBottom: '1px solid rgba(203,166,92,0.3)' }}>consumer.vic.gov.au</a> or the Victorian Civil and Administrative Tribunal (VCAT) for minor consumer disputes.</P>
          <P>These terms are governed by the laws of Victoria, Australia.</P>
        </Section>

        <Section id="s12" n="12" title="General">
          <UL items={[
            <><strong style={{ color: 'rgba(255,255,255,0.6)' }}>Entire agreement:</strong> These terms, together with the booking confirmation and any written quote, constitute the entire agreement between you and Baser Detailing in relation to the service.</>,
            <><strong style={{ color: 'rgba(255,255,255,0.6)' }}>Variations:</strong> These terms may be updated from time to time. The version current at the time of your booking applies to that booking.</>,
            <><strong style={{ color: 'rgba(255,255,255,0.6)' }}>Severability:</strong> If any provision of these terms is found to be unenforceable, the remaining provisions continue in full force.</>,
            <><strong style={{ color: 'rgba(255,255,255,0.6)' }}>ACL disclaimer:</strong> To the extent that anything in these terms is inconsistent with the Australian Consumer Law, the ACL prevails.</>,
          ]} />
        </Section>

        {/* Footer */}
        <div style={{ paddingBottom: 80, textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.1em' }}>
            Baser Detailing · ABN 29 765 538 947 · Victoria, Australia
          </p>
          <Link
            href="/book"
            style={{ display: 'inline-block', marginTop: 28, fontSize: 12, color: '#CBA65C', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', border: '1px solid rgba(203,166,92,0.25)', borderRadius: 10, padding: '10px 24px', transition: 'background 0.2s' }}
          >
            Book a detail →
          </Link>
        </div>

      </div>
    </div>
  );
}
