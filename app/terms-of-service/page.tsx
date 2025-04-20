import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | EduFolio",
  description: "EduFolio's Terms of Service - Our rules, guidelines, and user agreement",
}

export default function TermsOfService() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Terms of Service</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg mb-6">Last Updated: {new Date().toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using EduFolio, you agree to be bound by these Terms of Service and all applicable laws and regulations.
            If you do not agree with any of these terms, you are prohibited from using the service.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p>
            EduFolio provides tools for educational portfolio management, resume creation, and college application tracking.
            We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
          <p className="mb-4">When you create an account with us, you agree to:</p>
          <ul className="list-disc pl-6">
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and update your information</li>
            <li>Keep your password secure and confidential</li>
            <li>Accept responsibility for all activities that occur under your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. User Content</h2>
          <p className="mb-4">
            You retain all ownership rights to the content you upload, post, or display on EduFolio.
            By submitting content, you grant us a worldwide, non-exclusive license to use, reproduce, modify, and display
            your content solely for the purpose of providing the service to you.
          </p>
          <p>You agree not to post content that:</p>
          <ul className="list-disc pl-6">
            <li>Is unlawful, harmful, threatening, abusive, harassing, or defamatory</li>
            <li>Infringes on intellectual property rights</li>
            <li>Contains viruses or malicious code</li>
            <li>Impersonates another person</li>
            <li>Constitutes unauthorized or unsolicited advertising</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
          <p>
            The service and its original content, features, and functionality are owned by EduFolio and are protected by
            international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, EduFolio shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly,
            or any loss of data, use, goodwill, or other intangible losses resulting from:
          </p>
          <ul className="list-disc pl-6">
            <li>Your use or inability to use the service</li>
            <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
            <li>Any interruption or cessation of transmission to or from the service</li>
            <li>Any bugs, viruses, trojan horses, or the like that may be transmitted to or through the service</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the service immediately, without prior notice or liability,
            for any reason, including breach of these Terms. Upon termination, your right to use the service will immediately cease.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Governing Law</h2>
          <p>
            These Terms shall be governed by the laws of the jurisdiction in which we operate, without regard to its
            conflict of law provisions. You agree to submit to the personal and exclusive jurisdiction of the courts located within this jurisdiction.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. We will provide notice of any changes by
            posting the new Terms on this page and updating the "Last Updated" date. Your continued use of the service after
            any such changes constitutes your acceptance of the new Terms.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
            <a href="mailto:legal@edufolio.com" className="text-primary hover:underline ml-1">legal@edufolio.com</a>
          </p>
        </section>
      </div>
    </div>
  )
} 