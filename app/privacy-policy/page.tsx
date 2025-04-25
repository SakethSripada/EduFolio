import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | EduFolio",
  description: "EduFolio's Privacy Policy - Learn how we handle and protect your data",
}

export default function PrivacyPolicy() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Privacy Policy</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg mb-6">Last Updated: {new Date().toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p>
            At EduFolio ("we", "our", "us"), we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            By using EduFolio, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p className="mb-4">We collect several types of information for various purposes:</p>
          <h3 className="text-xl font-medium mb-2">Personal Information</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Name and contact information</li>
            <li>Educational history and achievements</li>
            <li>Professional experience and skills</li>
            <li>Portfolio and project information</li>
            <li>Account credentials</li>
            <li>User-generated content including essays, project descriptions, and personal statements</li>
            <li>College application details</li>
          </ul>
          
          <h3 className="text-xl font-medium mb-2">Usage Data</h3>
          <p>We may collect information on how you use our service, including:</p>
          <ul className="list-disc pl-6">
            <li>Pages you visit</li>
            <li>Time spent on pages</li>
            <li>Features you use</li>
            <li>Actions you take</li>
            <li>Device information (browser type, IP address, device type)</li>
            <li>Interaction with AI features</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="mb-4">We use your information for the following purposes:</p>
          <ul className="list-disc pl-6">
            <li>Providing and maintaining our service</li>
            <li>Creating and managing your portfolio and resume</li>
            <li>Tracking your college applications</li>
            <li>Improving and personalizing your experience</li>
            <li>Communicating with you about your account</li>
            <li>Ensuring the security of our platform</li>
            <li>Training and improving our AI models (with anonymized data)</li>
            <li>Analyzing usage patterns to enhance features</li>
            <li>Troubleshooting issues and providing support</li>
            <li>Complying with legal obligations</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Artificial Intelligence Features</h2>
          <p className="mb-4">
            EduFolio utilizes artificial intelligence technologies to provide enhanced features like writing assistance, 
            portfolio optimization, and personalized recommendations. When you use these AI features:
          </p>
          <ul className="list-disc pl-6">
            <li>Your inputs may be processed by our AI systems to generate responses</li>
            <li>We may use anonymized and aggregated data from user interactions to improve our AI systems</li>
            <li>AI-generated content remains your property once delivered to you</li>
            <li>You maintain responsibility for reviewing and verifying all AI-generated content before finalizing it</li>
          </ul>
          <p className="mt-4">
            We implement safeguards to protect your data during AI processing, but you should be aware that AI systems 
            have inherent limitations. You should always review AI-generated content for accuracy, appropriateness, and completeness.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information from unauthorized access, 
            alteration, disclosure, or destruction. Your data is encrypted both in transit and at rest, and we regularly 
            review our security practices to ensure the highest level of protection. However, no method of transmission or 
            storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as needed to provide you with our services.
            We may maintain certain information for legal compliance, dispute resolution, or as required by law.
            You may request deletion of your account and associated data, subject to our legal obligations and legitimate business interests.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Sharing and Disclosure</h2>
          <p className="mb-4">We may share your information in the following circumstances:</p>
          <ul className="list-disc pl-6">
            <li>With your consent, when you choose to share your portfolio or resume</li>
            <li>With service providers who help us operate our platform (including cloud storage, analytics, and AI services)</li>
            <li>With third-party integrations that you authorize</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights, privacy, safety, or property</li>
            <li>In connection with a merger, acquisition, or sale of assets (with appropriate safeguards)</li>
          </ul>
          <p className="mt-4">
            We do not sell your personal information to third parties for marketing purposes.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
          <p>
            EduFolio may integrate with or use third-party services to enhance functionality. These services may collect
            information about you when you interact with them. We are not responsible for the privacy practices of these
            third parties, and we encourage you to review their privacy policies. Third-party services may include cloud
            storage providers, authentication services, analytics tools, AI processing services, and payment processors.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p className="mb-4">Depending on your location, you may have certain rights regarding your personal information, including:</p>
          <ul className="list-disc pl-6">
            <li>Accessing and updating your information</li>
            <li>Requesting deletion of your data (subject to exceptions)</li>
            <li>Restricting or objecting to processing</li>
            <li>Data portability</li>
            <li>Withdrawing consent</li>
            <li>Non-discrimination for exercising your rights</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, please contact us. We will respond to your request within a reasonable timeframe and
            in accordance with applicable laws. We may need to verify your identity before fulfilling certain requests.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13 years of age (or the applicable age in your jurisdiction).
            We do not knowingly collect personal information from children. If you are a parent or guardian and believe
            your child has provided us with personal information, please contact us, and we will take steps to remove that information.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">International Data Transfers</h2>
          <p>
            We may process and store your information in countries other than your own, including the United States.
            These countries may have different data protection laws. By using our service, you consent to the transfer
            of your information to these countries. We take appropriate measures to ensure your data remains protected.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
          <p className="mb-4">
            We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, 
            and deliver personalized content. These technologies may collect information about your browsing activities 
            over time and across different websites.
          </p>
          <p>
            You can control cookie settings through your browser preferences. However, disabling certain cookies may limit 
            functionality or degrade your experience with our service.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
            policy on this page and updating the "Last Updated" date. Significant changes may be communicated via email 
            or in-app notification. We encourage you to review this policy periodically to stay informed about how we protect your information.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
          <p>
            While we take reasonable measures to protect your information, we cannot guarantee absolute security or 
            error-free operation. We shall not be liable for any damages arising from security breaches, unauthorized access, 
            or data loss beyond our reasonable control. Our liability is limited to the maximum extent permitted by applicable law.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at: 
            <a href="mailto:privacy@edufolio.com" className="text-primary hover:underline ml-1">privacy@edufolio.com</a>
          </p>
        </section>
      </div>
    </div>
  )
} 