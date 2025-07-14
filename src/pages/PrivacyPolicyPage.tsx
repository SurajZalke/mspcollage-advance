import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import BackgroundContainer from '@/components/BackgroundContainer';
import Logo from '@/components/Logo';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <BackgroundContainer className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Privacy Policy - MSP College Advance</title>
        <meta name="description" content="Privacy Policy for MSP College Advance, outlining data collection, usage, and protection." />
      </Helmet>

      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 md:p-12 lg:p-16 relative z-10">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 dark:text-white mb-8">
          Privacy Policy
        </h1>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">1. Introduction</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Welcome to MSP College Advance. We are committed to protecting your privacy and handling your data in an open and transparent manner. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <Link to="/" className="text-indigo-600 hover:underline">mspcollage.com</Link>, including any other media form, media channel, mobile website, or mobile application related or connected thereto (collectively, the “Site”). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the Site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">2. Information We Collect</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            We may collect information about you in a variety of ways. The information we may collect on the Site includes:
          </p>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Personal Data</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site, such as online chat and message boards.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Derivative Data</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed space-y-2">
            <li>Create and manage your account.</li>
            <li>Email you regarding your account or order.</li>
            <li>Enable user-to-user communications.</li>
            <li>Generate a personal profile about you to make your visit to the Site more personalized.</li>
            <li>Increase the efficiency and operation of the Site.</li>
            <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
            <li>Notify you of updates to the Site.</li>
            <li>Perform other business activities as needed.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">4. Disclosure of Your Information</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
          </p>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">By Law or to Protect Rights</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, or safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Third-Party Service Providers</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            We may share your information with third parties that perform services for us or on our behalf, including data analysis, email delivery, hosting services, customer service, and marketing assistance.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">5. Security of Your Information</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">6. Contact Us</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:support@mspcollage.com" className="text-indigo-600 hover:underline">support@mspcollage.com</a>.
          </p>
        </section>

        <div className="text-center mt-12">
          <Link to="/" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105">
            Back to Home
          </Link>
        </div>
      </div>
    </BackgroundContainer>
  );
};

export default PrivacyPolicyPage;