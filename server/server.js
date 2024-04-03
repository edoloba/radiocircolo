const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs").promises;
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5002;

const corsOption = {
  origin: "https://radiocircolo-front.onrender.com"
}

app.use(express.json());
app.use(cors(corsOption));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "./client/build")));

// Parse JSON bodies
app.use(bodyParser.json());

const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// Define API endpoint to fetch podcasts data
app.get("/", async (req, res) => {
  try {
    // Fetch podcasts data from Mixcloud API
    const username = process.env.MIXCLOUD_USERNAME;
    const clientID = process.env.MIXCLOUD_CLIENT_ID;
    const mixcloudResponse = await axios.get(
      `https://api.mixcloud.com/${username}/cloudcasts/?limit=100&client_id=${clientID}`
    );
    console.log("data", mixcloudResponse.data)


    // Extract relevant data from Mixcloud response
    const mixcloudPodcasts = mixcloudResponse.data.data.map(
      (mixcloudPodcast) => ({
        name: mixcloudPodcast.name,
        picture: {
          normal: mixcloudPodcast.pictures["1024wx1024h"],
          extra_large: mixcloudPodcast.pictures.extra_large,
        },
        audio: mixcloudPodcast.url,
        id: mixcloudPodcast.key,
        slug: mixcloudPodcast.slug,
      })
    );

    res.json(mixcloudPodcasts);
  } catch (error) {
    console.error("Error fetching podcasts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


const podcastSchema = new mongoose.Schema({
  slug: String,
  name: String,
  description: String,
  tracklist: Array,
  members: Array,
  linkName: Array,
  link: Array
});

const Podcast = mongoose.model('Podcast', podcastSchema);

app.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const username = process.env.MIXCLOUD_USERNAME;
    const clientID = process.env.MIXCLOUD_CLIENT_ID;
    
    // Fetch podcast data from Mixcloud API
    const mixcloudResponse = await axios.get(`https://api.mixcloud.com/${username}/cloudcasts/?limit=100&client_id=${clientID}`);
    const mixcloudPodcast = mixcloudResponse.data.data.find(podcast => podcast.slug === slug);
    
    
    // Fetch additional data from MongoDB
    const mongoPodcast = await Podcast.findOne({ slug });
    
    if (!mixcloudPodcast) {
      return res.status(404).json({ error: "Podcast not found" });
    }
    
    // Combine data from Mixcloud API and MongoDB
    const combinedPodcast = {
      name: mixcloudPodcast.name,
      picture: {
        normal: mixcloudPodcast.pictures["1024x1024"],
        extra_large: mixcloudPodcast.pictures.extra_large
      },
      audio: mixcloudPodcast.url,
      ...mongoPodcast._doc
    }
    console.log("doc", mongoPodcast._doc)
    
    res.json(combinedPodcast);
  } catch (error) {
    console.error("Error fetching podcast details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

console.log("Current working directory:", process.cwd());

// All other routes should serve the React app, except for /:slug routes
app.get("/^\/(?!\/\w+).*/", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

