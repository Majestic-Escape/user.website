export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen font-poppins pt-0 md:pt-20">
      <header className="bg-offWhite pt-16 md:pt-0 shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold font-bricolage text-absoluteDark">
            Privacy Policy
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-stone">
            Last updated: June 1, 2024
          </p>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-semibold text-primary">
                  Our Commitment to Your Privacy
                </h2>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Information Collection
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      We collect information you provide when you create an
                      account, subscribe to our newsletter, or contact us for
                      support.
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Third party service
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      To verify host identity and GST details, our platform uses
                      third-party verification services, including Digitap, a
                      government-authorized data verification provider. By
                      submitting your documents and GST information, you
                      explicitly consent to the sharing of this data with such
                      third-party services solely for verification and
                      compliance purposes.
                    </dd>
                  </div>

                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Use of Information
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      We use the information we collect to provide, maintain,
                      and improve our services, to develop new ones, and to
                      protect our company and our users.
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Information Sharing
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      We do not share personal information with companies,
                      organizations, or individuals outside of our company
                      except in the following cases: with your consent, for
                      legal reasons, or to protect rights, property or safety.
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Data Security
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      We work hard to protect our users from unauthorized access
                      on our platform or unauthorized alteration, disclosure or
                      destruction of information we hold.
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Your Rights
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      Depending on your location, you may have certain rights
                      regarding your personal information, such as the right to
                      access, correct, or delete your data.
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-semibold text-primary">
                  Contact Us
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  If you have any questions about this Privacy Policy, please
                  contact us.
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-primary sm:mt-0 sm:col-span-2">
                      {" "}
                      <a
                        className="underline"
                        href="mailto:support@majesticescape.in"
                      >
                        support@majesticescape.in
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
