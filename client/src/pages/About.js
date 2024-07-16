import React from "react";
import { AiOutlineInstagram, AiOutlineFacebook,AiOutlineMail } from "react-icons/ai";


const About = () => {
  return (
    <div className="mx-10 mt-5 max-h-screen">
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
        <div className="w-full lg:w-[60%]">
          <p className="mt-20 text-lg font-bold text-center">Travel through Sound</p>
          <br></br>
          <p className="text-xl text-center">
          Radiocircolo is a cosmic collective shaped through extended navigations in sound and space. <br/> We believe in music as unity, a shared dimension of aggregation and discovery in a non-ordinary reality.
          </p>

          <ul className="flex space-x-4 mt-20 justify-center">
            <li>
              <a
                href="https://www.instagram.com/_radiocircolo/"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                <AiOutlineInstagram />
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/radiocircolo/"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                <AiOutlineFacebook />
              </a>
            </li>
            <li>
              <a
                href="mailto:info@radiocircolo.com"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                <AiOutlineMail />
              </a>
            </li>
          </ul>
        </div>
        {/* <div>
      <p className="mt-20 text-lg font-bold">Collective</p>
      <br></br>
      <p className="text-lg">
        Radiocircolo is a cosmic multidisciplinary collective based in Rome and
        Berlin. <br></br>We believe in music as unity, a form of artistic
        resistance vehicle of aggregation <br></br>and discovery in a
        non-ordinary reality.
      </p>
      <ul className="flex space-x-4 mt-10 mb-20 lg:mb-0">
     
              <li className="uppercase">
                <a href="https://soundcloud.com/edolov/sets/shoes-off-w-planatia-radio-alhara" target="_blank" rel="noreferrer">Shoes Off -  Radio AlHara</a>
              </li>
      </ul>
      </div> */}
      </div>
    </div>
  );
};

export default About;
