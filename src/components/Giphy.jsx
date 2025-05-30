import React, { useEffect, useRef, useState } from "react";
import { Grid } from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";
import _ from "lodash";
const gf = new GiphyFetch("hOJ2C21sKprFvw6ocLv58dqYOacEzfF5");
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useDispatch } from "react-redux";
import { toggleGifModal } from "../redux/slices/app";

export default function Giphy() {
  const dispatch = useDispatch();
  const gridRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [gifs, setGifs] = useState([]); // To store the fetched GIFs

  const fetchGifs = async (offset) => {
    return gf.search(value, { offset, limit: 10 });
  };

  const debouncedFetchGifs = _.debounce(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const initialGifs = await fetchGifs(0);
      setGifs(initialGifs.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, 500);

  useEffect(() => {
    // fetch GIFs based on the search terms
    const fetchInitialGifs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const initialGifs = await fetchGifs(0);
        setGifs(initialGifs.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialGifs();
  }, []);

  const handleGifClick = (gif, e) => {
    e.preventDefault();
    console.log(gif);
    let gifUrl = gif.images.original.url;
    console.log(gifUrl);

    dispatch(toggleGifModal({
      value: true,
      url: gifUrl,
    }));
  };

  return (
    <div ref={gridRef} className="w-full mt-3">
      <input
        type="text"
        placeholder="Search for GIF.."
        className="border dark:border-strokedark bg-transparent border-stroke rounded-md p-2 w-full mb-2 outline-none"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          debouncedFetchGifs();
        }}
      />

      {isLoading && <p>Loading GIFs...</p>}
      {error && <p className="text-red">Error : {error} </p>}

      <div className="h-48 overflow-auto no-scrollbar">
        {gifs.length > 0 ?<Grid
          width={gridRef.current?.offsetWidth}
          columns={8}
          gutter={6}
          fetchGifs={fetchGifs}
          key={value}
          onGifClick={handleGifClick}
          data={gifs}
        /> : <div className="flex flex-col space-y-2 items-center justify-center h-full"> 
            <MagnifyingGlassIcon size={48} weight="bold"></MagnifyingGlassIcon>
            <span className="text-xl text-body dark:text-white font-semibold">Search for your GIFs.</span>
            </div>}
      </div>
    </div>
  );
}
