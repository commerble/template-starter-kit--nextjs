import useSWR from 'swr';
import { CommerbleContext, CommerbleRouting } from '../libs/commerble';
import '../styles/globals.css'

const fetcher =  (...args) => fetch(...args).then(res => res.json());
function MyApp({ Component, pageProps }) {
  const { data:commerblePublicConfig } = useSWR('/api/ec/config', fetcher);
  return (
    <CommerbleContext.Provider value={commerblePublicConfig}>
      <CommerbleRouting>
        <Component {...pageProps} />
        <svg width="0" height="0" className="absolute">
          <clipPath id="squircle" clipPathUnits="objectBoundingBox">
            <path fill="red" stroke="none" d="M 0,0.5 C 0,0 0,0 0.5,0 S 1,0 1,0.5 1,1 0.5,1 0,1 0,0.5" />
          </clipPath>
        </svg>
      </CommerbleRouting>
    </CommerbleContext.Provider>
  );
}

export default MyApp
