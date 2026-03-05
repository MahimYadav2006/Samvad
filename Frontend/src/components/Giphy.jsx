import React, { useCallback, useEffect, useRef, useState } from "react";
import { Grid } from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";
import debounce from "lodash/debounce";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useDispatch } from "react-redux";
import { toggleGifModal } from "../redux/slices/app";
import { getPublicEnv } from "../utils/runtimeConfig";

const gf = new GiphyFetch(
  getPublicEnv("VITE_GIPHY_API_KEY") || "hOJ2C21sKprFvw6ocLv58dqYOacEzfF5"
);

export default function Giphy() {
  const dispatch = useDispatch();
  const gridRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(null);
  const [gifs, setGifs] = useState([]);

  const fetchGifs = useCallback(
    (offset) => gf.search(value || "trending", { offset, limit: 10 }),
    [value]
  );

  const debouncedSearch = useCallback(
    debounce(async (searchValue) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await gf.search(searchValue || "trending", {
          offset: 0,
          limit: 10,
        });
        setGifs(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  useEffect(() => {
    const loadInitial = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await gf.search("trending", { offset: 0, limit: 10 });
        setGifs(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitial();
  }, []);

  const handleGifClick = (gif, e) => {
    e.preventDefault();
    const gifUrl = gif.images.original.url;
    dispatch(toggleGifModal({ value: true, url: gifUrl }));
  };

  return (
    <div ref={gridRef} className="w-full mt-3">
      <input
        type="text"
        placeholder="Search for GIF..."
        className="w-full rounded-xl border border-stroke bg-transparent p-2.5 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          debouncedSearch(e.target.value);
        }}
      />

      {isLoading && (
        <p className="py-2 text-center text-sm text-body dark:text-bodydark">
          Loading GIFs...
        </p>
      )}
      {error && (
        <p className="py-2 text-center text-sm text-red">Error: {error}</p>
      )}

      <div className="mt-2 h-48 overflow-auto no-scrollbar rounded-xl">
        {gifs.length > 0 ? (
          <Grid
            width={gridRef.current?.offsetWidth || 300}
            columns={8}
            gutter={6}
            fetchGifs={fetchGifs}
            key={value}
            onGifClick={handleGifClick}
            data={gifs}
          />
        ) : (
          !isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <MagnifyingGlassIcon
                size={36}
                weight="bold"
                className="text-bodydark2"
              />
              <span className="text-sm font-semibold text-body dark:text-bodydark">
                Search for your GIFs
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
