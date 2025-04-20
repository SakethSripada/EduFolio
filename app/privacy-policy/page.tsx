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
            At EduFolio, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
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
          </ul>
          
          <h3 className="text-xl font-medium mb-2">Usage Data</h3>
          <p>We may collect information on how you use our service, including:</p>
          <ul className="list-disc pl-6">
            <li>Pages you visit</li>
            <li>Time spent on pages</li>
            <li>Features you use</li>
            <li>Actions you take</li>
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
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information from unauthorized access, 
            alteration, disclosure, or destruction. Your data is encrypted both in transit and at rest, and we regularly 
            review our security practices to ensure the highest level of protection.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Sharing and Disclosure</h2>
          <p className="mb-4">We may share your information in the following circumstances:</p>
          <ul className="list-disc pl-6">
            <li>With your consent, when you choose to share your portfolio or resume</li>
            <li>With service providers who help us operate our platform</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights, privacy, safety, or property</li>
          </ul>
          <p className="mt-4">
            We do not sell your personal information to third parties.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p className="mb-4">Depending on your location, you may have certain rights regarding your personal information, including:</p>
          <ul className="list-disc pl-6">
            <li>Accessing and updating your information</li>
            <li>Requesting deletion of your data</li>
            <li>Restricting or objecting to processing</li>
            <li>Data portability</li>
            <li>Withdrawing consent</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
          <p>
            We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, 
            and deliver personalized content. You can control cookie settings through your browser preferences.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
            policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.
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