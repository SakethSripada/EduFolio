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
          <p className="mb-4">
            By accessing or using EduFolio ("Service", "we", "our", "us"), you agree to be bound by these Terms of Service ("Terms") and all applicable laws and regulations.
            If you do not agree with any of these terms, you are prohibited from using the service.
          </p>
          <p>
            These Terms constitute a legally binding agreement between you and EduFolio regarding your use of the Service. 
            You represent that you have the authority to enter into this agreement if you are using the Service on behalf of an entity.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p className="mb-4">
            EduFolio provides tools for educational portfolio management, resume creation, college application tracking, and related services.
            We reserve the right to modify, suspend, or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice at any time.
          </p>
          <p>
            EduFolio is provided on an "as-is" and "as-available" basis without any representation or warranty, whether express, implied, or statutory.
            We make no warranties or representations about the accuracy or completeness of the Service's content or the content of any websites linked to the Service.
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
            <li>Ensure that you exit from your account at the end of each session</li>
            <li>Not create more than one account per person unless specifically allowed</li>
            <li>Not share your account with any third party</li>
          </ul>
          <p className="mt-4">
            We reserve the right to terminate or suspend accounts that violate these Terms, at our sole discretion, without notice.
            We may also refuse service to anyone for any reason at any time.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. User Content</h2>
          <p className="mb-4">
            You retain all ownership rights to the content you upload, post, or display on EduFolio ("User Content").
            By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license (with the right to sublicense)
            to use, reproduce, process, adapt, modify, publish, transmit, display, and distribute your User Content in any media or
            distribution methods now known or later developed, solely for the purpose of providing and improving the Service.
          </p>
          <p className="mb-4">You represent and warrant that:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>You own or have the necessary rights to your User Content</li>
            <li>Your User Content does not violate the rights of any third party, including copyright, trademark, privacy, or other personal or proprietary rights</li>
            <li>Your User Content does not contain material that is false, intentionally misleading, or defamatory</li>
            <li>Your User Content does not violate any applicable law or regulation</li>
          </ul>
          <p className="mb-4">You agree not to post content that:</p>
          <ul className="list-disc pl-6">
            <li>Is unlawful, harmful, threatening, abusive, harassing, tortious, or defamatory</li>
            <li>Is libelous, invasive of another's privacy, or hateful</li>
            <li>Infringes on intellectual property rights</li>
            <li>Contains viruses, malware, or other harmful code</li>
            <li>Impersonates another person</li>
            <li>Constitutes unauthorized or unsolicited advertising</li>
            <li>Violates any applicable law or regulation</li>
            <li>Promotes illegal activities or conduct</li>
          </ul>
          <p className="mt-4">
            We reserve the right to remove any User Content that violates these Terms or that we find objectionable for any reason,
            without prior notice to you. We do not endorse, support, represent, or guarantee the completeness, truthfulness, accuracy,
            or reliability of any User Content.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Artificial Intelligence Features</h2>
          <p className="mb-4">
            EduFolio may provide artificial intelligence ("AI") tools and features to assist with content creation, essay writing,
            portfolio optimization, and other functions. With respect to these AI features:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>You understand that AI outputs are generated algorithmically and may not always be accurate, appropriate, or complete</li>
            <li>You are solely responsible for reviewing, editing, and ensuring the accuracy and appropriateness of any AI-generated content before using it</li>
            <li>You may not use our AI features to generate content that violates these Terms</li>
            <li>AI-generated content may be based on patterns learned from public data and other users' anonymized inputs</li>
            <li>We make no guarantees regarding the uniqueness or originality of AI-generated content</li>
            <li>We are not responsible for how AI-generated content is used after delivery to you</li>
            <li>We reserve the right to limit or restrict access to AI features at our discretion</li>
          </ul>
          <p>
            By using our AI features, you agree that we may anonymize and use your inputs to improve our AI systems and services. You acknowledge the
            inherent limitations of AI technology and accept responsibility for all content you create or submit using our AI tools.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
          <p className="mb-4">
            The Service and its original content (excluding User Content), features, functionality, design elements, and intellectual property
            are owned by EduFolio and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>
          <p className="mb-4">
            EduFolio grants you a limited, non-exclusive, non-transferable, and revocable license to use the Service solely for your
            personal, non-commercial use, subject to these Terms. This license does not include:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Modifying, reverse engineering, or creating derivative works of the Service or any part thereof</li>
            <li>Using any data mining, robots, or similar data gathering methods</li>
            <li>Removing any copyright, trademark, or other proprietary notices</li>
            <li>Framing or mirroring any part of the Service</li>
            <li>Using the Service for any commercial purpose without our consent</li>
            <li>Accessing the Service to build a similar or competitive product or service</li>
          </ul>
          <p>
            All trademarks, logos, service marks, and trade names displayed on the Service are either our property or used with permission.
            You may not use these marks without our prior written consent or the consent of the third party that owns the mark.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Third-Party Services and Links</h2>
          <p className="mb-4">
            The Service may contain links to third-party websites or services that are not owned or controlled by EduFolio.
            We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any
            third-party websites or services.
          </p>
          <p className="mb-4">
            We may integrate with third-party services to provide certain features. Your use of these integrated services is subject
            to the terms and conditions of those services. We are not responsible for any actions or policies of integrated third-party services.
          </p>
          <p>
            You acknowledge and agree that EduFolio shall not be responsible or liable, directly or indirectly, for any damage or
            loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or
            services available on or through any such websites or services.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
          <p className="mb-4">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL EDUFOLIO, ITS AFFILIATES, DIRECTORS, EMPLOYEES, AGENTS,
            PARTNERS, SUPPLIERS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
            INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Your access to or use of or inability to access or use the Service</li>
            <li>Any conduct or content of any third party on the Service</li>
            <li>Any content obtained from the Service</li>
            <li>Unauthorized access, use, or alteration of your transmissions or content</li>
            <li>Bugs, viruses, trojan horses, or the like that may be transmitted to or through the Service</li>
            <li>Errors or omissions in any content or for any loss or damage of any kind incurred as a result of your use of any content</li>
            <li>The use or inability to use any AI-generated content</li>
          </ul>
          <p className="mb-4">
            IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS EXCEED THE AMOUNT PAID BY YOU, IF ANY, FOR USING OUR SERVICES
            DURING THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE LIABILITY.
          </p>
          <p>
            SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR THE LIMITATION OR EXCLUSION OF LIABILITY
            FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES. ACCORDINGLY, SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Disclaimers</h2>
          <p className="mb-4">
            THE SERVICE AND ITS CONTENT ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED,
            INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT,
            OR COURSE OF PERFORMANCE.
          </p>
          <p className="mb-4">
            EDUFOLIO DOES NOT WARRANT THAT: (1) THE SERVICE WILL FUNCTION UNINTERRUPTED, SECURE, OR AVAILABLE AT ANY PARTICULAR TIME OR LOCATION;
            (2) ANY ERRORS OR DEFECTS WILL BE CORRECTED; (3) THE SERVICE IS FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS; OR (4) THE RESULTS
            OF USING THE SERVICE WILL MEET YOUR REQUIREMENTS.
          </p>
          <p className="mb-4">
            WE DO NOT GUARANTEE THE EFFECTIVENESS OF THE SERVICE FOR ANY PARTICULAR PURPOSE, INCLUDING BUT NOT LIMITED TO COLLEGE ADMISSIONS,
            JOB APPLICATIONS, OR ACADEMIC SUCCESS. ANY ADVICE OR INFORMATION, WHETHER ORAL OR WRITTEN, OBTAINED FROM EDUFOLIO OR THROUGH
            THE SERVICE, SHALL NOT CREATE ANY WARRANTY NOT EXPRESSLY MADE HEREIN.
          </p>
          <p>
            EDUFOLIO SPECIFICALLY DISCLAIMS ANY LIABILITY FOR AI-GENERATED CONTENT. WE DO NOT GUARANTEE THE ACCURACY, QUALITY, EFFECTIVENESS,
            OR APPROPRIATENESS OF ANY AI-GENERATED CONTENT FOR YOUR SPECIFIC NEEDS OR PURPOSES.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless EduFolio, its affiliates, directors, employees, agents, partners, suppliers,
            and licensors from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses
            (including but not limited to attorney's fees) arising from: (1) your use of the Service; (2) your violation of these Terms;
            (3) your violation of any third-party right, including without limitation any intellectual property right, publicity,
            confidentiality, property, or privacy right; (4) your User Content; or (5) any claim that your User Content caused damage to a third party.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
          <p className="mb-4">
            We may terminate or suspend your account and access to the Service immediately, without prior notice or liability,
            for any reason, including, but not limited to, breach of these Terms. Upon termination, your right to use the Service will immediately cease.
          </p>
          <p>
            All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation,
            ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
          <p className="mb-4">
            These Terms shall be governed by and construed in accordance with the laws of the State of California, United States,
            without regard to its conflict of law provisions. You agree to submit to the personal and exclusive jurisdiction
            of the courts located in California for the resolution of any disputes.
          </p>
          <p>
            You agree that any claim or cause of action arising out of or related to the Service or these Terms must be filed within
            one (1) year after such claim or cause of action arose, or be forever barred.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Dispute Resolution</h2>
          <p className="mb-4">
            Any dispute, controversy, or claim arising out of or relating to these Terms or the Service shall be settled by binding
            arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall be conducted
            in California and judgment on the arbitration award may be entered in any court having jurisdiction thereof.
          </p>
          <p className="mb-4">
            YOU UNDERSTAND THAT BY AGREEING TO THIS SECTION, YOU WAIVE YOUR RIGHT TO RESOLVE DISPUTES THROUGH A JUDGE OR JURY
            AND AGREE INSTEAD TO THE USE OF ARBITRATION.
          </p>
          <p>
            Notwithstanding the foregoing, EduFolio may seek injunctive or other equitable relief to protect its intellectual property
            rights in any court of competent jurisdiction.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">14. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. We will provide notice of any significant changes by
            posting the new Terms on this page, sending you an email, or through an in-app notification. Your continued use of the Service after
            any such changes constitutes your acceptance of the new Terms. You are responsible for reviewing the Terms periodically for changes.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">15. General Terms</h2>
          <p className="mb-4">
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of such right or provision.
            If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions will remain in full force and effect.
          </p>
          <p className="mb-4">
            These Terms, together with our Privacy Policy, constitute the entire agreement between you and EduFolio regarding our Service
            and supersede all prior agreements and understandings, whether written or oral.
          </p>
          <p>
            You may not assign or transfer these Terms, by operation of law or otherwise, without our prior written consent.
            We may assign or transfer these Terms, in our sole discretion, without restriction.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">16. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
            <a href="mailto:legal@edufolio.com" className="text-primary hover:underline ml-1">legal@edufolio.com</a>
          </p>
        </section>
      </div>
    </div>
  )
} 