import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
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
        // const mixcloudResponse = await axios.get("http://localhost:5001/");
        const mixcloudResponse = await axios.get("https://radiocircolo.onrender.com");
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

  useEffect(() => {
    // Add event listener for beforeunload
    const handleBeforeUnload = (event) => {
      // Check if audio is playing
      if (mostRecentPodcast !== null) {
        // Prevent default behavior of the event
        event.preventDefault();
        // Chrome requires returnValue to be set
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [mostRecentPodcast]);

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
            <div className="fixed bottom-0 mx-10 w-[100%] xs:w-3/4">
              {/* ml-0 xs:ml-4  */}
            
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
          )}
        </div>
      </div>
    </Router>
  );
}

export default App;
