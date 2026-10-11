import { Info } from "lucide-react";

// The Gujarat rules have not been published yet.  This page used to be a copy
// of the Goa rules, which is wrong for Gujarat hosts, so it only shows a
// neutral notice until the real rules are available.
export default function GujaratRules() {
  return (
    <div className="min-h-screen font-poppins pt-24">
      <header className="bg-offWhite shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold font-bricolage text-absoluteDark">
            Local Gujarat Rules and Regulation Policy
          </h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div
              role="note"
              className="flex items-start gap-3 rounded-2xl border border-primaryGreen/20 bg-primaryGreen/5 p-5 sm:p-6 animate-in fade-in-0 duration-300 motion-reduce:animate-none"
            >
              <Info
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-primaryGreen"
              />
              <div>
                <h2 className="text-lg leading-6 font-semibold text-primaryGreen">
                  Gujarat hosting rules
                </h2>
                <p className="mt-2 max-w-2xl text-base text-absoluteDark">
                  We haven&apos;t published the local hosting rules for Gujarat
                  on this page yet. If you host in Gujarat and have questions
                  about local registration or permits, please contact us at{" "}
                  <a
                    href="mailto:info@majesticescape.in"
                    className="font-medium text-primaryGreen underline underline-offset-2 hover:text-brightGreen"
                  >
                    info@majesticescape.in
                  </a>{" "}
                  and we&apos;ll help.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
