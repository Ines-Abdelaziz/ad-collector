import { useState } from 'react';
interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const CheckboxOne = ({ checked, onChange }: CheckboxProps) => {
  const [modalOpen, setModalOpen] = useState(false);
 

  return (
    <div>
      <label
        htmlFor="checkboxLabelOne"
        className="flex cursor-pointer select-none items-start"
      >
        <div className="relative">
        <input
            type="checkbox"
            id="checkboxLabelOne"
            className="sr-only"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
          />
          <div
            className={`mr-4 flex h-5 w-5 items-center justify-center rounded border ${
              checked && 'border-primary bg-gray dark:bg-transparent'
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-sm ${checked && 'bg-primary'}`}
            ></span>
          </div>
        </div> 
        <span className="text-sm">
          I have read and agree to the <a href="#"
        onClick={(e) => {
          e.preventDefault(); // Prevent default link behavior
          setModalOpen(true); // Open the modal
        }} className='text-primary' >Privacy Policy</a>
        </span>
          
        
      </label>
         {/* Modal */}
         {modalOpen && (
        <div
          className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5"
          role="dialog"
          onClick={() => setModalOpen(false)} // Close modal when clicking the overlay
        >
          <div
            className="w-full max-w-md rounded-lg bg-white px-8 py-12 text-left overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
          >
            <div className="flex flex-col items-center">
            <h3 className="pb-2 text-xl font-bold text-black  text-center">Privacy Policy</h3>
            <span className="mx-auto mb-6 inline-block h-1 w-22.5 rounded bg-primary "></span>
            </div>
            <p className="mb-4 font-medium">
              LIX and CNRS are very attentive and vigilant regarding personal data protection (DCP) issues. CNRS has appointed a Data Protection Officer (DPO) to ensure that labs such as LIX comply with the European General Data Protection Regulation (GDPR).
            </p>
            <h4 className="mb-2 text-lg font-bold text-black dark:text-white">
              Data Collection
            </h4>
            <p className="mb-4 font-medium">
              We collect data related to advertisements the user receives on YouTube by watching videos on this platform. This includes:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li>Information about the ads users see when watching YouTube, including Video ads and Cards ads.</li>
              <li>Details such as advertisement video ID, advertiser's links, and any information concerning their YouTube channel, if available.</li>
              <li>The link to the service/product offered by the ads and the date/time when the ad appeared.</li>
              <li>Reasons for which an advertisement is sent to a user and the user's behavior towards the advertisement, including if the user has skipped or clicked the advertisement.</li>
              <li>Information from the Google Ad Preference Page that presents what the platform has inferred about the user.</li>
              <li>Details about the videos the user views including URL, title, description, tags, views, and details about the YouTube channel.</li>
              <li>The user's interaction with YouTube, whether logged into a Gmail account or using YouTube without an account, and the user's country.</li>
            </ul>
            <h4 className="mb-2 text-lg font-bold text-black dark:text-white">
              Special Category Data
            </h4>
            <p className="mb-4 font-medium">
              Data collected might reveal sensitive information relating to a user's racial or ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, health, criminal convictions, sex life or sexual orientation, or genetic or biometric data.
            </p>
            <h4 className="mb-2 text-lg font-bold text-black dark:text-white">
              Data Security and Access
            </h4>
            <p className="mb-4 font-medium">
              The collected data will be stored on a dedicated secured server and provided to academic researchers upon justified request. Access will be granted through an authentication process once their request is validated.
            </p>
            <p className="mb-4 font-medium">
              In accordance with Article 13 of the GDPR, the representative of the data controller is the director of the LIX lab, Mr. Gilles Schaeffer.
            </p>
            <p className="font-medium">
              For more details, please visit the official GDPR regulation page.
              <a
                href="https://eur-lex.europa.eu/eli/reg/2016/679/oj"
                className="text-primary underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                EU GDPR Information
              </a>
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded border border-gray-300 bg-gray-200 px-4 py-2 font-medium text-gray-800 hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckboxOne;
