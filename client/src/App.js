import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Tiles from "./components/Tiles";
import Info from "./components/Info";
import About from "./pages/About";
import CookieConsent from "react-cookie-consent";
import axios from "axios";
import DataPrivacy from "./pages/DataPrivacy";
import Imprint from "./pages/Imprint";

function App() {
  const [podcasts, setPodcasts] = useState([]);
  const [mostRecentPodcast, setMostRecentPodcast] = useState(null);
  const [selectedPodcast, setSelectedPodcast] = useState(null);
  const [filteredPodcasts, setFilteredPodcasts] = useState([]);

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        // Fetch data from the backend endpoint
        const mixcloudResponse = await axios.get("http://localhost:5001/");
        const data = mixcloudResponse.data;

        // Set the combined data in state
        setPodcasts(data);

        // Set the most recent podcast to the URL of the first podcast
        if (data.length > 0) {
          setMostRecentPodcast(data[0].audio);
        }
      } catch (error) {
        console.error("Error fetching podcasts:", error);
      }
    };

    fetchPodcasts();
  }, []);

  const handleTileClick = (podcast) => {
    setSelectedPodcast(podcast);
  };

  const handleSearch = (searchTerm) => {
    const filtered = podcasts.filter((podcast) =>
      podcast.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPodcasts(filtered);
  };

  return (
    <Router basename="/">
      <div className="flex flex-col h-screen">
        <Navbar onSearch={handleSearch}/>
        <div className="flex-grow overflow-y-auto">
          {/* Cookie Consent Banner */}
          <CookieConsent
            location="bottom"
            buttonText="I Accept"
            cookieName="myCookieConsent"
            style={{ background: "#2B373B" }}
            buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
            expires={150}
          >
            This website uses cookies to enhance the user experience.{" "}
            <span style={{ fontSize: "10px" }}>
              For more information, read our{" "}
              <a href="/privacy-policy" style={{ color: "#e66767" }}>
                Privacy Policy
              </a>
              .
            </span>
          </CookieConsent>
          {/* End of Cookie Consent Banner */}
          <div className="flex flex-col flex-grow-1">
            <Routes>
              {/* Homepage with list of podcasts */}
              <Route
                path="/"
                element={
                  <Tiles
                  podcasts={filteredPodcasts.length ? filteredPodcasts : podcasts}
                    onTileClicked={handleTileClick}
                    selectedPodcast={selectedPodcast}
                    setSelectedPodcast={setSelectedPodcast}
                  />
                }
              />
              <Route path="/about" element={<About />} />
              <Route path="/data-privacy" element={<DataPrivacy />} />
              <Route path="/imprint" element={<Imprint />} />
              {/* Podcast information page */}
              <Route
                path="/:slug"
                element={
                  <Info
                    podcast={selectedPodcast}
                    podcasts={podcasts}
                    setMostRecentPodcast={setMostRecentPodcast}
                    setSelectedPodcast={setSelectedPodcast}
                  />
                }
              />
            </Routes>
          </div>
          {/* Add the audio element for the most recent podcast */}
          {mostRecentPodcast && (
            <div className="fixed bottom-0 ml-0 xs:ml-4 md:ml-10 w-full xs:w-3/4">
              <div className="container">
                <iframe
                  title="Mixcloud Player"
                  width="100%"
                  height="60"
                  src={`https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&autoplay==1&mute=1&feed=${encodeURIComponent(
                    mostRecentPodcast
                  )}`}
                  frameBorder="0"
                />
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

// Fetch podcasts from Mixcloud API
// useEffect(() => {
//   const fetchPodcasts = async () => {
//     try {
//       // Replace 'YOUR_MIXCLOUD_USERNAME' with your actual Mixcloud username
//       const username = process.env.REACT_APP_MIXCLOUD_USERNAME;
//       const clientID = process.env.REACT_APP_MIXCLOUD_CLIENT_ID;
//       const response = await axios.get(
//         `https://api.mixcloud.com/${username}/cloudcasts/?limit=100&client_id=${clientID}`
//       );

//       console.log("response", response);

//        // Combine data from Mixcloud and static JSON
//     const combinedPodcasts = response.data.data.map((mixcloudPodcast) => {
//       const staticPodcast = podcastsData.find(
//         (podcast) => podcast.id === mixcloudPodcast.key
//       );
//       return { ...mixcloudPodcast, ...staticPodcast };
//     });

//     // Sort the combined podcasts by date in descending order
//     const sortedPodcasts = combinedPodcasts.sort((a, b) => {
//       const dateA = new Date(a.created_time);
//       const dateB = new Date(b.created_time);
//       return dateB - dateA;
//     });

//       setPodcasts(sortedPodcasts);
//       // Set the URL of the most recent podcast
//       if (sortedPodcasts.length > 0) {
//         setMostRecentPodcast(sortedPodcasts[0].url);
//       }
//     } catch (error) {
//       console.error("Error fetching podcasts:", error);
//     }
//   };

//   fetchPodcasts();
// }, []);
