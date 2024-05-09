import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../radiocircolologo.png";
import { BsSearch } from "react-icons/bs";

const Navbar = ({ onSearch }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [searchPodcast, setSearchPodcast] = useState("");
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleChange = (event) => {
    setSearchPodcast(event.target.value);
    onSearch(event.target.value); // Call the onSearch function passed from parent
    navigate("/");
  };

  return (
    <div className="flex justify-between items-center mt-10 mb-5 mx-10">
      <NavLink to="/">
        <img
          src={logo}
          alt="Radio Circolo Logo"
          className="h-16 w-16 mb-8"
          onClick={isNavOpen ? () => setIsNavOpen(false) : null}
        />
      </NavLink>
      <div className="flex search">
        <div className={isNavOpen ? "hidden" : "hidden xs:flex"}>
          <BsSearch className="mr-2 mt-2 text-xl" />{" "}
          {/* Adjust margin here as needed */}
          <input
            className="w-1/2 border-b-[#ffffffdd] border-b-2 px-3 bg-[#161414fd] text-[#ffffffdd] focus:outline-none"
            type="text"
            placeholder=""
            value={searchPodcast}
            onChange={handleChange}
          />
        </div>

        {/* <input type="text" value={searchQuery} onChange={handleSearch} /> */}
        <div className={`hamburger-menu ${isNavOpen ? "open" : ""}`}>
          <div className="hamburger-icon" onClick={toggleMenu}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
          <div className={`menu-overlay ${isNavOpen ? "open" : ""}`}>
            <div className="menu-items text-right" onClick={() => setIsNavOpen(false)}>
              {/* Insert your navigation links here */}
              <NavLink
                to="/about"
                className="text-md md:text-xl pt-10 font-bold"
              >
                About
              </NavLink>
              <a
                href="https://cashmereradio.com/shows/circles-in-space-by-radiocircolo/"
                target="_blank"
                rel="noreferrer"
                className="text-md md:text-xl font-bold"
              >
                Circles In Space
              </a>
              <a
                href="https://www.radioalhara.net/"
                target="_blank"
                rel="noreferrer"
                className="text-md md:text-xl font-bold"
              >
                Radio Alhara
              </a>
              <a
                href="https://cashmereradio.com"
                target="_blank"
                rel="noreferrer"
                className="text-md md:text-xl font-bold"
              >
                Cashmere Radio
              </a>
              <div className="flex text-[0.65rem] w-30 flex-grow-0 items-center">
                <NavLink to="/data-privacy" className="block">
                  Data Privacy
                </NavLink>
                <div className="px-2">|</div>
                <NavLink to="/imprint" className="block">
                  Imprint
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <NavLink to="/about" className='text-md md:text-xl pt-5 md:pt-0 font-bold'>About</NavLink> */}
    </div>
  );
};

export default Navbar;

//  {/* <nav>
//         <section className='MOBILE-MENU flex '>
//           <div
//           className='HAMBURGER-ICON space-y-2'
//           onClick={() => setIsNavOpen((prev) => !prev)}
//           >
//           <span className="hamburger-span"></span>
//             <span className="hamburger-span"></span>
//             <span className="hamburger-span"></span>
//           </div>
//           <div className={isNavOpen ? "showMenuNav" : "hideMenuNav"}>
//             <div
//             className='CROSS-ICON absolute top-0 right-0 px-8 py-8'
//             onClick={() => setIsNavOpen(false)}
//             >
//             <svg
//                 className="h-24 w-8"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <line x1="18" y1="6" x2="6" y2="18" />
//                 <line x1="6" y1="6" x2="18" y2="18" />
//               </svg>
//             </div>
//             <ul className="MENU-LINK-MOBILE-OPEN flex flex-col items-center justify-between min-h-[250px] font-bold">
//               <li className="my-8 uppercase">
//                 <NavLink to="/about" onClick={() => setIsNavOpen(false)}>About</NavLink>
//               </li>
//               <li className="my-8 uppercase">
//                 <NavLink to="/imprint" onClick={() => setIsNavOpen(false)}>Imprint</NavLink>
//               </li>
//               <li className="my-8 uppercase">
//                 <NavLink to="/data-privacy" onClick={() => setIsNavOpen(false)}>Data Privacy</NavLink>
//               </li>
//             </ul>
//           </div>
//         </section>
//       </nav> */}
