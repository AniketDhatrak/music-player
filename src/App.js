import "./App.css";
import { useContext, useEffect, useState } from "react";
import Card from "./components/Card";
import CreatePlaylist from "./components/CreatePlaylist";
import { initializePlaylist } from "./initialize";
import Navbar from "./components/Navbar";
import { MusicContext } from "./Context";

function App() {
  const [keyword, setKeyword] = useState("");
  const [message, setMessage] = useState("");
  const [tracks, setTracks] = useState([]);
  const [token, setToken] = useState(null);

  const musicContext = useContext(MusicContext);
  const isLoading = musicContext.isLoading;
  const setIsLoading = musicContext.setIsLoading;
  const setLikedMusic = musicContext.setLikedMusic;
  const setPinnedMusic = musicContext.setPinnedMusic;
  const resultOffset = musicContext.resultOffset;
  const setResultOffset = musicContext.setResultOffset;

  const fetchMusicData = async (searchKeyword) => {
    setTracks([]);
    window.scrollTo(0, 0);
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${searchKeyword}&type=track&offset=${resultOffset}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch music data");
      }

      const jsonData = await response.json();

      setTracks(jsonData.tracks.items);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      setResultOffset(0);
      fetchMusicData(keyword);
    }
  };

  useEffect(() => {
    initializePlaylist();

    const fetchToken = async () => {
      try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "grant_type=client_credentials&client_id=a77073181b7d48eb90003e3bb94ff88a&client_secret=68790982a0554d1a83427e061e371507",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch token");
        }

        const jsonData = await response.json();
        setToken(jsonData.access_token);

        // Fetch initial music data with a default keyword (e.g., "Top Hits")
        fetchMusicData("Top Hits");
      } catch (error) {
        setMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchToken();
    setLikedMusic(JSON.parse(localStorage.getItem("likedMusic")));
    setPinnedMusic(JSON.parse(localStorage.getItem("pinnedMusic")));
  }, [setIsLoading, setLikedMusic, setPinnedMusic]);

  return (
    <>
      <Navbar
        keyword={keyword}
        setKeyword={setKeyword}
        handleKeyPress={handleKeyPress}
        fetchMusicData={() => fetchMusicData(keyword)}
      />

      <div className="container">
        <div className={`row ${isLoading ? "" : "d-none"}`}>
          <div className="col-12 py-5 text-center">
            <div
              className="spinner-border"
              style={{ width: "3rem", height: "3rem" }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
        <div className="row">
          {tracks.map((element) => {
            return <Card key={element.id} element={element} />;
          })}
        </div>
        <div className="row justify-content-center" hidden={tracks.length === 0}>
          <div className="col-auto">
            <button
              onClick={() => {
                setResultOffset((previous) => previous - 20);
                fetchMusicData(keyword);
              }}
              className="btn btn-outline-info"
              disabled={resultOffset === 0}
            >
              Previous Page: {resultOffset / 20}
            </button>
          </div>
          <div className="col-auto">
            <button
              onClick={() => {
                setResultOffset((previous) => previous + 20);
                fetchMusicData(keyword);
              }}
              className="btn btn-outline-info"
            >
              Next Page: {resultOffset / 20 + 2}
            </button>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <h4 className="text-center text-danger py-2">{message}</h4>
          </div>
        </div>
        <div className="row">
          <div className="col-12 py-5 text-center">
            <h1>
              <i className="bi bi-music-note-list mx-3"></i>
              React Music
            </h1>
            {/* <h3 className="py-5">Search music to listen</h3> */}
          </div>
        </div>
      </div>
      <div
        className="modal fade position-absolute"
        id="exampleModal"
        tabIndex={-1}
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <CreatePlaylist />
      </div>
    </>
  );
}

export default App;
