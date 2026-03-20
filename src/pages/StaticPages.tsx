import { Link } from 'react-router-dom';
import { CheckCircle, Shield } from 'lucide-react';

export const TermsPage = () => (
  <div className="min-h-screen bg-gray-50 pt-24 pb-16">
    <div className="max-w-3xl mx-auto px-4">
      <h1 className="font-display text-5xl tracking-wider text-gray-900 mb-2">TERMS & CONDITIONS</h1>
      <p className="text-gray-500 mb-8">Last updated: March 2026</p>
      <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6 text-sm text-gray-600 leading-relaxed">
        {[
          ['1. Booking & Payments', 'All bookings must be confirmed with full payment in advance. Slots are allocated on a first-come, first-served basis. Online payment via UPI, net banking, or cash at facility is accepted. Booking confirmation will be shared via WhatsApp/SMS after payment verification.'],
          ['2. Code of Conduct', 'Players must wear appropriate sports footwear at all times. No metal-studded shoes on the turf. No alcohol, smoking, or drugs on premises. Players are responsible for maintaining cleanliness and respecting other players and staff.'],
          ['3. Safety & Liability', 'HyperGreen 360 Turf is not liable for any personal injuries or loss of property during your session. Players participate at their own risk. First aid kit is available on-site. Players with medical conditions should consult a doctor before playing.'],
          ['4. Equipment & Facilities', 'Equipment rental is available at additional cost. Players are responsible for any damage caused to turf equipment or facilities. Changing rooms must be vacated within 15 minutes of session end.'],
          ['5. Slot Modifications', 'Time slot changes must be requested at least 4 hours before the booked time. Modifications are subject to availability. No modifications are possible within 2 hours of the booked slot.'],
          ['6. Photography & Media', 'HyperGreen 360 Turf may capture photos/videos during events for promotional purposes. By booking, you consent to this. Inform our staff if you prefer not to be photographed.'],
          ['7. Governing Law', 'These terms are governed by the laws of Tamil Nadu, India. Any disputes shall be resolved in the courts of Virudhunagar district.'],
        ].map(([title, content]) => (
          <div key={title as string}>
            <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
            <p>{content}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const CancellationPage = () => (
  <div className="min-h-screen bg-gray-50 pt-24 pb-16">
    <div className="max-w-3xl mx-auto px-4">
      <h1 className="font-display text-5xl tracking-wider text-gray-900 mb-2">CANCELLATION POLICY</h1>
      <p className="text-gray-500 mb-8">Please read our cancellation and refund policy carefully.</p>
      <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { time: '24+ hours', refund: '100%', color: 'bg-green-50 border-green-200 text-green-800' },
            { time: '4–24 hours', refund: '50%', color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
            { time: '<4 hours', refund: '0%', color: 'bg-red-50 border-red-200 text-red-800' },
          ].map(item => (
            <div key={item.time} className={`border-2 ${item.color} rounded-2xl p-5 text-center`}>
              <div className="font-display text-3xl mb-1">{item.refund}</div>
              <div className="font-semibold text-sm">Refund</div>
              <div className="text-xs mt-1 opacity-75">Cancelled {item.time} before</div>
            </div>
          ))}
        </div>
        <div className="space-y-4 text-sm text-gray-600">
          {[
            ['How to Cancel', 'Call us at 8056564775 or WhatsApp with your booking ID. Cancellation requests must be made by the registered mobile number.'],
            ['Refund Process', 'Approved refunds are processed within 5–7 working days to the original payment method. Cash bookings will be refunded in cash at the facility.'],
            ['No-Shows', 'Players who do not show up without prior cancellation will be marked as no-show and forfeit the entire booking amount.'],
            ['Rescheduling', 'Rescheduling is allowed once per booking, at least 4 hours before the slot, subject to availability. Rescheduled bookings cannot be cancelled for a refund.'],
            ['Force Majeure', 'In case of extreme weather, power failure, or other unforeseen events that force closure, we offer a full rescheduling option or 100% refund.'],
          ].map(([title, content]) => (
            <div key={title as string}>
              <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
              <p>{content}</p>
            </div>
          ))}
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
          <strong>Need help?</strong> Contact us at{' '}
          <a href="tel:8056564775" className="underline">8056564775</a> or{' '}
          <a href="mailto:info@hypergreen360.com" className="underline">info@hypergreen360.com</a>
        </div>
      </div>
    </div>
  </div>
);

export const PricingPage = () => (
  <div className="min-h-screen bg-gray-50 pt-24 pb-16">
    <div className="max-w-5xl mx-auto px-4">
      <div className="text-center mb-12">
        <h1 className="font-display text-5xl tracking-wider text-gray-900 mb-2">PRICING</h1>
        <p className="text-gray-500">Transparent rates. No hidden charges. Best value in Sivakasi.</p>
      </div>

      {/* Pricing cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-3">☀️</div>
          <h3 className="font-bold text-xl mb-1">Day Time</h3>
          <p className="text-gray-400 text-sm mb-4">6:00 AM – 6:00 PM</p>
          <div className="mb-6">
            <span className="text-gray-400 line-through text-sm">₹800</span>
            <span className="font-display text-5xl text-gray-900 ml-2">₹600</span>
            <span className="text-gray-400">/hr</span>
          </div>
          <ul className="text-sm text-left space-y-2 mb-6">
            {['Natural daylight', 'Less crowded', 'Great for practice', 'Free water', '2hr discount: ₹500/hr'].map(f => (
              <li key={f} className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{f}</li>
            ))}
          </ul>
          <Link to="/booking" className="block bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90 text-white rounded-xl py-3 font-bold">Book Day Slot</Link>
        </div>

        <div className="relative bg-gradient-to-r from-green-600 to-blue-500 text-white rounded-2xl p-8 text-center shadow-xl">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-full">BEST VALUE</span>
          <div className="text-5xl mb-3">🌙</div>
          <h3 className="font-bold text-xl mb-1">Night Time</h3>
          <p className="text-green-200 text-sm mb-4">6:00 PM – 6:00 AM</p>
          <div className="mb-6">
            <span className="text-green-300 line-through text-sm">₹1200</span>
            <span className="font-display text-5xl ml-2">₹1000</span>
            <span className="text-green-200">/hr</span>
          </div>
          <ul className="text-sm text-left space-y-2 mb-6 text-green-100">
            {['Pro LED floodlights', 'Prime hours', 'Perfect for matches', 'Free parking', '3hr discount: 20% off'].map(f => (
              <li key={f} className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-300 shrink-0 mt-0.5" />{f}</li>
            ))}
          </ul>
          <Link to="/booking" className="block bg-white text-green-700 rounded-xl py-3 font-bold hover:bg-green-50">Book Night Slot</Link>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-3">🏆</div>
          <h3 className="font-bold text-xl mb-1">Tournament</h3>
          <p className="text-gray-400 text-sm mb-4">Sat 6 PM – Sun 3 AM</p>
          <div className="mb-6">
            <span className="text-gray-400 line-through text-sm">₹1500</span>
            <span className="font-display text-5xl text-gray-900 ml-2">₹1000</span>
            <span className="text-gray-400">/team</span>
          </div>
          <ul className="text-sm text-left space-y-2 mb-6">
            {['Dedicated referee', 'Trophy + cash prize', 'Live scoreboard', 'Team photography', 'Snacks included'].map(f => (
              <li key={f} className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{f}</li>
            ))}
          </ul>
          <a href="tel:8056564775" className="block bg-gradient-to-r from-green-600 to-blue-500 hover:opacity-90 text-white rounded-xl py-3 font-bold">Call to Register</a>
        </div>
      </div>

      {/* Discount table */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-xl text-gray-900 mb-4 text-center">Multi-Hour Discounts</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 font-semibold text-gray-700 text-left">Duration</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Day (6AM–6PM)</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Night (6PM–6AM)</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-green-600">Discount</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['1 Hour', '₹600', '₹1000', 'Standard rate'],
                ['2 Hours', '₹1000 (₹500/hr)', '₹1800 (₹900/hr)', '10% off'],
                ['3 Hours', '₹1440 (₹480/hr)', '₹2400 (₹800/hr)', '20% off'],
              ].map(([d, day, night, disc]) => (
                <tr key={d as string} className="border-t border-gray-100">
                  <td className="py-3 px-4 font-semibold text-left">{d}</td>
                  <td className="py-3 px-4 text-gray-600">{day}</td>
                  <td className="py-3 px-4 text-gray-600">{night}</td>
                  <td className="py-3 px-4 text-green-600 font-semibold">{disc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 text-center mt-3">All prices include ground maintenance, floodlights, changing rooms & drinking water</p>
      </div>
    </div>
  </div>
);

export const PrivacyPage = () => (
  <div className="min-h-screen bg-gray-50 pt-24 pb-16">
    <div className="max-w-3xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-green-600" />
        </div>
        <h1 className="font-display text-5xl tracking-wider text-gray-900">PRIVACY POLICY</h1>
      </div>
      <p className="text-gray-500 mb-2">Last updated: March 2026</p>
      <p className="text-gray-500 text-sm mb-8">
        This policy explains how HyperGreen 360 Turf ("we", "our", "us") collects, uses, and
        protects your personal information when you use our website and booking services.
      </p>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { icon: '🔒', label: 'Secure Payments', sub: 'Razorpay encrypted' },
          { icon: '🚫', label: 'No Data Selling', sub: 'We never sell your data' },
          { icon: '📧', label: 'No Spam', sub: 'Only booking updates' },
        ].map(b => (
          <div key={b.label} className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-1">{b.icon}</div>
            <div className="text-xs font-bold text-gray-900">{b.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{b.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-8 space-y-7 text-sm text-gray-600 leading-relaxed">

        {/* 1 */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 text-base">1. Information We Collect</h3>
          <p className="mb-3">We collect the following types of personal information:</p>
          <div className="space-y-3">
            {[
              ['Account Information', 'Name, email address, and password (hashed) when you create an account. If you sign in with Google, we receive your name, email, and profile picture from Google.'],
              ['Booking Information', 'Phone number, team size, selected date and time slots, and payment details. Payment card/UPI information is processed directly by Razorpay and is never stored on our servers.'],
              ['Contact Form Data', 'Name, email, phone number, subject, and message when you submit the contact form.'],
              ['Usage Data', 'Browser type, IP address, pages visited, and time spent — collected automatically to improve our service.'],
            ].map(([title, desc]) => (
              <div key={title as string} className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                <div><span className="font-semibold text-gray-800">{title}:</span> {desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2 */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 text-base">2. How We Use Your Information</h3>
          <div className="space-y-2">
            {[
              'Process and confirm your turf slot bookings',
              'Send booking confirmation and payment receipts by email',
              'Respond to your contact form enquiries',
              'Notify you of booking status changes or cancellations',
              'Improve our website, services, and user experience',
              'Prevent fraudulent transactions and ensure platform security',
              'Comply with legal obligations under Indian law',
            ].map(item => (
              <div key={item} className="flex gap-2.5 items-start">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3 */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 text-base">3. How We Share Your Information</h3>
          <p className="mb-3">We do not sell, rent, or trade your personal information. We share data only in these limited cases:</p>
          <div className="space-y-3">
            {[
              ['Razorpay', 'Our payment processor. They receive payment details necessary to process your transaction. Razorpay is PCI-DSS compliant. See Razorpay\'s Privacy Policy at razorpay.com.'],
              ['Google', 'If you sign in with Google, we share your authentication request with Google Identity Services. See Google\'s Privacy Policy at policies.google.com.'],
              ['Legal Authorities', 'We may disclose information if required by law, court order, or government authority in accordance with Indian law.'],
              ['Business Transfer', 'In the unlikely event of a merger or acquisition, your data may be transferred to the new entity, which will be bound by this privacy policy.'],
            ].map(([party, desc]) => (
              <div key={party as string} className="bg-gray-50 rounded-xl p-4">
                <div className="font-semibold text-gray-800 mb-1">{party}</div>
                <div>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 text-base">4. Data Storage & Security</h3>
          <p className="mb-3">Your data is stored on secure servers with the following protections:</p>
          <div className="space-y-2">
            {[
              'Passwords are hashed using bcryptjs — we never store plain-text passwords',
              'Authentication uses JWT tokens with expiry — not stored on our servers',
              'All API endpoints are protected with rate limiting and Helmet security headers',
              'Payment data is handled entirely by Razorpay (PCI-DSS Level 1 compliant)',
              'HTTPS encryption for all data in transit',
              'MongoDB data stored with access controls and authentication',
            ].map(item => (
              <div key={item} className="flex gap-2.5 items-start">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5 */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 text-base">5. Cookies & Local Storage</h3>
          <p className="mb-3">We use browser localStorage (not cookies) to store your login session token. This keeps you signed in between visits. We do not use advertising cookies or third-party tracking pixels.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-800"><strong>To sign out and clear your session:</strong> click "Logout" in the navbar. This removes your token from localStorage immediately.</p>
          </div>
        </div>

        {/* 6 */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 text-base">6. Your Rights</h3>
          <p className="mb-3">You have the following rights regarding your personal data:</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              ['Access', 'Request a copy of the personal data we hold about you'],
              ['Correction', 'Update your name, email, or phone via your profile settings'],
              ['Deletion', 'Request deletion of your account and associated data'],
              ['Portability', 'Receive your booking history in a readable format'],
              ['Opt-out', 'Unsubscribe from non-transactional emails at any time'],
              ['Objection', 'Object to processing of your data for any purpose'],
            ].map(([right, desc]) => (
              <div key={right as string} className="border border-gray-200 rounded-xl p-3">
                <div className="font-semibold text-gray-800 text-xs mb-0.5">{right}</div>
                <div className="text-xs text-gray-500">{desc}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-gray-500">To exercise any of these rights, contact us at <a href="mailto:info@hypergreen360.com" className="text-green-600 underline hover:text-green-700">info@hypergreen360.com</a>. We will respond within 30 days.</p>
        </div>

        {/* 7 */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 text-base">7. Data Retention</h3>
          <p>We retain your personal information for as long as your account is active or as needed to provide services. Booking records are retained for 3 years for accounting and legal compliance. You may request deletion of your account at any time, after which personal data is removed within 30 days, except where retention is required by law.</p>
        </div>

        {/* 8 */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 text-base">8. Children's Privacy</h3>
          <p>Our services are not directed at children under 13 years of age. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately and we will delete it.</p>
        </div>

        {/* 9 */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 text-base">9. Third-Party Links</h3>
          <p>Our website may contain links to Google Maps and external services. We are not responsible for the privacy practices of those websites. We encourage you to read their privacy policies before providing any personal information.</p>
        </div>

        {/* 10 */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 text-base">10. Changes to This Policy</h3>
          <p>We may update this Privacy Policy from time to time. The "Last updated" date at the top will reflect any changes. We will notify registered users of significant changes by email. Continued use of our services after changes constitutes acceptance of the updated policy.</p>
        </div>

        {/* 11 */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 text-base">11. Governing Law</h3>
          <p>This Privacy Policy is governed by the laws of India, including the Information Technology Act, 2000 and applicable rules. Any disputes shall be resolved in the courts of Virudhunagar district, Tamil Nadu.</p>
        </div>

        {/* Contact */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <h3 className="font-bold text-green-900 mb-2">Contact Our Privacy Team</h3>
          <p className="text-green-800 text-sm mb-3">For any privacy-related questions, requests, or concerns:</p>
          <div className="space-y-1.5 text-sm text-green-800">
            <div>📧 <a href="mailto:info@hypergreen360.com" className="underline font-semibold hover:text-green-900">info@hypergreen360.com</a></div>
            <div>📞 <a href="tel:8056564775" className="underline font-semibold hover:text-green-900">+91 80565 64775</a></div>
            <div>📍 Housing Board, Near Water Tank, Sivakasi – 626 123, Tamil Nadu</div>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex flex-wrap gap-3 mt-8 text-sm">
        <Link to="/terms" className="text-green-600 hover:text-green-700 font-semibold underline">Terms & Conditions</Link>
        <span className="text-gray-300">·</span>
        <Link to="/cancellation" className="text-green-600 hover:text-green-700 font-semibold underline">Cancellation Policy</Link>
        <span className="text-gray-300">·</span>
        <Link to="/contact" className="text-green-600 hover:text-green-700 font-semibold underline">Contact Us</Link>
      </div>
    </div>
  </div>
);