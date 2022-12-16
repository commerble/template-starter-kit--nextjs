import { CommerbleRouting } from '../libs/commerble';
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
      <>
        <CommerbleRouting>
          <Component {...pageProps} />
        </CommerbleRouting>
        <svg width="0" height="0" className="absolute">
          <clipPath id="squircle" clipPathUnits="objectBoundingBox">
            <path fill="red" stroke="none" d="M 0,0.5 C 0,0 0,0 0.5,0 S 1,0 1,0.5 1,1 0.5,1 0,1 0,0.5" />
          </clipPath>
        </svg>
      </>
  );
}

export default MyApp
