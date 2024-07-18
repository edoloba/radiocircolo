import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AiOutlinePlayCircle
} from "react-icons/ai";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import axios from "axios";

const Info = ({  podcasts, setMostRecentPodcast, setSelectedPodcast }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [tracklist, setTracklist] = useState([]);
  const [members, setMembers] = useState([]);
  const [linkName, setLinkName] = useState("");
  const [link, setLink] = useState("");
  const [podcastPicture, setPodcastPicture] = useState("");
  const [podcastAudio, setPodcastAudio] = useState("");
  const [podcastInfo, setPodcastInfo] = useState(null)
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);  
  const [enlarged, setEnlarged] = useState(false);

  const toggleEnlarged = () => {
    setEnlarged(!enlarged);
  };

  useEffect(() => {
    const fetchPodcastDetails = async () => {
      try {
      // const response = await axios.get(`http://localhost:5001/${slug}`);
      const response = await axios.get(`https://radiocircolo.onrender.com/${slug}`);
      const podcastData = response.data;
      setPodcastInfo(podcastData);
      setDescription(podcastData.description || "");
      setTracklist(podcastData.trackList || []);
      setMembers(podcastData.members || []);
      setLinkName(podcastData.linkName || "");
      setLink(podcastData.link || "");
       // For picture and audio, access them directly from the fetched data
       const { picture, audio } = podcastData;
       setPodcastPicture(picture);
       setPodcastAudio(audio);
       console.log("Podcast picture set to:", picture);
    } catch (error) {
      console.error("Error fetching podcast details:", error);
      setError(error.message);
    }
  }
    
    fetchPodcastDetails();
  }, [slug]);

  const handlePlayPodcast = async (selectedPodcast) => {
    if (selectedPodcast) {
      try {
        setIsPlaying(!isPlaying);
        setMostRecentPodcast(selectedPodcast);
        setSelectedPodcast(selectedPodcast);
      } catch (error) {
        console.error("Error fetching podcast details:", error);
      }
    } else {
      console.error("Error: Podcast object or audio URL is null");
    }
  };

  // Function to handle navigation to the next podcast
  const handleNextPodcast = () => {
    const currentIndex = podcasts.findIndex((p) => p.slug === slug);
    const nextIndex = (currentIndex + 1) % podcasts.length;
    navigate(`/${encodeURIComponent(podcasts[nextIndex]?.slug)}`);
  };

  // Function to handle navigation to the previous podcast
  const handlePreviousPodcast = () => {
    const currentIndex = podcasts.findIndex((p) => p.slug === slug);
    const previousIndex = (currentIndex - 1 + podcasts.length) % podcasts.length;
    navigate(`/${encodeURIComponent(podcasts[previousIndex]?.slug)}`);
  };


  // Helper function to preprocess the description string and insert <br/> between paragraphs
  const preprocessDescription = (desc) => {
    return desc.split("\n").map((paragraph, index) => (
      <React.Fragment key={index}>
        {paragraph}
        <p className="pb-3"></p>
      </React.Fragment>
    ));
  };

  if (!podcastInfo) {
    return <div></div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div key={podcastInfo.key} className="mt-5 mx-4 md:mx-0">
      <div className="flex flex-col lg:flex-row justify-between">
        <img
          src={podcastPicture.extra_large}
          alt={podcastInfo.name}
          className={`ml-0 md:mx-10 cursor-pointer ${enlarged ? 'hidden' : ''}`}
          onClick={toggleEnlarged}
        />
        <div className="flex flex-col justify-end md:items-end">
          <div className="ml-0 mr-0 md:ml-10 mt-2 md:mr-10 flex justify-between">
            {podcasts.findIndex((p) => p.slug === slug) > 0 && (
                <BsArrowLeft
                  className="h-8 w-6 md:h-12 md:w-8 text-3xl text-white cursor-pointer mr-5"
                  onClick={handlePreviousPodcast}
                />
            )}
            {podcasts.findIndex((p) => p.slug === slug) < podcasts.length - 1 && (
                <BsArrowRight
                  className="h-8 w-6 md:h-12 md:w-8 text-3xl text-white cursor-pointer ml-5"
                  onClick={handleNextPodcast}
                />
            )}
          </div>
        </div>
      </div>
      
          <div className="flex ml-0 md:ml-10 mt-5 md:mt-2 justify-start items-center">
            <AiOutlinePlayCircle
              cursor={"pointer"}
              className="h-12 w-12 md:h-16 md:w-16 text-white"
              onClick={() => handlePlayPodcast(podcastAudio)} 
            />
            <p className="text-xl xs:text-2xl md:text-3xl font-bold ml-3">
              {podcastInfo.name}
            </p>
          </div>

          <div
            className={`w-full md:w-3/4 ml-0 md:ml-10 mt-5 ${
              !tracklist.length && !members.length ? "pb-20" : ""
            }`}
          >
            {link && link.length > 0 && (
              <>
                {link.map((item, index) => (
                  <a
                    key={index}
                    href={item}
                    target="_blank"
                    rel="noreferrer"
                    className="mr-2 font-bold"
                  >
                    {linkName[index]}
                  </a>
                ))}
              </>
            )}
            {description && (
              <div className="mt-5 w-full xl:w-3/4">
                {description && preprocessDescription(description)}
              </div>
            )}
          </div>

          {tracklist && tracklist.length > 0 && (
            <div className="ml-0 md:ml-10 mt-5 pb-20">
              <p className="mb-2 font-bold">Tracklist</p>
              {tracklist.map((track, index) => (
                <p key={index}>{track}</p>
              ))}
            </div>
          )}

          {members && members.length > 0 && (
            <div className="ml-0 md:ml-10 mt-5 pb-20">
              <p className="mb-2">Members:</p>
              {members.map((member, index) => (
                <p key={index}>{member}</p>
              ))}
            </div>
          )}
         {enlarged && (
      <div className="fixed top-0 left-0 z-50 w-full h-full flex justify-center items-center bg-black" onClick={toggleEnlarged}>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <img
            src={podcastPicture.extra_large}
            alt={podcastInfo.name}
            className="max-w-full max-h-full cursor-pointer"
          />
        </div>
      </div>
    )}
    </div>
  ) ;
};

export default Info;


// useEffect(() => {
  //   const fetchPodcastDetails = async () => {
  //     try {
  //       const response = await axios.get(`http://localhost:5001/${slug}`);
  //       const podcastData = response.data;
  //       const mixcloudResponse = await axios.get(
  //         `https://api.mixcloud.com/radiocircolo/${slug}`
  //       );
  //       const mixcloudData = mixcloudResponse.data;
        
  //     console.log("Mixcloud Audio:", mixcloudData.url);
      
    
  //       // Update the podcast object with Mixcloud data
  //       podcastData.picture = mixcloudData.pictures.extra_large;
  //       podcastData.audio = mixcloudData.url;
  //       console.log("podcastData.audio", podcastData.audio);
  //       // setMostRecentPodcast(podcastData.audio);

  //       setPodcastInfo(podcastData);
  //       setDescription(podcastData.description || "");
  //       setTracklist(podcastData.trackList || []);
  //       setMembers(podcastData.members || []);
  //       setLinkName(podcastData.linkName || "");
  //       setLink(podcastData.link || "");
  //       // }
  //     } catch (error) {
  //       console.error("Error fetching podcast details:", error);
  //       setError(error.message);
  //     }
  //   };
  
  //   fetchPodcastDetails();
  // }, [slug]);

  // Function to handle playing the selected podcast
  // const handlePlayPodcast = (podcast) => {
  //   if (podcast && podcast.audio ) {
  //     setIsPlaying(!isPlaying);
  //     setMostRecentPodcast(podcast.audio);
  
  //     // Update the widget iframe here
  //     const widgetIframe = document.getElementById("mixcloudWidget");
  //     if (widgetIframe) {
  //       widgetIframe.src = `https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&autoplay==1&mute=1&feed=${encodeURIComponent(podcast.audio)}`;
  //     }
  //   } else {
  //     console.error("Error: Podcast object or audio URL is null");
  //   }
  // };

   // useEffect(() => {
  //   const fetchPodcastDetails = async () => {
  //     try {
  //       // Find the podcast in the combined data fetched in App.js
  //       const matchingPodcast = podcasts.find((p) => p.slug === slug);
  //       if (!matchingPodcast) {
  //         throw new Error("Podcast not found");
  //       }

  //       // Set the podcast info from the combined data
  //       setPodcastInfo(matchingPodcast);

  //       // Set the most recent podcast to the URL of the current podcast
  //       setMostRecentPodcast(matchingPodcast.audio);
  //       setSelectedPodcast(matchingPodcast);
  //     } catch (error) {
  //       console.error("Error fetching podcast details:", error);
  //       setError(error.message);
  //     }
  //   };

  //   fetchPodcastDetails();
  // }, [slug, podcasts, setMostRecentPodcast, setSelectedPodcast]);