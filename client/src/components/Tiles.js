import React from "react";
import SingleTile from "./SingleTile";
import Info from "./Info";



const Tiles = ({ podcasts, onTileClicked, selectedPodcast, setSelectedPodcast}) => {

  const handleClick = (podcast) => {
    setSelectedPodcast(podcast);
    onTileClicked(podcast);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 m-10 pb-20">
        {podcasts && podcasts.map((podcast, index) => (
          <div key={index}>
            <SingleTile key={index} podcast={podcast} onClick={handleClick} setSelectedPodcast={setSelectedPodcast} />
          </div>
        ))}
        {selectedPodcast && <Info podcast={selectedPodcast} />}
      </div>
    </div>
  );
};


export default Tiles;

 // {
          //   console.log("Item image:", item.image);
          //   return (
          //     <NavLink
          //       to={{
          //         pathname: `/${encodeURIComponent(item.name)}`,
          //         state: { podcastData: item },
          //       }}
          //       key={item.id}
          //     >
          //       <div
          //         key={item.id}
          //         className={`relative block group w-full h-full aspect-square tile-animation delay-${index}`}
          //         // className="relative block group w-full h-full aspect-square"
          //       >
          //         <img
          //           alt={item.name}
          //           src={item.picture.normal}
          //           className={`h-full w-full group-hover:opacity-50 inset-0 object-cover absolute cursor-pointer`}
          //           title={item.name}
          //         />
          //         <div className="absolute bottom-0 left-0 w-full h-1/3 transition-all transform translate-y-8 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 bg-[#161414] border-white ">
          //           <p className="text-white p-2 text-2xl font-bold">
          //             {item.name}
          //           </p>
          //         </div>
          //       </div>
          //     </NavLink>
          //   );
          // }
          // )}