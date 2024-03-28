import React from "react";
import { NavLink } from "react-router-dom";

const Footer = () => {
  return (
    <div className="flex justify-end mt-5 mb-4 mx-10 bottom-0 text-sm fixed right-0">
      <div className="lg:flex space-x-4 hidden ">
        {/* Data Privacy and Imprint links */}
        <NavLink to="/data-privacy" className="hidden lg:block">
          Data Privacy
        </NavLink>
        <NavLink to="/imprint" className="hidden lg:block">
          Imprint
        </NavLink>
      </div>
    </div>
  );
};

export default Footer;









