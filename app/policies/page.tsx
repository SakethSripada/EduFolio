import { Metadata } from "next"
import { Shield, CreditCard, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Policies | EduFolio",
  description: "Learn about our subscription and refund policies",
}

export default function PoliciesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Our Policies</h1>
        
        <div className="space-y-12">
          {/* Subscription Policy */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <Clock className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-semibold">Subscription Policy</h2>
            </div>
            <div className="prose prose-gray dark:prose-invert">
              <p>
                At EduFolio, we offer subscription-based access to our educational platform. Here's what you need to know:
              </p>
              <ul>
                <li>Subscriptions are billed on a monthly basis</li>
                <li>You can cancel your subscription at any time</li>
                <li>Cancellation will take effect at the end of your current billing period</li>
                <li>No refunds will be issued for partial months</li>
              </ul>
            </div>
          </section>

          {/* Refund Policy */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <CreditCard className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-semibold">Refund Policy</h2>
            </div>
            <div className="prose prose-gray dark:prose-invert">
              <p>
                As EduFolio is a digital service with immediate access to content and features, we maintain a no-refund policy. This is because:
              </p>
              <ul>
                <li>All content and features are available immediately upon subscription</li>
                <li>You can cancel your subscription at any time to stop future charges</li>
                <li>We provide a free trial period to evaluate our service</li>
              </ul>
            </div>
          </section>

          {/* Security & Privacy */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <Shield className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-semibold">Security & Privacy</h2>
            </div>
            <div className="prose prose-gray dark:prose-invert">
              <p>
                Your security and privacy are our top priorities. We use industry-standard encryption and security measures to protect your data. For detailed information about how we handle your data, please review our:
              </p>
              <ul>
                <li><a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a></li>
                <li><a href="/terms-of-service" className="text-primary hover:underline">Terms of Service</a></li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 