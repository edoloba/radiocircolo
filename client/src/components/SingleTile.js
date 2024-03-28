import React from "react";
import { NavLink } from "react-router-dom";

const SingleTile = ({ podcast, setSelectedPodcast, onClick}) => {
    const handleClick = () => {
      onClick(podcast);
      setSelectedPodcast(podcast);
    };
   
  return (
    <NavLink to={`/${podcast.slug}`} onClick={handleClick}>
      <div className="relative block group w-full h-full aspect-square">
        <img
          alt={podcast.name}
          src={podcast.picture.normal}
          className="h-full w-full group-hover:opacity-50 inset-0 object-cover absolute cursor-pointer"
          title={podcast.name}
        />
        <div className="absolute bottom-0 left-0 w-full h-1/3 transition-all transform translate-y-8 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 bg-[#161414] border-white ">
          <p className="text-white p-2 text-2xl font-bold">{podcast.name}</p>
        </div>
      </div>
    </NavLink>
  );
};

export default SingleTile;