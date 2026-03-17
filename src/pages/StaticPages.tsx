import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export const TermsPage = () => (
  <div className="min-h-screen bg-gray-50 pt-24 pb-16">
    <div className="max-w-3xl mx-auto px-4">
      <h1 className="font-display text-5xl tracking-wider text-gray-900 mb-2">TERMS & CONDITIONS</h1>
      <p className="text-gray-500 mb-8">Last updated: March 2025</p>
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
  <div className="min-h-screen bg-gray-50  pt-24 pb-16">
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
          <Link to="/booking" className="block bg-gradient-to-r from-green-500 to-blue-500 hover:bg-green-600 text-white rounded-xl py-3 font-bold">Book Day Slot</Link>
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
          <a href="tel:8056564775" className="block bg-gradient-to-r from-green-600 to-blue-500 hover:bg-green-600 text-white rounded-xl py-3 font-bold">Call to Register</a>
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