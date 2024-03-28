import React from "react";

const Imprint = () => {
  return (
    <div className="mx-10 mt-5 max-h-screen w-1/2">
      <h1 className="mt-20">Site Notice</h1>

      <h2 className="mt-10">
        Information pursuant to Sect. 5 German Telemedia Act (TMG)
      </h2>
      <div className="mt-5">
        <p>
          Pietro Platania
          <br />
          Via Luciano Manara, 43
          <br />
          00153 Roma
        </p>

        <h2 className="mt-5">Contact</h2>
        <p className="mt-2">E-mail: info.radiocircolo@gmail.com</p>
      </div>

      <div className="mt-10">
        <h2 className="">EU dispute resolution</h2>
        <p className="mt-2">
          The European Commission provides a platform for online dispute
          resolution (ODR): https://ec.europa.eu/consumers/odr/. <br/> Our e-mail
          address can be found above in the site notice. Dispute resolution
          proceedings in front of a consumer arbitration board. <br/> We are not
          willing or obliged to participate in dispute resolution proceedings in
          front of a consumer arbitration board.
        </p>
      </div>
      <a href="https://www.edoardolovino.com" target="_blank" rel="noreferrer">
        
      <p className="mt-10 pb-20">Website by Edoardo Lovino</p>
      </a>
    </div>
  );
};

export default Imprint;
